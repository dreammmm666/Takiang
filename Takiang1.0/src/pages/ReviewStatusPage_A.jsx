import React, { useEffect, useState } from 'react';
import NevbarV2_graphic from '../component/NevbarV2';
import '../Css/WorkTable.css';
import NevbarV2 from '../component/NevbarV2';

const getStatusClass = (status) => {
  switch (status) {
    case 'Pending':
      return 'status-pending';  // สีเหลือง
    case 'Approved':
      return 'status-approved'; // สีเขียว
    case 'Rejected':
      return 'status-rejected'; // สีแดง
    default:
      return 'status-default';  // สีเทา (อื่นๆ หรือยังไม่ได้ส่ง)
  }
};

const ReviewStatusPage_A = () => {
  const [subTasks, setSubTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const agentId = localStorage.getItem('agent_id');

  useEffect(() => {
    if (!agentId) {
      setLoading(false);
      return;
    }

    fetch(`http://localhost:3001/api/review-status?agent_id=${agentId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSubTasks(data);
        } else {
          console.error('❌ API ไม่ได้ส่งเป็น array:', data);
          setSubTasks([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('❌ Error fetching review status:', err);
        setLoading(false);
      });
  }, [agentId]);

  if (loading) return <p>กำลังโหลดข้อมูล...</p>;
  if (!agentId) return <p>กรุณาเข้าสู่ระบบก่อนดูสถานะ</p>;
  if (subTasks.length === 0) return <p>ไม่มีงานที่ต้องตรวจ</p>;

  return (
    <>
      <NevbarV2 />
      <div className="Card01">
        <h2>สถานะการตรวจงานของฉัน</h2>
        <table className="work-status-table">
          <thead>
            <tr>
              <th>โปรเจค</th>
              <th>งาน (Task)</th>
              <th>งานย่อย (SubTask)</th>
              <th>สถานะงานย่อย</th>
              <th>จำนวนครั้งที่ส่ง</th>
              <th>รอบที่ส่ง</th>
              <th>สถานะตรวจงาน</th>
              <th>ลิงก์งาน</th>
              <th>คอมเม้นผู้ตรวจ</th>
              <th>วันที่ส่ง</th>
            </tr>
          </thead>
          <tbody>
            {subTasks.map(sub => {
              const sortedSubmits = sub.submitted_works
                ? [...sub.submitted_works].sort((a, b) => a.submit_round - b.submit_round)
                : [];

              if (sortedSubmits.length === 0) {
                return (
                  <tr
                    key={sub.sub_task_id}
                    className={getStatusClass('')} // ยังไม่ได้ส่ง
                  >
                    <td>{sub.project_name}</td>
                    <td>{sub.task_name}</td>
                    <td>{sub.sub_task_name}</td>
                    <td>{sub.sub_task_status}</td>
                    <td>0</td>
                    <td>-</td>
                    <td>ยังไม่ได้ส่ง</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                  </tr>
                );
              }

              return sortedSubmits.map(submit => (
                <tr
                  key={`${sub.sub_task_id}-${submit.submit_round}`}
                  className={getStatusClass(submit.review_status)}
                >
                  <td>{sub.project_name}</td>
                  <td>{sub.task_name}</td>
                  <td>{sub.sub_task_name}</td>
                  <td>{sub.sub_task_status}</td>
                  <td>{sortedSubmits.length}</td>
                  <td>{submit.submit_round}</td>
                  <td>{submit.review_status || '-'}</td>
                  <td>
                    <a
                      className="A1"
                      href={submit.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      คลิกเพื่อดูงาน
                    </a>
                  </td>
                  <td>{submit.note || '-'}</td>
                  <td>{submit.submit_time ? new Date(submit.submit_time).toLocaleString('th-TH') : '-'}</td>
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ReviewStatusPage_A;
