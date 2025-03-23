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
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCategories();
        fetchItemCounts();
    }, []);

    // Start of Edit Modal

    const [editCategory, setEditCategory] = useState({
        name: '',
        description: '',
        image: ''
    });
    const [showEditModal, setShowEditModal] = useState(false);
    const handleUpdateCategory = async (e) => {
        e.preventDefault();
        try {
            // Prepare the update data
            const categoryData = {
                name: editCategory.name,
                description: editCategory.description || '',
                image: selectedImage ? (selectedImage.startsWith('data:') ? selectedImage : `data:image/jpeg;base64,${selectedImage}`) : editCategory.image,
                subCategories: selectedCategory.subCategories
            };

            const response = await axios.put(
                `https://resource-link-main-14c755858b60.herokuapp.com/api/categories/${selectedCategory._id}`,
                categoryData,
                { 
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            await fetchCategories();
            handleCloseEditModal();
            toast.success('Category updated successfully');
        } catch (error) {
            console.error('Error updating category:', error.response?.data || error);
            toast.error(error.response?.data?.message || 'Failed to update category. Please try again.');
        }
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setEditCategory({ name: '', description: '', image: '' });
        setSelectedImage(null);
        setImagePreview(null);
    };

    const handleEditClick = (e, category) => {
        e.stopPropagation();
        setSelectedCategory(category);
        setEditCategory({
            name: category.name,
            description: category.description || '',
            image: category.image || ''
        });
        setImagePreview(getImageUrl(category.image));
        setShowEditModal(true);
    };



    // End of Edit Modal
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

        setIsSubmitting(true);
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
            setIsSubmitting(false);
            toast.success('Category created successfully');
        } catch (error) {
            console.error('Error creating category:', error);
            toast.error(error.response?.data?.message || 'Failed to create category');
            setIsSubmitting(false);
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
            setIsDeleting(true);
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
        } finally {
            setIsDeleting(false);
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
                                        handleEditClick(e, category);
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

            {showEditModal && selectedCategory && (
                <div className="category-modal-backdrop">
                    <div className="category-form-container">
                        <div className="category-form-header">
                            <h2>Edit Category</h2>
                            <button className="category-close-button" onClick={handleCloseEditModal}>×</button>
                        </div>
                        <form onSubmit={handleUpdateCategory}>
                            <div className="category-image-upload">
                                <input
                                    type="file"
                                    id="editCategoryImage"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    style={{ display: 'none' }}
                                />
                                <label htmlFor="editCategoryImage" className="category-upload-placeholder">
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
                                    value={editCategory.name}
                                    onChange={(e) => setEditCategory({
                                        ...editCategory,
                                        name: e.target.value
                                    })}
                                    required
                                />
                            </div>
                            <div className="category-form-group">
                                <label>Description</label>
                                <input
                                    type="text"
                                    value={editCategory.description}
                                    onChange={(e) => setEditCategory({
                                        ...editCategory,
                                        description: e.target.value
                                    })}
                                />
                            </div>

                            <button type="submit" className="category-create-button">Update</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Category Modal */}
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

                            <button 
                                type="submit" 
                                className="category-create-button"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="spinner"></span>
                                        Creating...
                                    </>
                                ) : (
                                    'Create'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="category-modal-backdrop">
                    <div className="category-form-container">
                        <div className="category-form-header">
                            <h2>Delete Category</h2>
                            <button 
                                className="category-close-button"
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setSelectedCategory(null);
                                }}
                            >
                                &times;
                            </button>
                        </div>
                        <div className="delete-confirmation">
                            <p>Are you sure you want to delete "{selectedCategory?.name}"?</p>
                            <p className="warning">This action cannot be undone.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', padding: '1rem' }}>
                            <button 
                                style={{
                                    backgroundColor: '#f8f9fa',
                                    border: '1px solid #dee2e6',
                                    color: '#495057',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    marginRight: '0.5rem'
                                }}
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setSelectedCategory(null);
                                }}
                            >
                                Cancel
                            </button>
                            <button 
                                style={{
                                    backgroundColor: '#dc3545',
                                    border: '1px solid #dc3545',
                                    color: 'white',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    opacity: isDeleting ? 0.7 : 1
                                }}
                                onClick={handleDeleteCategory}
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminInventory;