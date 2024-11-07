import React, { useState } from 'react';
import BottomNav from '../components/BottomNav';
import '../styles/CreateNewCategories.css';

const CreateNewCategories = () => {
    const navItems = [
        { path: '/admin', icon: 'home', label: 'Home' },
        { path: '/chart', icon: 'chart', label: 'Chart' },
        { path: '/qr-code', icon: 'qr', label: 'QR Code' },
        { path: '/addUser', icon: 'profile', label: 'Add User' },
        { path: '/adminCategories', icon: 'active-cube', label: 'Categories' },
    ];

    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [type, setType] = useState('Asset');
    const [image, setImage] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission logic here
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(URL.createObjectURL(file)); // Create a URL for the selected image
        }
    };

    const handlePlaceholderClick = () => {
        document.getElementById('image-upload').click(); // Trigger the file input click
    };

    return (
        <div className="create-new-category-container">
            <h1>Create new category</h1>
            <form className="create-new-category-form" onSubmit={handleSubmit}>
                <div className="form-layout">
                    <div className="form-inputs">
                        <label className="create-new-category-label">
                            Name:
                            <input 
                                className="create-new-category-input" 
                                type="text" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                            />
                        </label>
                        <label className="create-new-category-label">
                            Location:
                            <input 
                                className="create-new-category-input" 
                                type="text" 
                                value={location} 
                                onChange={(e) => setLocation(e.target.value)} 
                            />
                        </label>
                        <label className="create-new-category-label">
                            Type:
                            <select 
                                className="create-new-category-select" 
                                value={type} 
                                onChange={(e) => setType(e.target.value)}
                            >
                                <option value="Asset">Asset</option>
                                {/* Add more options as needed */}
                            </select>
                        </label>
                    </div>
                    <div className="add-image-container" onClick={handlePlaceholderClick}>
                        <div className="add-image-placeholder">
                            {image ? <img src={image} alt="Selected" style={{ width: '100%', height: '100%', borderRadius: '4px' }} /> : '+'}
                        </div>
                        <input 
                            type="file" 
                            id="image-upload" 
                            style={{ display: 'none' }} 
                            accept="image/*" 
                            onChange={handleImageChange} 
                        />
                        <p>Add Image</p>
                    </div>
                </div>
                <button className="create-new-category-button" type="submit">Create</button>
            </form>
            <BottomNav navItems={navItems} />
        </div>
    );
}

export default CreateNewCategories;