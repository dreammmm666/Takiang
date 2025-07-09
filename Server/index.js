const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const session = require('express-session');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false },
}));

// Database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "takiang1"
});

db.connect((err) => {
  if (err) {
    console.error('DB connection error:', err);
  } else {
    console.log('DB connected');
  }
});

// Helper function
const formatDate = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toISOString().split('T')[0]; // ตัดเวลาออก
};

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  console.log('➡️ Login attempt:', username);

  if (!username || !password) {
    return res.status(400).send('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
  }

  db.query('SELECT * FROM agents WHERE username = ?', [username], (err, results) => {
    if (err) {
      console.error('❌ DB query error:', err);
      return res.status(500).send('Database error');
    }

    if (results.length === 0) {
      return res.status(401).send('ชื่อผู้ใช้ไม่ถูกต้อง');
    }

    const user = results[0];
    console.log('🔍 DB user:', user);

    if (password === user.password) {
      req.session.userId = user.agent_id;
      req.session.teamId = user.team_id;

      console.log('✅ Login success:', user.username);
      return res.json({
        success: true,
        agent_id: user.agent_id,      // เพิ่มตรงนี้
        agent_name: user.agent_name,
        team_id: user.team_id
      });
    } else {
      return res.status(401).send('รหัสผ่านไม่ถูกต้อง');
    }
  });
});



// Create work
app.post('/work', (req, res) => {
  const {
    project_name,  assigned_to, work_type,
    details, reference_file_url, due_date, status, priority, price
  } = req.body;

  const sql = `
    INSERT INTO work 
    (project_name,  assigned_to, work_type, details, reference_file_url, due_date, status, priority, price)
    VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [
    project_name,
    
    assigned_to,
    work_type,
    details,
    reference_file_url,
    due_date,
    status,
    priority,
    price
  ], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true });
  });
});

// ✅ สร้างยูสเซอร์และเก็บ log
app.post('/agents', (req, res) => {
  let { agent_name, username, password, team_id, created_by } = req.body;

  // team_id = null ถ้าไม่ระบุ
  if (team_id === '' || team_id === undefined) {
    team_id = null;
  } else {
    team_id = parseInt(team_id);
  }

  const sql = `
    INSERT INTO agents (agent_name, username, password, team_id)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [agent_name, username, password, team_id], (err, result) => {
    if (err) {
      console.error('❌ Insert agent failed:', err);
      return res.status(500).json({ success: false, message: err.message });
    }

    const newAgentId = result.insertId;
    console.log(`✅ Agent created: ID ${newAgentId}`);

    // ✅ Insert log
    const logSql = `
      INSERT INTO activity_logs (agent_id, action_type, table_name, record_id, old_data, new_data)
      VALUES (?, 'CREATE', 'agents', ?, NULL, ?)
    `;
    const newData = JSON.stringify({ agent_name, username, password, team_id });

    db.query(logSql, [created_by || null, newAgentId, newData], (logErr) => {
      if (logErr) {
        console.error('⚠️ Failed to log creation:', logErr);
        // ไม่หยุดการทำงานถ้า log ล้มเหลว
      }
    });

    res.json({ success: true, agent_id: newAgentId });
  });
});


// Get all works
app.get('/works', (req, res) => {
  db.query('SELECT * FROM work', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Update work by ID
app.put('/works/:id', (req, res) => {
  const { id } = req.params;
  const {
    project_name,  assigned_to, work_type,
    details, reference_file_url, due_date, status, priority, price
  } = req.body;

  const formattedDueDate = formatDate(due_date);

  const sql = `
    UPDATE work 
    SET project_name = ?, assigned_to = ?, work_type = ?,
        details = ?, reference_file_url = ?, due_date = ?, status = ?, priority = ?, price = ?
    WHERE work_id = ?
  `;

  db.query(sql, [
    project_name,
    
    assigned_to,
    work_type,
    details,
    reference_file_url,
    formattedDueDate,
    status,
    priority,
    price,
    id
  ], (err, result) => {
    if (err) {
      console.error('❌ UPDATE ERROR:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
    res.json({ success: true });
  });
});

// Start server
app.listen(3001, () => {
  console.log('Server running on port 3001');
});


app.post('/sync-work/:id', (req, res) => {
  const workId = req.params.id;
  const table = req.body.table;

  if (!['graphic', 'marketing', 'admin'].includes(table)) {
    return res.status(400).json({ success: false, message: 'ตารางไม่ถูกต้อง' });
  }

  const procedure =
    table === 'graphic'
      ? 'sync_work_to_graphic'
      : table === 'marketing'
      ? 'sync_work_to_marketing'
      : 'sync_to_admin';

  const sql = `CALL ${procedure}(?)`;

  db.query(sql, [workId], (err, result) => {
    if (err) {
      console.error('Sync failed:', err);
      return res.status(500).json({ success: false, message: 'Sync failed' });
    }
    res.json({ success: true });
  });
});

//จอย2ตาราง project,ustomers
app.get('/api/projects_table', (req, res) => {
  const sql = `
    SELECT 
      p.project_id,
      p.project_name,
      p.description,
      p.status,
      p.deadline,
      p.project_price,
      c.customer_name,
      c.phone,
      c.other_contact
    FROM projects p
    JOIN customers c ON p.customer_id = c.customer_id
    ORDER BY p.created_at DESC
  `;

  db.query(sql, (err, projects) => {
    if (err) {
      console.error('❌ Database query error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (projects.length === 0) return res.json([]);

    const projectIds = projects.map(p => p.project_id);

    const taskStatsSql = `
      SELECT 
        project_id,
        COUNT(*) AS total_tasks,
        SUM(CASE WHEN LOWER(TRIM(status)) = 'completed' THEN 1 ELSE 0 END) AS completed_tasks
      FROM tasks
      WHERE project_id IN (?)
      GROUP BY project_id
    `;

    db.query(taskStatsSql, [projectIds], (err2, taskStats) => {
      if (err2) {
        console.error('❌ Error fetching task stats:', err2);
        return res.status(500).json({ error: 'Error fetching task stats' });
      }

      console.log('🔍 taskStats:', taskStats);

      
      return res.json(projects);
    });
  });
});











app.get('/api/marketing_work_with_details', (req, res) => {
  db.query('SELECT * FROM marketing_work', (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

app.delete('/api/graphic_work/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'DELETE FROM graphic_work WHERE work_id = ?';
  
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
    res.status(200).json({ message: 'ลบสำเร็จ' });
  });
});



app.delete('/api/marketing_work/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'DELETE FROM marketing_work WHERE work_id = ?';

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'ลบไม่สำเร็จ', error: err });
    res.status(200).json({ message: 'ลบสำเร็จ' });
  });
});

app.delete('/api/work/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'DELETE FROM work WHERE work_id = ?';

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'ลบไม่สำเร็จ', error: err });
    res.status(200).json({ message: 'ลบสำเร็จ' });
  });
});




app.get('/api/adminWorkTable', (req, res) => {
  db.query('SELECT * FROM admin_work', (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

app.delete('/api/admin_work/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'DELETE FROM admin_work WHERE work_id = ?';
  
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
    res.status(200).json({ message: 'ลบสำเร็จ' });
  });
});





app.put('/api/update_status/:id', (req, res) => {
  const workId = req.params.id;
  const { status } = req.body;

  const updateGraphicWork = 'UPDATE graphic_work SET status = ? WHERE work_id = ?';
  const updateMainWork = 'UPDATE work SET status = ? WHERE work_id = ?';

  db.query(updateGraphicWork, [status, workId], (err1, result1) => {
    if (err1) {
      console.error('Error updating graphic_work:', err1);
      return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดต graphic_work' });
    }

    db.query(updateMainWork, [status, workId], (err2, result2) => {
      if (err2) {
        console.error('Error updating work:', err2);
        return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดต work' });
      }

      res.json({ message: 'อัปเดตสถานะทั้ง graphic_work และ work สำเร็จแล้ว' });
    });
  });
});


app.put('/api/update_status/:id', (req, res) => {
  const workId = req.params.id;
  const { status } = req.body;

  const updateMarketingWork = 'UPDATE marketing_work SET status = ? WHERE work_id = ?';
  const updateMainWork = 'UPDATE work SET status = ? WHERE work_id = ?';

  db.query(updateMarketingWork, [status, workId], (err1) => {
    if (err1) {
      console.error('❌ Error updating marketing_work:', err1);
      return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดต marketing_work' });
    }

    db.query(updateMainWork, [status, workId], (err2) => {
      if (err2) {
        console.error('❌ Error updating work:', err2);
        return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดต work' });
      }

      res.json({ message: 'อัปเดตสถานะทั้ง marketing_work และ work สำเร็จแล้ว' });
    });
  });
});


app.put('/api/update_status/:id', (req, res) => {
  const workId = req.params.id;
  const { status } = req.body;

  const updateAdminWork = 'UPDATE admin_work SET status = ? WHERE work_id = ?';
  const updateMainWork = 'UPDATE work SET status = ? WHERE work_id = ?';

  db.query(updateAdminWork, [status, workId], (err1) => {
    if (err1) {
      console.error('❌ Error updating admin_work:', err1);
      return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดต admin_work' });
    }

    db.query(updateMainWork, [status, workId], (err2) => {
      if (err2) {
        console.error('❌ Error updating work:', err2);
        return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดต work' });
      }

      res.json({ message: 'อัปเดตสถานะทั้ง admin_work และ work สำเร็จแล้ว' });
    });
  });
});




app.get('/api/work/search', (req, res) => {
  const { keyword } = req.query;

  let sql = `SELECT * FROM work WHERE 1=1`;
  let params = [];

  if (keyword) {
    sql += ` AND (
      project_name LIKE ? OR
      assigned_to LIKE ? OR
      work_type LIKE ?
    )`;
    const likeKeyword = `%${keyword}%`;
    params.push(likeKeyword, likeKeyword, likeKeyword);
  }

  sql += ` ORDER BY due_date ASC LIMIT 100`;

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Search query error:', err);
      return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการค้นหา' });
    }
    res.json(results);
  });
});



app.post('/api/projects', (req, res) => {
  
  const {
    customer_name,
    phone,
    other_contact,
    project_name,
    description,
    status,
    deadline,
    project_price,
  } = req.body;

  // สมมติว่ามีตาราง customers กับ projects
  // 1. insert customers ก่อน
  const sqlInsertCustomer = `INSERT INTO customers (customer_name, phone, other_contact) VALUES (?, ?, ?)`;
  db.query(sqlInsertCustomer, [customer_name, phone, other_contact], (err, customerResult) => {
    if (err) {
      console.error('Insert customer error:', err);
      return res.status(500).json({ error: 'ไม่สามารถเพิ่มลูกค้าได้' });
    }

    const customerId = customerResult.insertId;

    // 2. insert projects โดยเชื่อมกับ customer_id
    const sqlInsertProject = `
      INSERT INTO projects (project_name, description, customer_id, status, deadline, project_price)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(sqlInsertProject, [project_name, description, customerId, status, deadline, project_price], (err, projectResult) => {
      if (err) {
        console.error('Insert project error:', err);
        return res.status(500).json({ error: 'ไม่สามารถเพิ่มโปรเจคได้' });
      }

      res.json({ message: 'บันทึกข้อมูลเรียบร้อย' });
    });
  });
});


//บันทึกtask

app.post('/api/tasks', (req, res) => {
  const { project_id, task_name, task_description, status, due_date } = req.body;

  if (!project_id || !task_name || !status) {
    return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
  }

  const sql = `
    INSERT INTO tasks (project_id, task_name, task_description, status, due_date)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [project_id, task_name, task_description, status, due_date], (err, result) => {
    if (err) {
      console.error('Error inserting task:', err);
      return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
    }
    res.json({ success: true, message: 'เพิ่ม Task สำเร็จ', task_id: result.insertId });
  });
});

// GET 
app.get('/api/projects/in-progress', (req, res) => {
  const sql = `
    SELECT project_id, project_name
    FROM projects
    WHERE status = 'In progress'
    ORDER BY created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error loading in-progress projects:', err);
      return res.status(500).json({ error: 'ไม่สามารถโหลดโปรเจกต์ได้' });
    }
    res.json(results);
  });
});

//บันทึกsubtask
app.post('/api/sub_tasks', (req, res) => {
  const { sub_task_name, sub_task_description, task_id, assigned_team_id, assigned_agent_id, status, due_date } = req.body;

  const sql = `
    INSERT INTO sub_tasks (sub_task_name, sub_task_description, task_id, assigned_team_id, assigned_agent_id, status, due_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [sub_task_name, sub_task_description, task_id, assigned_team_id, assigned_agent_id, status, due_date], (err, result) => {
    if (err) {
      console.error('Error inserting sub_task:', err);
      return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
    }
    res.json({ success: true, message: 'เพิ่ม Sub_Task สำเร็จ', sub_task_id: result.insertId });
  });
});


// ดึง Agents พร้อมข้อมูลทีม (agent_id, agent_name, team_id, team_name)
app.get('/api/agents', (req, res) => {
  const sql = `
    SELECT 
      a.agent_id,
      a.agent_name,
      tm.team_id,
      tm.team_name
    FROM agents a
    JOIN teams tm ON a.team_id = tm.team_id
    ORDER BY a.agent_name ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// ดึง Tasks (งานหลัก)
app.get('/api/tasks', (req, res) => {
  const sql = `
    SELECT task_id, task_name
    FROM tasks
    WHERE status = 'In progress'
    ORDER BY task_name ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// ดึง Teams (ทีมทั้งหมด)
app.get('/api/teams', (req, res) => {
  const sql = `
    SELECT team_id, team_name FROM teams ORDER BY team_name ASC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// POST บันทึก SubTask
app.post('/api/sub_tasks', (req, res) => {
  const { sub_task_name, sub_task_description, task_id, assigned_team_id, assigned_agent_id, status, due_date } = req.body;

  const sql = `
    INSERT INTO sub_tasks 
      (sub_task_name, sub_task_description, task_id, assigned_team_id, assigned_agent_id, status, due_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [sub_task_name, sub_task_description, task_id, assigned_team_id, assigned_agent_id, status, due_date], (err, result) => {
    if (err) {
      console.error('Error inserting sub_task:', err);
      return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
    }
    res.json({ success: true, message: 'เพิ่ม SubTask สำเร็จ', sub_task_id: result.insertId });
  });
});



app.get('/api/task-details/:project_id', (req, res) => {
  const projectId = req.params.project_id;

  const sql = `
    SELECT
      t.task_id,
      t.task_name,
      t.status AS task_status,
      st.sub_task_id,
      st.sub_task_name,
      st.status AS sub_status,
      st.due_date,
      a.agent_id,
      a.agent_name,
      tm.team_id,
      tm.team_name
    FROM tasks t
    LEFT JOIN sub_tasks st ON st.task_id = t.task_id
    LEFT JOIN agents a ON st.assigned_agent_id = a.agent_id
    LEFT JOIN teams tm ON a.team_id = tm.team_id
    WHERE t.project_id = ?
    ORDER BY t.task_id DESC, st.sub_task_id ASC
  `;

  db.query(sql, [projectId], (err, results) => {
    if (err) {
      console.error('❌ Database error:', err);
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' });
    }

    const taskMap = {};

    results.forEach(row => {
      if (!taskMap[row.task_id]) {
        taskMap[row.task_id] = {
          task_id: row.task_id,
          task_name: row.task_name,
          status: row.task_status,
          sub_tasks: []
        };
      }

      if (row.sub_task_id) {
        taskMap[row.task_id].sub_tasks.push({
          sub_task_id: row.sub_task_id,
          sub_task_name: row.sub_task_name,
          status: row.sub_status,
          due_date: row.due_date,
          agent_id: row.agent_id,
          agent_name: row.agent_name,
          team_id: row.team_id,
          team_name: row.team_name
        });
      }
    });

    const tasksToUpdate = [];

    Object.values(taskMap).forEach(task => {
      const allCompleted = task.sub_tasks.length > 0 &&
        task.sub_tasks.every(sub => sub.status === 'Completed');

      if (allCompleted && task.status !== 'Completed') {
        tasksToUpdate.push(task.task_id);
        task.status = 'Completed'; // อัปเดตใน response ด้วย
      }
    });

    // อัปเดต Task เป็น Completed ถ้ามี
    const updateTasksPromise = tasksToUpdate.length > 0
      ? new Promise((resolve, reject) => {
          const updateSql = `UPDATE tasks SET status = 'Completed' WHERE task_id IN (?)`;
          db.query(updateSql, [tasksToUpdate], (updateErr) => {
            if (updateErr) {
              reject(updateErr);
            } else {
              resolve();
            }
          });
        })
      : Promise.resolve();

    updateTasksPromise
      .then(() => {
        // เช็ค Task สถานะทั้งหมดของโปรเจคอีกครั้ง
        const checkProjectStatusSql = `
          SELECT COUNT(*) AS total_tasks,
                 SUM(CASE WHEN LOWER(TRIM(status)) = 'completed' THEN 1 ELSE 0 END) AS completed_tasks
          FROM tasks WHERE project_id = ?
        `;

        db.query(checkProjectStatusSql, [projectId], (err2, stats) => {
          if (err2) {
            console.error('❌ Error checking project task status:', err2);
            return res.status(500).json({ error: 'Error checking project task status' });
          }

          if (stats.length > 0) {
            const { total_tasks, completed_tasks } = stats[0];

            if (total_tasks > 0 && total_tasks === completed_tasks) {
              // อัปเดตสถานะโปรเจคเป็น Completed
              const updateProjectSql = `
                UPDATE projects
                SET status = 'Completed'
                WHERE project_id = ? AND LOWER(TRIM(status)) <> 'completed'
              `;

              db.query(updateProjectSql, [projectId], (err3) => {
                if (err3) {
                  console.error('❌ Error updating project status:', err3);
                  return res.status(500).json({ error: 'Error updating project status' });
                }
                // ส่ง response กลับพร้อมข้อมูล Task และ SubTask ที่อัปเดตแล้ว
                res.json(Object.values(taskMap));
              });
            } else {
              // ถ้าไม่ครบ ก็ส่ง response ตามปกติ
              res.json(Object.values(taskMap));
            }
          } else {
            res.json(Object.values(taskMap));
          }
        });
      })
      .catch(updateErr => {
        console.error('❌ Error updating tasks:', updateErr);
        res.status(500).json({ error: 'Error updating tasks' });
      });
  });
});





//ตารางงานการตลาด
app.get('/api/maketing_table', (req, res) => {
  const sql = `
    SELECT 
      p.project_id,
      p.project_name,
      p.description,
      p.status,
      p.deadline,
      p.project_price,
      c.customer_name,
      c.phone,
      c.other_contact
    FROM projects p
    JOIN customers c ON p.customer_id = c.customer_id
    ORDER BY p.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

//อัพเดต
app.put('/api/projects/:id', (req, res) => {
  const projectId = req.params.id;
  const {
    project_name,
    description,
    status,
    deadline,
    project_price,
    customer_name,
    phone,
    other_contact
  } = req.body;

  // Step 1: อัปเดต " " ก่อน (ถ้ามีความเปลี่ยนแปลง)
  const updateCustomerSql = `
    UPDATE customers c
    JOIN projects p ON c.customer_id = p.customer_id
    SET c.customer_name = ?, c.phone = ?, c.other_contact = ?
    WHERE p.project_id = ?
  `;

  db.query(updateCustomerSql, [customer_name, phone, other_contact, projectId], (err) => {
    if (err) {
      console.error('Error updating customer:', err);
      return res.status(500).json({ success: false, message: 'ไม่สามารถอัปเดตข้อมูลลูกค้า' });
    }

    // Step 2: อัปเดต " "
    const updateProjectSql = `
      UPDATE projects
      SET 
        project_name = ?,
        description = ?,
        status = ?,
        deadline = ?,
        project_price = ?
      WHERE project_id = ?
    `;

    db.query(updateProjectSql, [project_name, description, status, deadline, project_price, projectId], (err) => {
      if (err) {
        console.error('Error updating project:', err);
        return res.status(500).json({ success: false, message: 'ไม่สามารถอัปเดตโปรเจกต์' });
      }

      res.json({ success: true });
    });
  });
});

//วิวการตลาด 
 app.get('/api/marketing-table', (req, res) => {
  const sql = 'SELECT * FROM view_tbmarketing';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error fetching data:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.json(results);
  });
});

//วิวกราฟิก
 app.get('/api/graphic-table', (req, res) => {
  const sql = 'SELECT * FROM view_tbgraphic';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error fetching data:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.json(results);
  });
});


//วิวแอดมิน
 app.get('/api/view_tbadmin', (req, res) => {
  const sql = "SELECT * FROM view_tbadmin WHERE team_name = 'admin'";

  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error fetching data:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.json(results);
  });
});


// รายบุคคล
// ดึงข้อมูลจาก view_agent_tasks ตาม agent_id
// สมมติคุณมีตัวแปร db คือ connection ของ MySQL

// ดึงข้อมูลงานย่อยตาม agent_name
// ดึงงานของฉัน
// ✅ ใช้ agent_name แทน agent_id
// โหลดงานของ agent
app.get('/api/mywork', (req, res) => {
  const agentId = req.query.agent_id;

  if (!agentId) {
    return res.status(400).json({ error: 'agent_id is required' });
  }

  const sql = `SELECT * FROM view_tbagent WHERE agent_id = ? ORDER BY due_date ASC`;

  db.query(sql, [agentId], (err, results) => {
    if (err) {
      console.error('❌ Error fetching tasks:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// อัปเดตสถานะ + log
app.patch('/api/subtask/status', (req, res) => {
  const { sub_task_id, status, agent_id } = req.body;

  // ดึงข้อมูลเก่าทั้งหมดของ sub_task
  const getOldSql = 'SELECT * FROM sub_tasks WHERE sub_task_id = ?';

  db.query(getOldSql, [sub_task_id], (err, oldResults) => {
    if (err) {
      console.error('❌ ดึงข้อมูลเก่าล้มเหลว:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (oldResults.length === 0) {
      return res.status(404).json({ error: 'ไม่พบซับทาร์ก' });
    }

    const oldData = JSON.stringify(oldResults[0]);  // ข้อมูลเก่าทั้งหมด
    const newData = JSON.stringify({ status });     // ข้อมูลใหม่ที่อัปเดต

    const updateSql = 'UPDATE sub_tasks SET status = ? WHERE sub_task_id = ?';

    db.query(updateSql, [status, sub_task_id], (updateErr) => {
      if (updateErr) {
        console.error('❌ อัปเดตสถานะล้มเหลว:', updateErr);
        return res.status(500).json({ error: 'Failed to update status' });
      }

      // บันทึก log
      const logSql = `
        INSERT INTO activity_logs (agent_id, action_type, table_name, record_id, old_data, new_data)
        VALUES (?, 'UPDATE', 'sub_tasks', ?, ?, ?)
      `;

      db.query(logSql, [agent_id || null, sub_task_id, oldData, newData], (logErr) => {
        if (logErr) {
          console.error('⚠️ บันทึก log ล้มเหลว:', logErr);
          // ไม่หยุด API แม้ log ล้มเหลว
        }
        res.json({ success: true, message: 'อัปเดตสถานะสำเร็จ' });
      });
    });
  });
});








//
app.get('/api/activity-logs', (req, res) => {
  const sql = `
    SELECT 
      al.log_id,
      al.agent_id,
      ag.agent_name,
      al.action_type,
      al.table_name,
      al.record_id,
      al.old_data,
      al.new_data,
      al.log_time
    FROM activity_logs al
    LEFT JOIN agents ag ON al.agent_id = ag.agent_id
    ORDER BY al.log_time DESC
    LIMIT 100
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error fetching activity logs:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});




//ล่าสุด
app.get('/api/mywork/with-submits', (req, res) => {
  const agentId = req.query.agent_id;

  if (!agentId) {
    return res.status(400).json({ error: 'agent_id is required' });
  }

  const sql = `
    SELECT 
      s.sub_task_id,
      s.sub_task_name,
      s.status AS sub_task_status,
      s.task_id,
      s.assigned_agent_id,
      p.project_name,
      t.task_name,
      (
        SELECT COUNT(*) FROM submitted_works sw WHERE sw.sub_task_id = s.sub_task_id AND sw.agent_id = ?
      ) AS submit_count
    FROM sub_tasks s
    JOIN tasks t ON s.task_id = t.task_id
    JOIN projects p ON t.project_id = p.project_id
    WHERE s.assigned_agent_id = ?
    ORDER BY s.due_date ASC
  `;

  db.query(sql, [agentId, agentId], (err, results) => {
    if (err) {
      console.error('❌ Error fetching mywork with submits:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// นับจำนวนส่งงาน (submit) ของ sub_task_id และ agent_id
app.get('/api/submitted-count', (req, res) => {
  const { sub_task_id, agent_id } = req.query;

  if (!sub_task_id || !agent_id) {
    return res.status(400).json({ error: 'sub_task_id and agent_id are required' });
  }

  const sql = `
    SELECT COUNT(*) AS count
    FROM submitted_works
    WHERE sub_task_id = ? AND agent_id = ?
  `;

  db.query(sql, [sub_task_id, agent_id], (err, results) => {
    if (err) {
      console.error('❌ Error counting submissions:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ count: results[0].count });
  });
});

// บันทึกการส่งงาน (submit) ใหม่ (ไม่เกิน 3 รอบ)
app.post('/api/submit-work', (req, res) => {
  const { sub_task_id, agent_id, submit_link } = req.body;

  if (!sub_task_id || !agent_id || !submit_link) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบ' });
  }

  // เช็คจำนวนรอบส่งงานก่อน (นับจาก submitted_works)
  const countSql = `SELECT COUNT(*) AS count FROM submitted_works WHERE sub_task_id = ? AND agent_id = ?`;
  db.query(countSql, [sub_task_id, agent_id], (err, result) => {
    if (err) {
      console.error('Error counting submits:', err);
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
    }

    const submitCount = result[0].count;
    if (submitCount >= 3) {
      return res.status(400).json({ error: 'ส่งงานเกิน 3 รอบแล้ว' });
    }

    // insert ส่งงานรอบใหม่
    const insertSql = `
      INSERT INTO submitted_works (sub_task_id, agent_id, submit_round, submit_time, file_path)
      VALUES (?, ?, ?, NOW(), ?)
    `;

    db.query(insertSql, [sub_task_id, agent_id, submitCount + 1, submit_link], (err2, result2) => {
      if (err2) {
        console.error('Error inserting submit:', err2);
        return res.status(500).json({ error: 'บันทึกส่งงานล้มเหลว' });
      }

      res.json({ message: 'ส่งงานสำเร็จ', round: submitCount + 1 });
    });
  });
});

// สมมติ db คือ connection MySQL
app.get('/api/review-status', (req, res) => {
  const agentId = req.query.agent_id;

  if (!agentId) {
    return res.status(400).json({ error: 'agent_id is required' });
  }

  const sql = `
    SELECT 
      s.sub_task_id,
      s.sub_task_name,
      s.status AS sub_task_status,
      s.assigned_agent_id,
      a.agent_name,
      t.task_name,
      p.project_name,
      (
        SELECT CONCAT('[', GROUP_CONCAT(
          JSON_OBJECT(
            'submit_id', sw.submit_id,
            'submit_round', sw.submit_round,
            'submit_time', sw.submit_time,
            'file_path', sw.file_path,
            'note', sw.note,
            'review_status', sw.status
          )
          ORDER BY sw.submit_round ASC
        ), ']')
        FROM submitted_works sw
        WHERE sw.sub_task_id = s.sub_task_id
      ) AS submitted_works_json
    FROM sub_tasks s
    LEFT JOIN agents a ON s.assigned_agent_id = a.agent_id
    JOIN tasks t ON s.task_id = t.task_id
    JOIN projects p ON t.project_id = p.project_id
    WHERE s.assigned_agent_id = ?
  `;

  db.query(sql, [agentId], (err, results) => {
    if (err) {
      console.error('❌ SQL Error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    try {
      const data = results.map(row => {
        let parsedSubmits = [];
        if (row.submitted_works_json) {
          try {
            parsedSubmits = JSON.parse(row.submitted_works_json);
          } catch (e) {
            console.warn('⚠️ JSON parse failed:', row.submitted_works_json);
          }
        }
        return {
          sub_task_id: row.sub_task_id,
          sub_task_name: row.sub_task_name,
          sub_task_status: row.sub_task_status,
          assigned_agent_id: row.assigned_agent_id,
          agent_name: row.agent_name,
          task_name: row.task_name,
          project_name: row.project_name,
          submitted_works: parsedSubmits
        };
      });

      res.json(data);
    } catch (jsonErr) {
      console.error('❌ JSON processing error:', jsonErr);
      res.status(500).json({ error: 'JSON parsing error' });
    }
  });
});



app.get('/api/reviewer/submitted-works', (req, res) => {
  const sql = `
    SELECT
      sw.submit_id,
      sw.submit_round,
      sw.submit_time,
      sw.file_path,
      sw.note,
      sw.status,
      s.sub_task_id,
      s.sub_task_name,
      s.assigned_agent_id,
      a.agent_name AS assigned_agent_name,
      t.task_name,
      p.project_name,
      team.team_name
    FROM submitted_works sw
    JOIN sub_tasks s ON sw.sub_task_id = s.sub_task_id
    LEFT JOIN agents a ON s.assigned_agent_id = a.agent_id
    JOIN tasks t ON s.task_id = t.task_id
    JOIN projects p ON t.project_id = p.project_id
    LEFT JOIN teams team ON a.team_id = team.team_id
    ORDER BY sw.submit_time DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ SQL Error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);  // ส่ง array กลับ client
  });
});

app.put('/api/reviewer/submitted-works/:submit_id', (req, res) => {
  const submitId = req.params.submit_id;
  const { review_status, note } = req.body;

  
  const sql = `
    UPDATE submitted_works
    SET status = ?, note = ?
    WHERE submit_id = ?
  `;

  db.query(sql, [review_status, note, submitId], (err, result) => {
    if (err) {
      console.error('SQL error:', err);
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'ไม่พบงานที่ส่งตรวจที่ต้องการอัปเดต' });
    }

    res.json({ message: 'อัปเดตสถานะสำเร็จ' });
    
  });
});





// PUT /api/update-subtask-status/:sub_task_id
app.put('/api/update-subtask-status/:sub_task_id', (req, res) => {
  const { sub_task_id } = req.params;
  const { status, agent_id } = req.body;

  // ดึงข้อมูลเดิมก่อน
  const selectSql = `
    SELECT status 
    FROM sub_tasks 
    WHERE sub_task_id = ?
  `;

  db.query(selectSql, [sub_task_id], (selectErr, selectResult) => {
    if (selectErr) {
      console.error('❌ ดึงข้อมูลเดิมล้มเหลว:', selectErr);
      return res.status(500).json({ success: false, message: 'ดึงข้อมูลเดิมล้มเหลว' });
    }

    if (selectResult.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบ sub_task ที่ระบุ' });
    }

    const oldData = JSON.stringify({ status: selectResult[0].status });

    // ทำการอัปเดตสถานะ
    const updateSql = `
      UPDATE sub_tasks
      SET status = ?
      WHERE sub_task_id = ?
    `;

    db.query(updateSql, [status, sub_task_id], (updateErr, updateResult) => {
      if (updateErr) {
        console.error('❌ อัปเดตสถานะล้มเหลว:', updateErr);
        return res.status(500).json({ success: false, message: 'อัปเดตล้มเหลว' });
      }

      // บันทึก log
      const logSql = `
        INSERT INTO activity_logs (agent_id, action_type, table_name, record_id, old_data, new_data)
        VALUES (?, 'UPDATE', 'sub_tasks', ?, ?, ?)
      `;

      const newData = JSON.stringify({ status });

      db.query(logSql, [agent_id || null, sub_task_id, oldData, newData], (logErr) => {
        if (logErr) {
          console.error('⚠️ ล็อกข้อมูลล้มเหลว:', logErr);
          // ไม่หยุดการทำงานแม้ log จะ fail
        }
      });

      return res.json({ success: true, message: 'อัปเดตสถานะสำเร็จ' });
    });
  });
});



