import React, { useState, useEffect } from 'react';
import '../Css/WorkForm.css';
import NevbarV2 from '../component/NevbarV2';

const Formsub_Task = () => {
  const [tasks, setTasks] = useState([]);
  const [agents, setAgents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [form, setForm] = useState({
    task_id: '',
    sub_task_name: '',
    sub_task_description: '',
    assigned_agent_id: '',
    assigned_team_id: '',
    status: '',
    due_date: '',
  });

  // โหลด Tasks
  useEffect(() => {
    fetch('http://localhost:3001/api/tasks')
      .then(res => res.json())
      .then(data => setTasks(data))
      .catch(err => console.error('โหลด Tasks ล้มเหลว:', err));
  }, []);

  // โหลด Agents พร้อมทีม
  useEffect(() => {
    fetch('http://localhost:3001/api/agents')
      .then(res => res.json())
      .then(data => setAgents(data))
      .catch(err => console.error('โหลด Agents ล้มเหลว:', err));
  }, []);

  // โหลด Teams
  useEffect(() => {
    fetch('http://localhost:3001/api/teams')
      .then(res => res.json())
      .then(data => setTeams(data))
      .catch(err => console.error('โหลด Teams ล้มเหลว:', err));
  }, []);

  // เมื่อเลือก agent ให้ตั้งทีมอัตโนมัติ
  useEffect(() => {
    if (form.assigned_agent_id) {
      const selectedAgent = agents.find(a => String(a.agent_id) === String(form.assigned_agent_id));
      if (selectedAgent) {
        setForm(prev => ({ ...prev, assigned_team_id: selectedAgent.team_id }));
      }
    } else {
      setForm(prev => ({ ...prev, assigned_team_id: '' }));
    }
  }, [form.assigned_agent_id, agents]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3001/api/sub_tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        alert('บันทึก SubTask สำเร็จ');
        setForm({
          task_id: '',
          sub_task_name: '',
          sub_task_description: '',
          assigned_agent_id: '',
          assigned_team_id: '',
          status: '',
          due_date: '',
        });
      } else {
        alert('เกิดข้อผิดพลาด: ' + data.message);
      }
    } catch (err) {
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์');
    }
  };

  return (
    <>
      <NevbarV2 />
      <div className="Card01">
        <div className="containerT">
          <h2>เพิ่มข้อมูล SubTask</h2>
        </div>

        <form className="work-form" onSubmit={handleSubmit}>
          <p>เลือกTask</p>
          <select name="task_id" value={form.task_id} onChange={handleChange} required>
            <option value="">--- เลือกTask ---</option>
            {tasks.map(task => (
              <option key={task.task_id} value={task.task_id}>{task.task_name}</option>
            ))}
          </select>

          <p>ชื่อ SubTask</p>
          <input
            name="sub_task_name"
            value={form.sub_task_name}
            onChange={handleChange}
            placeholder="ชื่องานย่อย"
            required
          />

          <p>รายละเอียด SubTask</p>
          <textarea
            name="sub_task_description"
            value={form.sub_task_description}
            onChange={handleChange}
            placeholder="รายละเอียดของงาน"
          />

          <p>ผู้รับผิดชอบ</p>
          <select
            name="assigned_agent_id"
            value={form.assigned_agent_id}
            onChange={handleChange}
            required
          >
            <option value="">--- เลือกผู้รับผิดชอบ ---</option>
            {agents.map(agent => (
              <option key={agent.agent_id} value={agent.agent_id}>{agent.agent_name}</option>
            ))}
          </select>

          <p>ทีมที่รับผิดชอบ</p>
          <input
            type="text"
            value={teams.find(team => String(team.team_id) === String(form.assigned_team_id))?.team_name || ''}
            disabled
          />

          <p>สถานะ</p>
          <select name="status" value={form.status} onChange={handleChange} required>
            <option value="">--- เลือกสถานะ ---</option>
            <option value="Pending">รอดําเนินการ</option>
            <option value="In progress">กำลังทำ</option>
            <option value="Completed">เสร็จสิ้น</option>
          </select>

          <p>กำหนดส่งงาน</p>
          <input
            type="date"
            name="due_date"
            value={form.due_date}
            onChange={handleChange}
            required
          />

          <button type="submit">เพิ่มข้อมูล</button>
        </form>
      </div>
    </>
  );
};

export default Formsub_Task;
