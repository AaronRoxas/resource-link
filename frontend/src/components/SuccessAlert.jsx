import React from 'react'
import '../styles/TeacherDash.css';

const SuccessAlert = ({ onClose }) => {
    console.log('SuccessAlert called');
  return (
    <div className="alert success">
        <span>Borrowed successfully!</span>
        <span className="closebtn" onClick={onClose}>&times;</span>
    </div>
  )
}

export default SuccessAlert