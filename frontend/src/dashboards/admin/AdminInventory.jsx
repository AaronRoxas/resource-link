import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BottomNav from '../../components/BottomNav';
import { useNavigate } from 'react-router-dom';
import '../../styles/AdminInventory.css';
import Navbar from '../../components/NavBar';
import { toast } from 'react-toastify';
const AdminInventory = () => {
    const [categories, setCategories] = useState([]);
    const [categoryItemCounts, setCategoryItemCounts] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
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
                const base64String = reader.result.split(',')[1];
                setSelectedImage(base64String);
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmitCategory = async (e) => {
        e.preventDefault();
        try {
            const categoryData = {
                name: newCategory.name,
                description: newCategory.description || '',
                image: selectedImage || ''
            };

            const response = await axios.post(
                'https://resource-link-main-14c755858b60.herokuapp.com/api/categories',
                categoryData,
                { 
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            await fetchCategories();
            handleCloseModal();
            toast.success('Category created successfully');
        } catch (error) {
            console.error('Error creating category:', error.response?.data || error);
            toast.error(error.response?.data?.message || 'Failed to create category. Please try again.');
        }
    };


    const handleCategoryClick = (categoryName) => {
        navigate(`/admin/category/${categoryName.toLowerCase().replace(/\s+/g, '-')}`);
    };

    const getImageUrl = (imageData) => {
        if (!imageData || imageData === 'null' || imageData === null) {
            return process.env.PUBLIC_URL + "/dashboard-imgs/placeholder.svg";
        }
        // Check if the image data already includes the data URL prefix
        return imageData.startsWith('data:') 
            ? imageData 
            : `data:image/jpeg;base64,${imageData}`;
    };

    const handleDeleteClick = (e, category) => {
        e.stopPropagation();
        setSelectedCategory(category);
        setShowDeleteModal(true);
    };

    const handleDeleteCategory = async () => {
        try {
            const response = await axios.delete(
                `https://resource-link-main-14c755858b60.herokuapp.com/api/categories/${selectedCategory._id}`,
                { withCredentials: true }
            );
            
            await fetchCategories();
            setShowDeleteModal(false);
            setSelectedCategory(null);
            toast.success('Category deleted successfully');
        } catch (error) {
            console.error('Error deleting category:', error);
            toast.error('Failed to delete category');
        }
    };

    return (
        <div className="inventory-page">
            <Navbar hideWelcome={true}/>
            <header>
                <h1>Inventory</h1>
            </header>

            <div className="categories-grid">
                {categories.map((category) => (
                    <div 
                        key={category._id} 
                        className="category-card"
                        onClick={() => handleCategoryClick(category.name)}
                    >
                        <div className="category-image">
                            <img 
                                src={getImageUrl(category.image)} 
                                alt={category.name}
                                onError={(e) => {
                                    e.target.onerror = null; // Prevent infinite loop
                                    e.target.src = process.env.PUBLIC_URL + "/dashboard-imgs/placeholder.svg";
                                }}
                            />
                        </div>
                        <div className="category-info">
                            <h3>{category.name}</h3>
                            <p>{category.description}</p>
                            <button 
                                className="delete-category-btn"
                                onClick={(e) => handleDeleteClick(e, category)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
                
                <div className="category-card new-category" onClick={handleCreateCategory}>
                    <div className="create-category-content">
                        <span>+</span>
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
                                <label>Name <span className="required">*</span></label>
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
                            <div className="category-form-group">
                                <label>Description</label>
                                <input
                                    type="text"
                                    value={newCategory.description}
                                    onChange={(e) => setNewCategory({
                                        ...newCategory,
                                        description: e.target.value
                                    })}
                                />
                            </div>

                            <button type="submit" className="category-create-button">Create</button>
                        </form>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="category-modal-backdrop">
                    <div className="category-form-container">
                        <div className="category-form-header">
                            <h2>Delete Category</h2>
                            <button 
                                className="category-close-button" 
                                onClick={() => setShowDeleteModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="delete-confirmation">
                            <p>Are you sure you want to delete "{selectedCategory?.name}"?</p>
                            <p className="warning">This action cannot be undone.</p>
                            <div className="delete-actions">
                                <button 
                                    className="cancel-button"
                                    onClick={() => setShowDeleteModal(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="delete-button"
                                    onClick={handleDeleteCategory}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminInventory;