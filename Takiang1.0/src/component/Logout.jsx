import React, { useState } from 'react';
import '../Css/Logout.css'


const Logout = ({ onLogout }) => {
  const [visible, setVisible] = useState(true);

  const handleClick = () => {
    if (onLogout) onLogout();
    setVisible(false);
  };

  if (!visible) return null;

  

  return (
    <div style={styles.container}>
      
      <button onClick={handleClick}  className='buttonL'>
        ออกจากระบบ
      </button>
    </div>
  );
};

const styles = {
  container: {
    
    
    
    borderRadius: '8px',
    
  },
  
  
  
};

export default Logout;
