import React, { useEffect, useState } from 'react';
import '../Css/WorkTable.css';
import NevbarV2 from '../component/NevbarV2';

const itemsPerPage = 10;  // กำหนดจำนวน item ต่อหน้า

const Mywork = () => {
  const [works, setWorks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const agentId = localStorage.getItem('agent_id');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = () => {
    if (!agentId) return;
    fetch(`http://localhost:3001/api/mywork?agent_id=${agentId}`)
      .then(res => res.json())
      .then(setWorks)
      .catch(console.error);
  };

  const handleUpdate = (sub_task_id) => {
    fetch('http://localhost:3001/api/subtask/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sub_task_id, status: newStatus, agent_id: agentId }) // ส่ง agent_id ไปด้วย
    })
      .then(res => res.json())
      .then(() => {
        setEditingId(null);
        fetchData();
      })
      .catch(() => alert('เกิดข้อผิดพลาด'));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ฟังก์ชันกำหนดสีพื้นหลังตามสถานะ
  const getRowStyle = (status) => {
    if (status === 'In progress') {
      return { backgroundColor: '#FFF9C4' }; // เหลืองอ่อน
    } else if (status === 'Completed') {
      return { backgroundColor: '#C8E6C9' }; // เขียวอ่อน
    }
    return {}; // Pending หรือสถานะอื่น ๆ ไม่มีสีพื้นหลัง
  };

  // Pagination
  const totalPages = Math.ceil(works.length / itemsPerPage);
  const currentWorks = works.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <NevbarV2 />
      <div className="Card01">
        <div className="work-table-container">
          <h2>งานของฉัน</h2>
          <table>
            <thead>
              <tr>
                <th>ลูกค้า</th><th>เบอร์โทร</th><th>ช่องทางอื่น</th><th>โปรเจกต์</th><th>ทาร์ก</th><th>ซับทาร์ก</th>
                <th>รายละเอียด</th><th>ทีม</th><th>ผู้รับผิดชอบ</th><th>กำหนดส่ง</th><th>สถานะ</th><th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {currentWorks.length > 0 ? currentWorks.map((work) => (
                <tr
                  key={work.sub_task_id}
                  style={getRowStyle(work.sub_task_status)}
                >
                  <td>{work.customer_name}</td>
                  <td>{work.phone}</td>
                  <td>{work.other_contact}</td>
                  <td>{work.project_name}</td>
                  <td>{work.task_name}</td>
                  <td>{work.sub_task_name}</td>
                  <td>{work.sub_task_description}</td>
                  <td>{work.team_name}</td>
                  <td>{work.agent_name}</td>
                  <td>{new Date(work.due_date).toLocaleDateString('th-TH')}</td>
                  <td>
                    {editingId === work.sub_task_id ? (
                      <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                        <option value="Pending">Pending</option>
                        <option value="In progress">In progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    ) : (
                      work.sub_task_status
                    )}
                  </td>
                  <td>
                    {editingId === work.sub_task_id ? (
                      <>
                        <button onClick={() => handleUpdate(work.sub_task_id)} className='btnT'>บันทึก</button>
                        <button onClick={() => setEditingId(null)} className='cancel-btn'>ยกเลิก</button>
                      </>
                    ) : (
                      <button onClick={() => { setEditingId(work.sub_task_id); setNewStatus(work.sub_task_status); }} className='edit-btn'>
                        แก้ไข
                      </button>
                    )}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="12" style={{ textAlign: 'center' }}>ไม่มีข้อมูลงาน</td></tr>
              )}
            </tbody>
          </table>
          <div className="pagination-numbers" style={{ marginTop: '20px', textAlign: 'center' }}>
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
    </>
  );
};

export default Mywork;
