import React, { useState, useEffect } from 'react';
import '../Css/WorkForm.css';
import Navbar from '../component/Navbar';
import NevbarV2 from '../component/NevbarV2';
import axios from 'axios';
import Select from 'react-select';

const WorkForm = () => {
  const [form, setForm] = useState({
    project_name: '',
    description: '',
    customer_id: '',
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
        project_name: '',
        description: '',
        customer_id: '',
        status: '',
        deadline: '',
        project_price: '',
      });
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาด');
    }
  };

  const [customerOptions, setCustomerOptions] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3001/api/customers').then((res) => {
      
      const options = res.data.map((cust) => ({
        value: cust.customer_id,
        label: cust.customer_name,
      }));
      setCustomerOptions(options);
    });
  }, []);

  return (
    <>
      <NevbarV2 />
      <div className="Card01">
        <h2>เพิ่มข้อมูลโปรเจกต์</h2>
        <form className="work-form" onSubmit={handleSubmit}>
          <p>ชื่อลูกค้า</p>
          <Select
            options={customerOptions}
            value={
              customerOptions.find(
                (option) => option.value === form.customer_id
              ) || null
            }
            onChange={(selectedOption) =>
              setForm({ ...form, customer_id: selectedOption?.value || '' })
            }
            placeholder="ค้นหาชื่อลูกค้า..."
            isClearable
          />

          <p>ชื่อโปรเจกต์</p>
          <input
            name="project_name"
            value={form.project_name}
            onChange={handleChange}
            placeholder="ชื่อโปรเจกต์"
            required
          />

          <p>รายละเอียดโปรเจกต์</p>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="รายละเอียดโปรเจกต์"
          />

          <p>สถานะ</p>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            required
          >
            <option value="">--- เลือกสถานะของงาน ---</option>
            <option value="In progress">กำลังดําเนินการ</option>
            <option value="Completed">เสร็จสิ้น</option>
          </select>

          <p>กำหนดส่งงาน</p>
          <input
            type="date"
            name="deadline"
            value={form.deadline}
            onChange={handleChange}
            required
          />

          <p>ราคา</p>
          <input
            type="number"
            name="project_price"
            value={form.project_price}
            onChange={handleChange}
            placeholder="ราคา"
            required
            min="0"
          />

          <button type="submit">เพิ่มข้อมูลงานใหม่</button>
        </form>
      </div>
    </>
  );
};

export default WorkForm;
