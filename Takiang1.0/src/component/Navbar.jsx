import React, { useEffect, useState, useRef } from 'react';
import '../Css/Navbar.css';
import Logout from './Logout';

function Navbar() {
  const [role, setRole] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const storedRole = localStorage.getItem('userRole');
    if (storedRole) {
      setRole(storedRole.trim().toLowerCase());
    }
  }, []);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (!role) {
      window.location.replace('/');
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', () => window.location.replace('/'));
    window.location.replace('/');
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  };

  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roleName = {
    admin: 'ผู้ดูแลระบบ',
    graphic: 'กราฟิก',
    marketing: 'การตลาด'
  };

  return (
    <div className="navbar">
      <div className="logo">
        <h2>TAKIANG</h2>
      </div>
      <nav className="menu">
        <ul>
          <li><a href="/workform">เพิ่มงาน</a></li>

          <li className="submenu" ref={dropdownRef}>
            <a href="#" onClick={toggleDropdown}>ตารางงาน ▼</a>
            {isDropdownOpen && (
              <ul className="dropdown">
                <li><a href="/worktable">ตารางงานทั้งหมด</a></li>
                <li><a href="/GraphicWorkTable">ตารางงานกราฟิก</a></li>
                <li><a href="/MarketingWorkTable">ตารางงานการตลาด</a></li>
                <li><a href="/AdminWorkTable">ตารางงานแอดมิน</a></li>
              </ul>
            )}
          </li>

          <li><a href="/Create_user">สร้างบัญชี</a></li>

          <p className="role">ตำแหน่ง: {roleName[role] || `ไม่ทราบสิทธิ์ (${role})`}</p>

          <li><Logout onLogout={handleLogout} /></li>
        </ul>
      </nav>
    </div>
  );
}

export default Navbar;
