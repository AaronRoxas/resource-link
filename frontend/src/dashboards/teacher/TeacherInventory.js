import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const TeacherInventory = () => {
  const [borrowedItems, setBorrowedItems] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchBorrowedItems = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/borrowings');
        setBorrowedItems(response.data);
      } catch (error) {
        console.error('Error fetching borrowed items:', error);
      }
    };

    fetchBorrowedItems();
  }, []);
  const handleBack = () => {
    navigate('/teacher'); // Navigate to the teacher dashboard
};


  return (
    <div>
          <h1>
                <img src="back-arrow.svg" alt="Back" className="back-arrow" onClick={handleBack} /> 
                &nbsp;Books
            </h1>
      <ul>
        {borrowedItems.map(item => (
          <li key={item._id}>
            {item.itemId.name} - {item.borrowDate} {/* Adjust as necessary */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TeacherInventory;