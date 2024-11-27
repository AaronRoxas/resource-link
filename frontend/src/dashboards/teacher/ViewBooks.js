import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BottomNav from '../../components/BottomNav';
import { useNavigate } from 'react-router-dom';
import BorrowItem from './BorrowItem';
import '../../styles/ViewItems.css';
import ItemInformation from '../../components/ItemInformation';
const ViewBooks = () => {
    const [books, setBooks] = useState([]);
    const [borrowItem, setBorrowItem] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const navigate = useNavigate();
    const navItems = [
        { path: '/teacher', icon: 'active-home', label: 'Home' },
        { path: '/teacherInventory', icon: 'cube', label: 'Inventory' },
    ];

    // Fetch books data
    const fetchBooks = async () => {
        try {
            const response = await axios.get('https://resource-link-main-14c755858b60.herokuapp.com/api/inventory', {
                withCredentials: true
            });
            const filteredBooks = response.data.filter(item => item.category === 'Books');
            setBooks(filteredBooks);
        } catch (error) {
            console.error('Error fetching devices:', error);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    const handleBack = () => {
        navigate('/teacher');
    };


      const handleCloseItemInfo = () => {
        setSelectedItem(null);
      };

    return (
        <div className="view-books">
            <header>
                <div className="back-header">
                    <img 
                        src="back-arrow.svg" 
                        alt="Back" 
                        className="back-arrow" 
                        onClick={handleBack}
                    />
                    <h1>Books, Modules</h1>
                </div>
            </header>

            <div className="books-grid">
                {books.map((book) => (
                    <div key={book._id} className="book-card" >
                        <div className="book-image">
                            <img src="dashboard-imgs/placeholder.svg" alt={book.name} />
                        </div>
                        <div className="book-info">
                            <h3>{book.name}</h3>
                            <p className="category">{book.category}</p>
                            <button 
                                className="item-borrow-btn"
                                onClick={() => setBorrowItem(book)}
                                disabled={book.stocks <= 0}
                            >
                                Borrow
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {borrowItem && (
                <BorrowItem 
                    item={borrowItem} 
                    onClose={() => setBorrowItem(null)} 
                    fetchItems={fetchBooks} 
                />
            )}

            {selectedItem && (
                <ItemInformation 
                    selectedItem={selectedItem} 
                    handleCloseItemInfo={handleCloseItemInfo} 
                />
            )}

            <BottomNav navItems={navItems} />
        </div>
    );
}

export default ViewBooks;