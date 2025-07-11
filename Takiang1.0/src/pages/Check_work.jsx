import React, { useEffect, useState } from 'react';
import NevbarV2 from '../component/NevbarV2';
import '../Css/WorkTable.css';

const Check_work = () => {
  const [submittedWorks, setSubmittedWorks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [reviewingWork, setReviewingWork] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('');
  const [reviewNote, setReviewNote] = useState('');

  useEffect(() => {
    fetch('http://localhost:3001/api/reviewer/submitted-works')
      .then(res => res.json())
      .then(data => {
        setSubmittedWorks(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('❌ Error fetching submitted works:', err);
        setLoading(false);
      });
  }, []);

  const openReviewForm = (work) => {
    setReviewingWork(work);
    setReviewStatus(work.status || '');
    setReviewNote(work.note || '');
  };

  const closeReviewForm = () => {
    setReviewingWork(null);
    setReviewStatus('');
    setReviewNote('');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewStatus) {
      alert('กรุณาเลือกสถานะการตรวจงาน');
      return;
    }

    try {
      // ดึง agent_id จาก localStorage หรือเปลี่ยนเป็นวิธีที่คุณเก็บ agent_id
      const agent_id = localStorage.getItem('agent_id');

      const res = await fetch(`http://localhost:3001/api/reviewer/submitted-works/${reviewingWork.submit_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          review_status: reviewStatus,
          note: reviewNote,
          agent_id: agent_id,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        alert('บันทึกสถานะตรวจงานสำเร็จ');
        setSubmittedWorks((prev) =>
          prev.map((w) =>
            w.submit_id === reviewingWork.submit_id
              ? { ...w, status: reviewStatus, note: reviewNote }
              : w
          )
        );
        closeReviewForm();
      } else {
        alert(result.error || 'เกิดข้อผิดพลาดในการบันทึก');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('เกิดข้อผิดพลาดในการบันทึก');
    }
  };

  if (loading) return <p>กำลังโหลดข้อมูล...</p>;

  return (
    <>
      <NevbarV2 />
      <div className="Card01">
        <h2>งานที่ส่งตรวจ</h2>
        <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>โปรเจกต์</th>
              <th>งาน (Task)</th>
              <th>งานย่อย (SubTask)</th>
              <th>ผู้รับผิดชอบ</th>
              <th>ทีม</th>
              <th>รอบที่ส่ง</th>
              <th>สถานะตรวจงาน</th>
              <th>ลิงก์งาน</th>
              <th>คอมเม้นผู้ตรวจ</th>
              <th>วันที่ส่ง</th>
              <th>การตรวจ</th>
            </tr>
          </thead>
          <tbody>
            {submittedWorks.length === 0 ? (
              <tr><td colSpan="11" style={{ textAlign: 'center' }}>ไม่มีงานที่ส่งตรวจ</td></tr>
            ) : (
              submittedWorks.map(work => {
                let statusClass = '';
                switch ((work.status || '').toLowerCase()) {
                  case 'approved':
                    statusClass = 'status-approved';
                    break;
                  case 'rejected':
                    statusClass = 'status-rejected';
                    break;
                  case 'pending':
                    statusClass = 'status-pending';
                    break;
                  default:
                    statusClass = '';
                }

                return (
                  <tr key={work.submit_id} className={statusClass}>
                    <td>{work.project_name}</td>
                    <td>{work.task_name}</td>
                    <td>{work.sub_task_name}</td>
                    <td>{work.assigned_agent_name || '-'}</td>
                    <td>{work.team_name || '-'}</td>
                    <td>{work.submit_round}</td>
                    <td>{work.status || 'รอดำเนินการ'}</td>
                    <td><a className="A1" href={work.file_path} target="_blank" rel="noopener noreferrer">คลิกเพื่อดูงาน</a></td>
                    <td>{work.note || '-'}</td>
                    <td>{new Date(work.submit_time).toLocaleString('th-TH')}</td>
                    <td><button onClick={() => openReviewForm(work)} className='edit-btn' style={{marginLeft:'2rem'}}>ตรวจสอบงาน</button></td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {reviewingWork && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'
          }}>
            <form
              onSubmit={handleSubmitReview}
              style={{
                backgroundColor: 'white', padding: 20, borderRadius: 8, width: 400,
                boxShadow: '0 0 10px rgba(0,0,0,0.3)'
              }}
            >
              <h3>ตรวจงาน: {reviewingWork.sub_task_name}</h3>

              <label>
                สถานะตรวจงาน:
                <select
                  value={reviewStatus}
                  onChange={e => setReviewStatus(e.target.value)}
                  required
                >
                  <option value="">-- เลือกสถานะ --</option>
                  <option value="Pending">รอดำเนินการ</option>
                  <option value="Approved">ผ่าน</option>
                  <option value="Rejected">ไม่ผ่าน</option>
                </select>
              </label>

              <br /><br />

              <label>
                คอมเม้น:
                <textarea
                  value={reviewNote}
                  onChange={e => setReviewNote(e.target.value)}
                  rows={4}
                  style={{ width: '100%' }}
                />
              </label>

              <br />
              
              <button type="submit" className='btnT'>บันทึก</button>{' '}
              <button type="button"  className='cancel-btn' onClick={closeReviewForm}>ยกเลิก</button>
            </form>
          </div>
        )}
      </div>
    </>
  );
};

export default Check_work;
