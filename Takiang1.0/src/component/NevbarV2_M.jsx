import React, { useEffect, useState } from 'react';
import '../Css/NavV2.css';
import Logout from '../component/Logout_G';

function NevbarV2_M() {
  const [teamId, setTeamId] = useState(null);
  const [agentName, setAgentName] = useState('');

  const handleLogout = () => {
    localStorage.clear();
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', () => window.location.replace('/'));
    window.location.replace('/');
  };

  useEffect(() => {
    const storedTeam = localStorage.getItem('userteams') || localStorage.getItem('team_id');
    const storedName = localStorage.getItem('agent_name');

    if (storedTeam) {
      const id = parseInt(storedTeam);
      if (!isNaN(id)) {
        setTeamId(id);
      }
    } else {
      window.location.replace('/');
    }

    if (storedName) {
      setAgentName(storedName);
    }
  }, []);

  const teamsName = {
    1: 'กราฟิก',
    2: 'การตลาด',
    3: 'แอดมิน',
  };

  return (
    <aside className="sidebar">
      <nav className="nav">
        <ul>
          <p className="role">ผู้ใช้งาน: {agentName}</p>
          <p className="role2">ตำแหน่ง: {teamsName[teamId] || `ไม่ทราบสิทธิ์ (${teamId})`}</p>

          {/* ตารางงานกราฟิก */}
          <li>
            <a href="/MarketingWorkTable_U" className="menu-main">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                className="bi bi-bag-check-fill" viewBox="0 0 16 16">
                <path fillRule="evenodd"
                  d="M10.5 3.5a2.5 2.5 0 0 0-5 0V4h5zm1 0V4H15v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V4h3.5v-.5a3.5 3.5 0 1 1 7 0m-.646 5.354a.5.5 0 0 0-.708-.708L7.5 10.793 6.354 9.646a.5.5 0 1 0-.708.708l1.5 1.5a.5.5 0 0 0 .708 0z"
                />
              </svg>
              ตารางงานกราฟิก
            </a>
          </li>

          {/* งานของฉัน */}
          <li>
            <a href="/Mywork_M" className="menu-main">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                className="bi bi-briefcase-fill" viewBox="0 0 16 16">
                <path d="M6.5 1A1.5 1.5 0 0 0 5 2.5V3H1.5A1.5 1.5 0 0 0 0 4.5v1.384l7.614 2.03a1.5 1.5 0 0 0 .772 0L16 5.884V4.5A1.5 1.5 0 0 0 14.5 3H11v-.5A1.5 1.5 0 0 0 9.5 1zm0 1h3a.5.5 0 0 1 .5.5V3H6v-.5a.5.5 0 0 1 .5-.5" />
                <path d="M0 12.5A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5V6.85L8.129 8.947a.5.5 0 0 1-.258 0L0 6.85z" />
              </svg>
              งานของฉัน
            </a>
          </li>

          <li>
            <a href="/Submit_Work_M" className="menu-main">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                className="bi bi-briefcase-fill" viewBox="0 0 16 16">
                <path d="M6.5 1A1.5 1.5 0 0 0 5 2.5V3H1.5A1.5 1.5 0 0 0 0 4.5v1.384l7.614 2.03a1.5 1.5 0 0 0 .772 0L16 5.884V4.5A1.5 1.5 0 0 0 14.5 3H11v-.5A1.5 1.5 0 0 0 9.5 1zm0 1h3a.5.5 0 0 1 .5.5V3H6v-.5a.5.5 0 0 1 .5-.5" />
                <path d="M0 12.5A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5V6.85L8.129 8.947a.5.5 0 0 1-.258 0L0 6.85z" />
              </svg>
              ส่งงาน
            </a>
          </li>

          <li>
            <a href="/ReviewStatusPage_M" className="menu-main">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                className="bi bi-briefcase-fill" viewBox="0 0 16 16">
                <path d="M6.5 1A1.5 1.5 0 0 0 5 2.5V3H1.5A1.5 1.5 0 0 0 0 4.5v1.384l7.614 2.03a1.5 1.5 0 0 0 .772 0L16 5.884V4.5A1.5 1.5 0 0 0 14.5 3H11v-.5A1.5 1.5 0 0 0 9.5 1zm0 1h3a.5.5 0 0 1 .5.5V3H6v-.5a.5.5 0 0 1 .5-.5" />
                <path d="M0 12.5A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5V6.85L8.129 8.947a.5.5 0 0 1-.258 0L0 6.85z" />
              </svg>
              สถานะงาน
            </a>
          </li>

          {/* Logout */}
          <li>
            <div style={{marginTop:'2rem',marginLeft:'1rem'}}>
            <Logout onLogout={handleLogout} />
            </div>
            
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default NevbarV2_M;
