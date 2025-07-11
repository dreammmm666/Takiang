import React, { useState } from 'react';
import NevbarV2 from '../component/NevbarV2';
import '../Css/WorkForm.css';

const Create_user = () => {
  const [form, setForm] = useState({
    customer_name: '',
    phone: '',
    other_contact: '',
    
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
      const res = await fetch('http://localhost:3001/add_customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        alert('บันทึกบัญชีสำเร็จ');
        setForm({
         customer_name: '',
          phone: '',
          other_contact: '',
          
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
        <h2>เพิ่มข้อมูลลูกค้า</h2>
        <form onSubmit={handleSubmit} className="work-form">
          <p>ชื่อลูกค้า</p>
          <input
            name="customer_name"
            value={form.customer_name}
            onChange={handleChange}
            placeholder="ชื่อลูกค้า"
            required
          />

          <p>เบอร์โทรศัพท์ศัพท์</p>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="099-999-9999"
            required
          />

          <p>ช่องทางติดต่ออื่นๆ</p>
          <input
            name="other_contact"
            value={form.other_contact}
            onChange={handleChange}
            placeholder="Facebook,Line"
            required
          />

          

          <button type="submit">เพิ่มข้อมูล</button>
        </form>
      </div>
    </>
  );
};

export default Create_user;
