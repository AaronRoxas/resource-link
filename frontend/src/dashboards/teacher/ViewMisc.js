import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BottomNav from '../../components/BottomNav';
import { useNavigate } from 'react-router-dom';


const ViewMisc = () => {
    const [misc, setMisc] = useState([]);
    const [borrowItem, setBorrowItem] = useState(null);
    const [borrowFormData, setBorrowFormData] = useState({ borrower: '', borrowDate: '', returnDate: '' });
    const navigate = useNavigate();
    const navItems = [
        { path: '/teacher', icon: 'active-home', label: 'Home' },
        { path: '/teacherCategories', icon: 'cube', label: 'Inventory' },
    ];

    // Fetch devices data
    useEffect(() => {
        const fetchMisc = async () => {
            try {
                const response = await axios.get('https://resource-link-main-14c755858b60.herokuapp.com/api/inventory', {
                    withCredentials: true
                });
                const filteredMisc = response.data.filter(item => item.category === 'Miscellaneous');
                setMisc(filteredMisc);
            } catch (error) {
                console.error('Error fetching misc:', error);
            }
        };

        fetchMisc();
    }, []);




    const handleBorrow = async () => {
        try {
            const response = await axios.post(`http://localhost:5000/api/inventory/borrow/${borrowItem._id}`, borrowFormData, {
                withCredentials: true
            });
            console.log('Item borrowed successfully:', response.data);
            setMisc(misc.map(item => (item._id === borrowItem._id ? { ...item, ...response.data } : item)));
            setBorrowItem(null);
        } catch (error) {
            console.error('Error borrowing item:', error);
        }
    };


    const handleBack = () => {
        navigate('/teacher'); // Navigate to the teacher dashboard
    };

    return (
        <div className="view-books">
            <h1>
                <img src="back-arrow.svg" alt="Back" className="back-arrow" onClick={handleBack} /> 
                &nbsp;Miscellaneous
            </h1>
            <div className="table-container">
                <hr />
                <table>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Status</th>
                            <th>Serial No.</th>
                            <th>Category</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {misc.map((item) => (
                            <tr key={item._id}>
                                <td data-label="Item">{item.name}</td>
                                <td data-label="Status">{item.status}</td>
                                <td data-label="Serial No.">{item.serialNo}</td>
                                <td data-label="Category">{item.category}</td>
                                <td data-label="Action" className="action-icons">
                                    <img 
                                        src="/table-imgs/edit.svg" 
                                        alt="Edit" 
                                        onClick={() => setBorrowItem(item)} 
                                        className="icon" 
                                    />
                                   <span className="action-text edit-text" onClick={() => handleBorrow(item)}>Borrow Item</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Borrow Modal */}
            {borrowItem && (
                <div className="edit-item-modal">
                    <div className="edit-item-modal-content">
                        <span className="close" onClick={() => setBorrowItem(null)}>&times;</span>
                        <h2>Borrow Item</h2>
                        <div className="field">
                            <label>Borrower Name</label>
                            <input 
                                type="text" 
                                value= {localStorage.getItem('username')}
                                onChange={(e) => setBorrowFormData({ ...borrowFormData, borrower: e.target.value })} 
                                placeholder="Borrower Name" 
                                disabled // Make the field read-only
                                className="disabled-input"
                            />
                        </div>
                        <div className="field">
                            <label>Borrow Date</label>
                            <input 
                                type="date" 
                                value={borrowFormData.borrowDate} 
                                onChange={(e) => setBorrowFormData({ ...borrowFormData, borrowDate: e.target.value })} 
                            />
                        </div>
                        <div className="field">
                            <label>Return Date</label>
                            <input 
                                type="date" 
                                value={borrowFormData.returnDate} 
                                onChange={(e) => setBorrowFormData({ ...borrowFormData, returnDate: e.target.value })} 
                            />
                        </div>
                        <button className="submit-button" onClick={handleBorrow}>Borrow</button>
                        <button className="cancel-button" onClick={() => setBorrowItem(null)}>Cancel</button>
                    </div>
                </div>
            )}

            <BottomNav navItems={navItems} />
        </div>
    );
}

export default ViewMisc;