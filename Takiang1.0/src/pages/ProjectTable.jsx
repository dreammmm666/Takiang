import React, { useEffect, useState } from 'react';
import '../Css/WorkTable.css';
import NevbarV2 from '../component/NevbarV2';

const ProjectTable = () => {
  const [graphicWorks, setGraphicWorks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showModal, setShowModal] = useState(false);
  const [editingWork, setEditingWork] = useState(null);

  const [taskDetails, setTaskDetails] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);

  useEffect(() => {
  setLoading(true);
  fetch('http://localhost:3001/api/projects_table')
    .then(res => {
      if (!res.ok) throw new Error('ไม่สามารถโหลดข้อมูลได้');
      return res.json();
    })
    .then(data => {
      // แปลงสถานะให้ตรงกับ ENUM
      const formattedData = data.map(project => {
        const status = project.status?.trim();
        return {
          ...project,
          status: status === 'Completed' ? 'Completed' : 'In progress'
        };
      });
      setGraphicWorks(formattedData);
      setLoading(false);
      setError(null);
    })
    .catch(err => {
      setError(err.message);
      setLoading(false);
    });
}, []);

  const formatDate = (iso) => {
    if (!iso) return '';
    const date = new Date(iso);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  };

  const formatDateDisplay = (isoDate) => {
    if (!isoDate) return '-';
    const date = new Date(isoDate);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const handleEdit = (work) => {
    setEditingWork({ ...work, deadline: formatDate(work.deadline) });
    setShowModal(true);
  };

  const handleCheckTask = async (project_id) => {
    try {
      const res = await fetch(`http://localhost:3001/api/task-details/${project_id}`);
      if (!res.ok) throw new Error('ไม่พบข้อมูล Task');
      const data = await res.json();
      setTaskDetails(data);
      setShowTaskModal(true);
    } catch (err) {
      alert('ไม่สามารถโหลดข้อมูล Task ได้');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingWork(null);
  };

  const handleCloseTaskModal = () => {
    setShowTaskModal(false);
    setTaskDetails([]);
  };

  const handleSaveEdit = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/projects/${editingWork.project_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingWork),
      });

      const data = await res.json();
      if (data.success) {
        alert('บันทึกข้อมูลสำเร็จ');
        setGraphicWorks(prev =>
          prev.map(work =>
            work.project_id === editingWork.project_id ? editingWork : work
          )
        );
        handleCloseModal();
      } else {
        alert('เกิดข้อผิดพลาด: ' + data.message);
      }
    } catch (err) {
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์');
    }
  };

  const totalPages = Math.ceil(graphicWorks.length / itemsPerPage);
  const currentWorks = graphicWorks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


 const handleSubTaskStatusChange = async (taskId, subTaskId, newStatus) => {
  try {
    const res = await fetch(`http://localhost:3001/api/update-subtask-status/${subTaskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus }),
    });

    const result = await res.json();
    if (result.success) {
      // อัปเดตสถานะใน state
      setTaskDetails(prevDetails =>
        prevDetails.map(task => {
          if (task.task_id !== taskId) return task;
          return {
            ...task,
            sub_tasks: task.sub_tasks.map(sub =>
              sub.sub_task_id === subTaskId ? { ...sub, status: newStatus } : sub
            ),
          };
        })
      );
    } else {
      alert('ไม่สามารถอัปเดตสถานะได้');
    }
  } catch (err) {
    alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
  }
};

   

  if (loading) return <p style={{ color: 'white' }}>กำลังโหลดข้อมูล...</p>;
  if (error) return <p style={{ color: 'red' }}>ไม่สามารถโหลดข้อมูลได้: {error}</p>;

  return (
    <>
      <NevbarV2 />
      <div className='Card01'>
        <div className="work-table-container">
          <h2>ตารางโปรเจกต์ทั้งหมด</h2>
          <table>
            <thead>
              <tr>
                <th>ชื่อลูกค้า</th>
                <th>เบอร์โทร</th>
                <th>ช่องทางอื่น</th>
                <th>ชื่อโปรเจกต์</th>
                <th>รายละเอียด</th>
                <th>ราคา</th>
                <th>สถานะ</th>
                <th>กำหนดส่ง</th>
                <th>Task</th>
                <th>การแก้ไขสถานะ</th>
              </tr>
            </thead>
            <tbody>
              {currentWorks.map(work => (
                <tr
                  key={work.project_id}
                  className={`status-${(work.status || '').replace(/\s/g, '').toLowerCase()}`}

                >
                  <td>{work.customer_name || '-'}</td>
                  <td>{work.phone || '-'}</td>
                  <td>{work.other_contact || '-'}</td>
                  <td>{work.project_name || '-'}</td>
                  <td>{work.description || '-'}</td>
                  <td>{work.project_price || '-'}</td>
                  <td>{work.status || '-'}</td>
                  <td>{formatDateDisplay(work.deadline)}</td>
                  <td>
                    <center>
                      <button
                        onClick={() => handleCheckTask(work.project_id)}
                        className="btnT"
                      >
                        ตรวจสอบTask
                      </button>
                    </center>
                  </td>
                  <td>
                    <button onClick={() => handleEdit(work)} className="edit-btn">
                      แก้ไข
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div
            className="pagination-numbers"
            style={{ marginTop: '20px', textAlign: 'center' }}
          >
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={page === currentPage ? 'active-page' : ''}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal แก้ไข */}
      {showModal && editingWork && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>แก้ไข</h3>
            <label>ชื่อลูกค้า</label>
            <input
              value={editingWork.customer_name}
              onChange={(e) =>
                setEditingWork({ ...editingWork, customer_name: e.target.value })
              }
            />
            <label>เบอร์โทร</label>
            <input
              value={editingWork.phone}
              onChange={(e) => setEditingWork({ ...editingWork, phone: e.target.value })}
            />
            <label>ช่องทางอื่น</label>
            <input
              value={editingWork.other_contact}
              onChange={(e) =>
                setEditingWork({ ...editingWork, other_contact: e.target.value })
              }
            />
            <label>ชื่อโปรเจกต์</label>
            <input
              value={editingWork.project_name}
              onChange={(e) =>
                setEditingWork({ ...editingWork, project_name: e.target.value })
              }
            />
            <label>รายละเอียด</label>
            <input
              value={editingWork.description}
              onChange={(e) =>
                setEditingWork({ ...editingWork, description: e.target.value })
              }
            />
            <label>ราคา</label>
            <input
              type="number"
              value={editingWork.project_price}
              onChange={(e) =>
                setEditingWork({ ...editingWork, project_price: e.target.value })
              }
            />
            <label>สถานะ</label>
            <select
              value={editingWork.status}
              onChange={(e) => setEditingWork({ ...editingWork, status: e.target.value })}
            >
              <option value="" disabled>
                --- เลือกสถานะของงาน ---
              </option>
              <option value="In progress">กำลังดําเนินการ</option>
              <option value="Completed">เสร็จสิ้น</option>
            </select>
            <label>กำหนดส่ง</label>
            <input
              type="date"
              value={editingWork.deadline}
              onChange={(e) =>
                setEditingWork({ ...editingWork, deadline: e.target.value })
              }
            />
            <div className="modal-buttons">
              <button onClick={handleSaveEdit} className="save-btn">
                บันทึก
              </button>
              <button onClick={handleCloseModal} className="cancel-btn">
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal ตรวจสอบ Task */}
      {showTaskModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>รายละเอียด Task และ SubTask</h3>
            {taskDetails.length === 0 ? (
              <p>ไม่พบ Task</p>
            ) : (
              taskDetails.map((task) => (
                <div key={task.task_id} style={{ marginBottom: '1rem' }}>
                  <h4>{task.task_name}</h4><p>
  สถานะของ Task: <strong style={{ color: task.status === 'Completed' ? 'green' : 'orange' }}>
    {task.status}
  </strong>
</p>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Sub Task</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>สถานะ</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>กำหนดส่ง</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>ผู้รับผิดชอบ</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>ทีม</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>การแก้ไข</th>
                        
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(task.sub_tasks) && task.sub_tasks.length > 0 ? (
                        task.sub_tasks.map((sub) => {
                          let rowStyle = {};
                          if (sub.status === 'In progress') {
                            rowStyle = { backgroundColor: '#FFF9C4' };
                          } else if (sub.status === 'Completed') {
                            rowStyle = { backgroundColor: '#C8E6C9' };
                          }
                          return (
                            <tr key={sub.sub_task_id} style={rowStyle}>
                              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                {sub.sub_task_name}
                                
                              </td>
                              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{sub.status}</td>
                              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                {formatDateDisplay(sub.due_date)}
                              </td>
                              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                {sub.agent_name || '-'}
                              </td>
                              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                {sub.team_name || '-'}
                              </td>
                              
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
  <select style={{fontSize:'10px'}}
    value={sub.status}
    onChange={(e) =>
      handleSubTaskStatusChange(
        task.task_id,
        sub.sub_task_id,
        e.target.value
      )
    }
  >
    <option value="In progress" style={{fontSize:'10px'}}>กำลังดําเนินการ</option>
    <option value="Completed" style={{fontSize:'10px'}}>เสร็จสิ้น</option>
  </select>
</td>


                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="5" style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                            ไม่มี SubTask
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ))
            )}
            <div className="modal-buttons">
              <button onClick={handleCloseTaskModal} className="cancel-btn">
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectTable;
