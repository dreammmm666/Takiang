import React, { useState } from 'react';
import NevbarV2 from '../component/NevbarV2';
import '../Css/WorkForm.css';

const Create_user = () => {
  const [form, setForm] = useState({
    username: '',
    password: '',
    agent_name: '',
    team_id: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const createdBy = localStorage.getItem('agent_id'); // ✅ ดึง agent_id ที่ล็อกอินอยู่

    const payload = {
      ...form,
      team_id: form.team_id !== '' ? parseInt(form.team_id) : null,
      created_by: createdBy ? parseInt(createdBy) : null // ✅ เพิ่มข้อมูล created_by
    };

    try {
      const res = await fetch('http://localhost:3001/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        alert('บันทึกบัญชีสำเร็จ');
        setForm({
          username: '',
          password: '',
          agent_name: '',
          team_id: '',
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
        <h2>สร้างบัญชี</h2>
        <form onSubmit={handleSubmit} className="work-form">
          <p>ชื่อผู้ใช้งาน (agent_name)</p>
          <input
            name="agent_name"
            value={form.agent_name}
            onChange={handleChange}
            placeholder="agent_name"
            required
          />

          <p>Username</p>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="username"
            required
          />

          <p>Password</p>
          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="password"
            required
          />

          <p>ทีม</p>
          <select
            name="team_id"
            value={form.team_id}
            onChange={handleChange}
            required
          >
            <option value="">-- เลือกทีม --</option>
            <option value="3">admin</option>
            <option value="1">graphic</option>
            <option value="2">marketing</option>
          </select>

          <button type="submit">สร้างบัญชี</button>
        </form>
      </div>
    </>
  );
};

export default Create_user;
