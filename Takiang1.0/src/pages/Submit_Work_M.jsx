import React, { useEffect, useState } from 'react';
import NevbarV2 from '../component/NevbarV2_M'
import '../Css/WorkForm.css';


const SubmitWorkForm_M = () => {
  const [works, setWorks] = useState([]);
  const [selectedSubTaskId, setSelectedSubTaskId] = useState('');
  const [submitLink, setSubmitLink] = useState('');
  const [submitCount, setSubmitCount] = useState(0);
  const agentId = localStorage.getItem('agent_id');
  const [loading, setLoading] = useState(false);

  const fetchWorks = () => {
    if (!agentId) return;
    setLoading(true);
    fetch(`http://localhost:3001/api/mywork/with-submits?agent_id=${agentId}`)
      .then(res => res.json())
      .then(data => {
        setWorks(data);
        setLoading(false);
        // ถ้า subTask ที่เลือกยังอยู่ใน list ให้ดึง count รอบส่งใหม่
        if (selectedSubTaskId) {
          fetchSubmitCount(selectedSubTaskId);
        }
      })
      .catch(err => {
        console.error('Error fetching works:', err);
        setLoading(false);
      });
  };

  const fetchSubmitCount = (subTaskId) => {
    fetch(`http://localhost:3001/api/submitted-count?sub_task_id=${subTaskId}&agent_id=${agentId}`)
      .then(res => res.json())
      .then(data => setSubmitCount(data.count))
      .catch(console.error);
  };

  useEffect(() => {
    fetchWorks();
  }, [agentId]);

  useEffect(() => {
    if (!selectedSubTaskId) {
      setSubmitCount(0);
      return;
    }
    fetchSubmitCount(selectedSubTaskId);
  }, [selectedSubTaskId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!submitLink || !agentId || !selectedSubTaskId) {
      return alert('กรุณาเลือกงานและกรอกลิงก์งาน');
    }
    if (submitCount >= 3) {
      return alert('ส่งงานเกิน 3 รอบแล้ว');
    }

    const payload = {
      sub_task_id: selectedSubTaskId,
      agent_id: agentId,
      submit_link: submitLink,
    };

    const res = await fetch('http://localhost:3001/api/submit-work', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await res.json();

    if (res.ok) {
      alert(`ส่งงานสำเร็จ (รอบที่ ${result.round})`);
      setSubmitLink('');
      fetchSubmitCount(selectedSubTaskId);
      fetchWorks(); // รีโหลดรายการงานหลังส่งงานเสร็จ
    } else {
      alert(result.error || 'เกิดข้อผิดพลาดในการส่งงาน');
    }
  };

  return (
    <>
      <NevbarV2 />
      <div className="Card01">
        <h2>ส่งงาน</h2>
        <button onClick={fetchWorks} disabled={loading} style={{ marginBottom: '1rem' }} className='BtnsubTask'>
          {loading ? 'กำลังรีเฟรช...' : 'รีเฟรชรายการงาน'}
        </button>
        <form onSubmit={handleSubmit}>
          <div>
            <label>เลือกงานที่ต้องการส่ง:</label>
            <select
              value={selectedSubTaskId}
              onChange={(e) => setSelectedSubTaskId(e.target.value)}
              required
            >
              <option value="">-- เลือกงาน --</option>
              {works
                .filter(work => work.sub_task_status !== 'Completed')
                .map(work => (
                  <option key={work.sub_task_id} value={work.sub_task_id}>
                    {work.project_name} / {work.task_name} / {work.sub_task_name}
                  </option>
                ))}
            </select>
          </div>

          {selectedSubTaskId && (
            <>
              <p>จํานวนรอบที่ส่ง: {submitCount} / 3</p>

              <div>
                <label style={{marginTop:'1rem'}}>ลิงก์งาน (URL):</label>
                <input
                  type="url"
                  placeholder="https://"
                  value={submitLink}
                  onChange={(e) => setSubmitLink(e.target.value)}
                  required
                  style={{ width: '100%' }}
                />
              </div>
              <button  className='btnT' type="submit" disabled={submitCount >= 3} style={{marginTop:'1rem'}}>ส่งงาน</button>
            </>
          )}
        </form>
      </div>
    </>
  );
};

export default SubmitWorkForm_M;
