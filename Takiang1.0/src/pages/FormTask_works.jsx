import React, { useState,useEffect } from 'react';
import '../Css/WorkForm.css'
import Navbar from '../component/Navbar';
import NevbarV2 from '../component/NevbarV2';

import { Link } from 'react-router-dom';


const WorkForm = () => {
   const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({
    project_id: '',
    task_name: '',
    task_description: '',
    status: 'disabled',
    due_date: '',
  });

  useEffect(() => {
    fetch('http://localhost:3001/api/projects/in-progress')
      .then(res => res.json())
      .then(data => setProjects(data))
      .catch(err => console.error('โหลดโปรเจกต์ไม่สำเร็จ:', err));
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3001/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.success) {
        alert('บันทึก Task สำเร็จ');
        setForm({ project_id: '', task_name: '', task_description: '', status: '', due_date: '' });
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
          <h2>เพิ่มข้อมูล Task</h2>
          <Link to="/Formsub_Task">
            <button className='BtnsubTask'>เพิ่มงานย่อย</button>
          </Link>
        </div>

        <form className="work-form" onSubmit={handleSubmit}>
          <p>ชื่อโปรเจกต์</p>
          <select name="project_id" value={form.project_id} onChange={handleChange} required>
            <option value="">--- เลือกโปรเจกต์ ---</option>
            {projects.map(project => (
              <option key={project.project_id} value={project.project_id}>
                {project.project_name}
              </option>
            ))}
          </select>

          <p>ชื่องาน</p>
          <input
            name="task_name"
            value={form.task_name}
            onChange={handleChange}
            placeholder="ชื่องานย่อย"
            required
          />

          <p>รายละเอียดงาน</p>
          <textarea
            name="task_description"
            value={form.task_description}
            onChange={handleChange}
            placeholder="รายระเอียดของงาน"
          />

          <p>สถานะ</p>
          <select name="status" value={form.status} onChange={handleChange} required>
             <option value="">--- เลือกสถานะของงาน ---</option>
            
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

export default WorkForm;
