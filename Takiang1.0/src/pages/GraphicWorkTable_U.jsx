import React, { useEffect, useState } from 'react';
import Navbar from '../component/NevbarV2_graphic';
import '../Css/WorkTable.css';
import NevbarV2 from '../component/NevbarV2';

const GraphicWorkTable = () => {
  const [graphicWorks, setGraphicWorks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const formatDateDisplay = (isoDate) => {
    if (!isoDate) return '-';
    const date = new Date(isoDate);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:3001/api/graphic-table')
      .then(res => {
        if (!res.ok) throw new Error('ไม่สามารถโหลดข้อมูลได้');
        return res.json();
      })
      .then(data => {
        setGraphicWorks(data);
        setLoading(false);
        setError(null);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Pagination calculations
  const totalPages = Math.ceil(graphicWorks.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentWorks = graphicWorks.slice(indexOfFirst, indexOfLast);

  if (loading) return <p style={{ color: 'white' }}>กำลังโหลดข้อมูล...</p>;
  if (error) return <p style={{ color: 'red' }}>ไม่สามารถโหลดข้อมูลได้: {error}</p>;

  return (
    <>
      <Navbar />
      <div className='Card01'>
        <div className="work-table-container">
          <h2>ตารางงานกราฟิกทั้งหมด</h2>
          <table>
            <thead>
              <tr>
                <th>ชื่อลูกค้า</th>
                <th>เบอร์โทร</th> {/* เพิ่มคอลัมน์ */}
                <th>ช่องทางติดต่ออื่นๆ</th> {/* เพิ่มคอลัมน์ */}
                <th>ชื่อโปรเจกต์</th>
                <th>ชื่อทาร์ก</th>
                <th>ชื่อซับทาร์ก</th>
                <th>รายละเอียดของงาน</th>
                <th>ทีมที่รับผิดชอบ</th>
                <th>ผู้รับผิดชอบ</th>
                <th>กำหนดส่ง</th>
                <th>สถานะ</th>
              </tr>
            </thead>

            <tbody>
              {currentWorks.map((work, index) => (
                <tr key={index} className={`status-${(work.sub_task_status || '').replace(/\s/g, '').toLowerCase()}`}>
                  <td>{work.customer_name || '-'}</td>
                  <td>{work.phone || '-'}</td> {/* แสดงเบอร์โทร */}
                  <td>{work.other_contact || '-'}</td> {/* แสดงช่องทางติดต่ออื่นๆ */}
                  <td>{work.project_name || '-'}</td>
                  <td>{work.task_name || '-'}</td>
                  <td>{work.sub_task_name || '-'}</td>
                  <td>{work.sub_task_description || '-'}</td>
                  <td>{work.team_name || '-'}</td>
                  <td>{work.agent_name || '-'}</td>
                  <td>{formatDateDisplay(work.due_date)}</td>
                  <td>{work.sub_task_status || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination-numbers" style={{ marginTop: '20px', textAlign: 'center' }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
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

export default GraphicWorkTable;
