import React, { useEffect, useState } from 'react';
import '../Css/NavV2.css';
import Logout from './Logout_Admin';

function NevbarV2() {
  const [teamId, setTeamId] = useState(null);
  const [agentName, setAgentName] = useState('');
  const [expandedMenu, setExpandedMenu] = useState(null);

  const toggleSubMenu = (menu) => {
    setExpandedMenu(expandedMenu === menu ? null : menu);
  };

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

          {/* เพิ่มข้อมูล */}
          <li className="menu-group">
            <div className="menu-main" onClick={() => toggleSubMenu('add')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-file-earmark-plus-fill" viewBox="0 0 16 16">
                <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0M9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1M8.5 7v1.5H10a.5.5 0 0 1 0 1H8.5V11a.5.5 0 0 1-1 0V9.5H6a.5.5 0 0 1 0-1h1.5V7a.5.5 0 0 1 1 0" />
              </svg>
              <span>เพิ่มข้อมูล {expandedMenu === 'add' ? '▼' : '▶'}</span>
            </div>
            {expandedMenu === 'add' && (
              <ul className="submenu">
                <li><a href="/workform">เพิ่มโปรเจค</a></li>
                <li><a href="/FormTask_works">เพิ่ม Task + SubTask</a></li>
              </ul>
            )}
          </li>

          {/* ตารางงาน */}
          <li className="menu-group">
            <div className="menu-main" onClick={() => toggleSubMenu('tables')}>
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-file-spreadsheet-fill" viewBox="0 0 16 16">
  <path d="M12 0H4a2 2 0 0 0-2 2v4h12V2a2 2 0 0 0-2-2m2 7h-4v2h4zm0 3h-4v2h4zm0 3h-4v3h2a2 2 0 0 0 2-2zm-5 3v-3H6v3zm-4 0v-3H2v1a2 2 0 0 0 2 2zm-3-4h3v-2H2zm0-3h3V7H2zm4 0V7h3v2zm0 1h3v2H6z"/>
</svg>
              <span>ตารางงาน {expandedMenu === 'tables' ? '▼' : '▶'}</span>
            </div>
            {expandedMenu === 'tables' && (
              <ul className="submenu">
                <li><a href="/ProjectTable">โปรเจคทั้งหมด</a></li>
                <li><a href="/MarketingWorkTable">การตลาด</a></li>
                <li><a href="/GraphicWorkTable">กราฟิก</a></li>
                <li><a href="/AdminWorkTable">แอดมิน</a></li>
              </ul>
            )}
          </li>

          {/* งานของฉัน */}
          <li className="menu-group">
            <div className="menu-main">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-file-earmark-spreadsheet" viewBox="0 0 16 16">
                <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2..." />
              </svg>
              <a href="/Mywork">งานของฉัน</a>
            </div>
          </li>
          
        

           <li>
            <a href="/Submit_Work_A" className="menu-main">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                className="bi bi-briefcase-fill" viewBox="0 0 16 16">
                <path d="M6.5 1A1.5 1.5 0 0 0 5 2.5V3H1.5A1.5 1.5 0 0 0 0 4.5v1.384l7.614 2.03a1.5 1.5 0 0 0 .772 0L16 5.884V4.5A1.5 1.5 0 0 0 14.5 3H11v-.5A1.5 1.5 0 0 0 9.5 1zm0 1h3a.5.5 0 0 1 .5.5V3H6v-.5a.5.5 0 0 1 .5-.5" />
                <path d="M0 12.5A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5V6.85L8.129 8.947a.5.5 0 0 1-.258 0L0 6.85z" />
              </svg>
              ส่งงาน
            </a>
          </li>

          <li>
            <a href="/ReviewStatusPage_A" className="menu-main">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                className="bi bi-briefcase-fill" viewBox="0 0 16 16">
                <path d="M6.5 1A1.5 1.5 0 0 0 5 2.5V3H1.5A1.5 1.5 0 0 0 0 4.5v1.384l7.614 2.03a1.5 1.5 0 0 0 .772 0L16 5.884V4.5A1.5 1.5 0 0 0 14.5 3H11v-.5A1.5 1.5 0 0 0 9.5 1zm0 1h3a.5.5 0 0 1 .5.5V3H6v-.5a.5.5 0 0 1 .5-.5" />
                <path d="M0 12.5A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5V6.85L8.129 8.947a.5.5 0 0 1-.258 0L0 6.85z" />
              </svg>
              สถานะงาน
            </a>
          </li>
          
          <li className="menu-group">
            <div className="menu-main">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pen-fill" viewBox="0 0 16 16">
  <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001"/>
</svg>
              <a href="/Check_work">ตรวจสอบงาน</a>
            </div>
          </li>

          {/* Log */}
          <li className="menu-group">
            <div className="menu-main">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-archive-fill" viewBox="0 0 16 16">
  <path d="M12.643 15C13.979 15 15 13.845 15 12.5V5H1v7.5C1 13.845 2.021 15 3.357 15zM5.5 7h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1 0-1M.8 1a.8.8 0 0 0-.8.8V3a.8.8 0 0 0 .8.8h14.4A.8.8 0 0 0 16 3V1.8a.8.8 0 0 0-.8-.8z"/>
</svg>
              <a href="/ActivityLog">Log</a>
            </div>
          </li>

          {/* สร้างบัญชี */}
          <li className="menu-group">
            <div className="menu-main">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-fill-add" viewBox="0 0 16 16">
  <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m.5-5v1h1a.5.5 0 0 1 0 1h-1v1a.5.5 0 0 1-1 0v-1h-1a.5.5 0 0 1 0-1h1v-1a.5.5 0 0 1 1 0m-2-6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
  <path d="M2 13c0 1 1 1 1 1h5.256A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1 1.544-3.393Q8.844 9.002 8 9c-5 0-6 3-6 4"/>
</svg>
              <a href="/Create_user">สร้างบัญชี</a>
            </div>
          </li>

          {/* Logout */}
          <li className="menu-group" >
            <div style={{marginTop:'23rem',marginLeft:'1rem'}}>
            <Logout onLogout={handleLogout} />
            </div>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default NevbarV2;
