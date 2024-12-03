import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BottomNav from '../../components/BottomNav';
import { useNavigate } from 'react-router-dom';
import '../../styles/AdminInventory.css';

const AdminInventory = () => {
    const [categories, setCategories] = useState([]);
    const [categoryItemCounts, setCategoryItemCounts] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [newCategory, setNewCategory] = useState({
        name: ''
    });
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const navigate = useNavigate();

    const navItems = [
        { path: '/admin', icon: 'home', label: 'Home' },
        { path: '/adminChart', icon: 'chart', label: 'Chart' },
        { path: '/admin/manage-user', icon: 'profile', label: 'Manage User' },
        { path: '/admin/inventory', icon: 'active-cube', label: 'Inventory' }
    ];

    useEffect(() => {
        fetchCategories();
        fetchItemCounts();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('https://resource-link-main-14c755858b60.herokuapp.com/api/categories', {
                withCredentials: true
            });
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchItemCounts = async () => {
        try {
            const response = await axios.get('https://resource-link-main-14c755858b60.herokuapp.com/api/items/count-by-category', {
                withCredentials: true
            });
            setCategoryItemCounts(response.data);
        } catch (error) {
            console.error('Error fetching item counts:', error);
        }
    };

    const handleCreateCategory = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setNewCategory({ name: '' });
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5000000) { // 5MB limit
                alert('File is too large. Please choose an image under 5MB.');
                return;
            }
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result); // This is already base64
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmitCategory = async (e) => {
        e.preventDefault();
        try {
            if (!selectedImage) {
                alert('Please select an image');
                return;
            }

            const response = await axios.post(
                'https://resource-link-main-14c755858b60.herokuapp.com/api/categories',
                {
                    name: newCategory.name,
                    image: selectedImage
                },
                { 
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            setCategories([...categories, response.data]);
            handleCloseModal();
        } catch (error) {
            console.error('Error creating category:', error);
            alert('Failed to create category. Please try again.');
        }
    };

    const handleCategoryClick = (categoryName) => {
        navigate(`/admin/category/${categoryName.toLowerCase().replace(/\s+/g, '-')}`);
    };

    return (
        <div className="inventory-page">
            <header>
                <h1>Inventory</h1>
            </header>

            <div className="categories-grid">
                {categories.map((category) => (
                    <div 
                        key={category._id} 
                        className="category-card"
                        onClick={() => handleCategoryClick(category.name)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="category-image">
                            <img 
                                src={category.image || "/dashboard-imgs/placeholder.svg"} 
                                alt={category.name} 
                            />
                        </div>
                        <div className="category-info">
                            <h3>{category.name}</h3>
                            <p>{category.description}</p>
                        </div>
                    </div>
                ))}
                
                <div className="category-card new-category" onClick={handleCreateCategory}>
                    <div className="create-category-content">
                        <span>Create new category</span>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="category-modal-backdrop">
                    <div className="category-form-container">
                        <div className="category-form-header">
                            <h2>Create new category</h2>
                            <button className="category-close-button" onClick={handleCloseModal}>×</button>
                        </div>
                        <form onSubmit={handleSubmitCategory}>
                            <div className="category-image-upload">
                                <input
                                    type="file"
                                    id="categoryImage"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    style={{ display: 'none' }}
                                />
                                <label htmlFor="categoryImage" className="category-upload-placeholder">
                                    {imagePreview ? (
                                        <img 
                                            src={imagePreview} 
                                            alt="Category preview" 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <>
                                            <span className="category-plus-icon">+</span>
                                           
                                        </>
                                    )}
                                </label>
                            </div>
                            
                            <div className="category-form-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    value={newCategory.name}
                                    onChange={(e) => setNewCategory({
                                        ...newCategory,
                                        name: e.target.value
                                    })}
                                    required
                                />
                            </div>

                            <button type="submit" className="category-create-button">Create</button>
                        </form>
                    </div>
                </div>
            )}

            <BottomNav navItems={navItems} />
        </div>
    );
};

export default AdminInventory;