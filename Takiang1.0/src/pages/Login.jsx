import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import '../Css/Login.css';

const Login = () => {
  const [form, setForm] = useState({ username: '', password: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:3001/login', {
        method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(form)
      });

      if (res.ok) {
        const data = await res.json();

        if (data.success) {
const teamId = data.team_id?.toString();
 const agentId = data.agent_id?.toString();
const agentName = data.agent_name; 
  

  localStorage.setItem('team_id', teamId);
   localStorage.setItem('agent_name', agentName);
   localStorage.setItem('agent_id', agentId); 
  console.log('บันทึก team_id:', teamId);

          // ✅ redirect ตาม role
          if (teamId === '1') {
            window.location.href = '/GraphicWorkTable_U';
          } else if (teamId === '2') {
            window.location.href = '/MarketingWorkTable_U';
          } else if (teamId === '3') {
            window.location.href = '/ProjectTable';
          } else {
            alert('ไม่พบสิทธิ์ของผู้ใช้งาน');
          }
        } else {
          alert('เกิดข้อผิดพลาดไม่ทราบสาเหตุ');
        }
      } else {
        const errMsg = await res.text();
        alert(errMsg);
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>เข้าสู่ระบบ</h2>
        <input
          type="text"
          name="username"
          placeholder="ชื่อผู้ใช้"
          value={form.username}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="รหัสผ่าน"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit">เข้าสู่ระบบ</button>
      </form>
    </div>
  );
};

export default Login;
