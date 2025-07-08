import React, { useEffect, useState } from 'react';
import '../Css/Navbar.css';
import Logout from './Logout';
function Navbar_graphic() {
  const [role, setRole] = useState('');

  useEffect(() => {
    const storedRole = localStorage.getItem('userRole');
    console.log('ดึง role จาก localStorage:', storedRole); // DEBUG
    if (storedRole) {
      setRole(storedRole.trim().toLowerCase()); // ✅ แปลงเป็นตัวพิมพ์เล็กและลบช่องว่าง
    }
  }, []);



  // แปลง role เป็นภาษาไทย
  const roleName = {
    admin: 'ผู้ดูแลระบบ',
    graphic: 'กราฟิก',
    marketing: 'การตลาด'
  };

  const handleLogout = () => {
    localStorage.clear(); 
  
    
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', function () {
      window.location.replace('/');
    });
  
    window.location.replace('/');
  };
  
  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (!role) {
      window.location.replace('/'); // ถ้าไม่มี role -> redirect
    }
  }, []);

  return (
    <div className="navbar">
      <div className="logo">
        <h2>TAKIANG</h2>
      </div>
      <nav className="menu">
        <ul>
          <li style={{ marginLeft: '5rem' }}>
            <a href="/GraphicWorkTable_U">ตารางงานกราฟิก</a> </li>
           
           
          <p className='role'>ทีม: {roleName[role] || `ไม่ทราบสิทธิ์ (${role})`}</p> 
          <li><Logout onLogout={handleLogout}/></li>
        </ul>
      </nav>
      
        
      
    </div>
  );
}

export default Navbar_graphic;
