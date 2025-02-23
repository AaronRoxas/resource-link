import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../styles/new/admin.css';
import Navbar from '../../components/NavBar';
import { toast } from 'react-toastify';

const AdminInventory = () => {
    const [categories, setCategories] = useState([]);
    const [categoryItemCounts, setCategoryItemCounts] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [newCategory, setNewCategory] = useState({
        name: '',
        description: ''
    });
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const navigate = useNavigate();

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
            toast.error('Failed to fetch categories');
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

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5000000) {
                toast.error('File is too large. Please choose an image under 5MB.');
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
        if (!newCategory.name.trim()) {
            toast.error('Category name is required');
            return;
        }

        try {
            const categoryData = {
                name: newCategory.name.trim(),
                description: newCategory.description?.trim() || '',
                image: selectedImage || ''
            };

            await axios.post(
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
            setShowModal(false);
            setNewCategory({ name: '', description: '' });
            setSelectedImage(null);
            setImagePreview(null);
            toast.success('Category created successfully');
        } catch (error) {
            console.error('Error creating category:', error);
            toast.error(error.response?.data?.message || 'Failed to create category');
        }
    };

    const handleCategoryClick = (categoryName) => {
        navigate(`/admin/category/${categoryName.toLowerCase().replace(/\s+/g, '-')}`);
    };

    const getImageUrl = (imageData) => {
        if (!imageData || imageData === 'null' || imageData === null) {
            return process.env.PUBLIC_URL + "/dashboard-imgs/placeholder.svg";
        }
        return imageData.startsWith('data:') ? imageData : `data:image/jpeg;base64,${imageData}`;
    };

    const handleDeleteClick = (e, category) => {
        e.stopPropagation();
        setSelectedCategory(category);
        setShowDeleteModal(true);
    };

    const handleDeleteCategory = async () => {
        if (!selectedCategory) return;

        try {
            await axios.delete(
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

    const handleCloseModal = () => {
        setShowModal(false);
        setNewCategory({ name: '', description: '' });
        setSelectedImage(null);
        setImagePreview(null);
    };

    return (
        <div className="admin-page">
            <div className="admin-container">
                <div className="welcome-section">
                    <Navbar hideWelcome={true}/>
                </div>

                <header className="inventory-header">
                    <h1>Inventory</h1>
                </header>

                <div className="admin-section">
                    <div className="section-header">
                        <h2>Categories</h2>
                    </div>

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
                                            e.target.onerror = null;
                                            e.target.src = process.env.PUBLIC_URL + "/dashboard-imgs/placeholder.svg";
                                        }}
                                    />
                                </div>
                                <div className="category-info">
                                    <h3>{category.name}</h3>
                                    <p className="category-description">{category.description}</p>
                                </div>
                                <button 
                                    className="edit-button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // TODO: Add edit functionality
                                    }}
                                >
                                    Edit
                                </button>
                                <button 
                                    className="delete-button"
                                    onClick={(e) => handleDeleteClick(e, category)}
                                >
                                    Delete
                                </button>
                            </div>
                        ))}

                        <div className="category-card new-category" onClick={() => setShowModal(true)}>
                            <div className="new-category-content">
                                <span className="plus-icon">+</span>
                                <span>Create new category</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Category Modal */}
            {showModal && (
                <div className="modal-backdrop">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h2>Create new category</h2>
                        </div>
                        <form onSubmit={handleSubmitCategory} className="modal-form">
                            <div className="image-upload-container">
                                <label htmlFor="categoryImage" className="image-upload-label">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Category preview" />
                                    ) : (
                                        <span className="plus-icon">+</span>
                                    )}
                                </label>
                                <input
                                    id="categoryImage"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    style={{ display: 'none' }}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="categoryName">Name <span className="required">*</span></label>
                                <input
                                    id="categoryName"
                                    type="text"
                                    value={newCategory.name}
                                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="categoryDescription">Description</label>
                                <input
                                    id="categoryDescription"
                                    type="text"
                                    value={newCategory.description}
                                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="create-button">Create</button>
                            <button type="button" className="cancel-button" onClick={handleCloseModal}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal-backdrop">
                    <div className="modal-container delete-modal">
                        <div className="modal-header">
                            <h2>Delete Category</h2>
                            <button 
                                className="close-button"
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setSelectedCategory(null);
                                }}
                            >
                                &times;
                            </button>
                        </div>
                        <div className="modal-content">
                            <p>Are you sure you want to delete "{selectedCategory?.name}"?</p>
                            <p className="warning-text">This action cannot be undone.</p>
                        </div>
                        <div className="modal-actions">
                            <button 
                                className="cancel-button"
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setSelectedCategory(null);
                                }}
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
            )}
        </div>
    );
};

export default AdminInventory;