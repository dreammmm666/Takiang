import React, { useEffect, useState } from 'react';
import '../Css/WorkTable.css';
import NevbarV2 from '../component/NevbarV2';

const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetch('http://localhost:3001/api/activity-logs')
      .then(res => {
        if (!res.ok) throw new Error('ไม่สามารถโหลด log ได้');
        return res.json();
      })
      .then(data => {
        setLogs(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const formatDateTime = (isoDate) => {
    if (!isoDate) return '-';
    const date = new Date(isoDate);
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getChangedFields = (oldDataRaw, newDataRaw) => {
    try {
      const oldData = JSON.parse(oldDataRaw || '{}');
      const newData = JSON.parse(newDataRaw || '{}');

      const diff = {};
      for (const key in newData) {
        if (newData[key] !== oldData[key]) {
          diff[key] = { from: oldData[key], to: newData[key] };
        }
      }
      return JSON.stringify(diff, null, 2);
    } catch (e) {
      return newDataRaw; // fallback ถ้าไม่ใช่ JSON
    }
  };

  const totalPages = Math.ceil(logs.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentLogs = logs.slice(indexOfFirst, indexOfLast);

  return (
    <>
      <NevbarV2 />
      <div className="Card01">
        <div className="work-table-container">
          <h2>ประวัติกิจกรรมระบบ</h2>
          {loading ? (
            <p>กำลังโหลด...</p>
          ) : error ? (
            <p style={{ color: 'red' }}>{error}</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>เวลา</th>
                  <th>ผู้ใช้งาน</th>
                  <th>ประเภท</th>
                  <th>ตาราง</th>
                  <th>ไอดี</th>
                  <th>ข้อมูลเดิม</th>
                  <th>ข้อมูลที่เปลี่ยน</th>
                </tr>
              </thead>
              <tbody>
                {currentLogs.length > 0 ? currentLogs.map(log => (
                  <tr key={log.log_id}>
                    <td>{formatDateTime(log.log_time)}</td>
                    <td>{log.agent_name || '-'}</td>
                    <td>{log.action_type}</td>
                    <td>{log.table_name}</td>
                    <td>{log.record_id}</td>
                    <td>
                      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {JSON.stringify(JSON.parse(log.old_data || '{}'), null, 2)}
                      </pre>
                    </td>
                    <td>
                      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {getChangedFields(log.old_data, log.new_data)}
                      </pre>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="7" style={{ textAlign: 'center' }}>ไม่มีข้อมูลล็อก</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

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
    </>
  );
};

export default ActivityLog;
