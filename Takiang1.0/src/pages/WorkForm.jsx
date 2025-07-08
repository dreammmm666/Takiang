import React, { useState } from 'react';
import '../Css/WorkForm.css'
import Navbar from '../component/Navbar';
import NevbarV2 from '../component/NevbarV2';
import axios from 'axios';

const WorkForm = () => {
   const [form, setForm] = useState({
    customer_name: '',
    phone: '',
    other_contact: '',
    project_name: '',
    description: '',
    status: '',
    deadline: '',
    project_price: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/api/projects', form);
      alert('บันทึกข้อมูลเรียบร้อย');
       setForm({
         customer_name: '',
    phone: '',
    other_contact: '',
    project_name: '',
    description: '',
    status: '',
    deadline: '',
    project_price: '',
        });
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาด');
    }
  };

     
       
       
        
      

  return (
    <>
      <NevbarV2 />
      <div className="Card01">
        <h2>เพิ่มข้อมูลงานใหม่</h2>
        <form className="work-form" onSubmit={handleSubmit}> <br></br>
           <h3>ข้อมูลลูกค้า</h3>
          <p>ชื่อลูกค้า</p>
          <input name="customer_name" value={form.customer_name} onChange={handleChange} placeholder="ชื่อลูกค้า" required />
          <p>เบอร์โทรศัพท์</p>
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="เบอร์โทรศัพท์" required />
          <p>ช่องทางการติดต่ออื่นๆ</p>
          <input name="other_contact" value={form.other_contact} onChange={handleChange} placeholder=" Facebook,Line" required />
          <br></br>
          <h3>ข้อมูลโปรเจค</h3>
           <p>ชื่อโปรเจค</p>
          <input name="project_name" value={form.project_name} onChange={handleChange} placeholder="ชื่อโปรเจค" required />
          <p>รายละเอียดโปรเจค</p>
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="ลายละเอียดโปรเจค" />
          <p>สถานะ</p>
          <select name="status" value={form.status} onChange={handleChange} required>
  <option value="" disabled>--- เลือกสถานะของงาน ---</option>
  <option value="In progress">กำลังดําเนินการ</option>
  <option value="Completed">เสร็จสิ้น</option>
</select>

          
          <p>กำหนดส่งงาน</p>
          <input type="date" name="deadline" value={form.deadline} onChange={handleChange} required />
          
          <p>ราคา</p>
          <input type="number" name="project_price" value={form.project_price} onChange={handleChange} placeholder="ราคา" required min="0" />

          <button type="submit">เพิ่มข้อมูลงานใหม่</button>
        </form>
      </div>
    </>
  );
};

export default WorkForm;
