import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../../components/NavBar';
import ItemInformation from '../../components/ItemInformation';
import '../../styles/ViewItems.css';
import Navbar from '../../components/NavBar';
import { toast } from 'react-toastify';

const StaffInventoryItems = () => {
    const [items, setItems] = useState([]);
    const [categoryName, setCategoryName] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const { categoryName: urlCategoryName } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [deletingItemId, setDeletingItemId] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showSubCategoryModal, setShowSubCategoryModal] = useState(false);
    const [newSubCategory, setNewSubCategory] = useState('');
    const [category, setCategory] = useState(null);
    const [showAddItemModal, setShowAddItemModal] = useState(false);
    const [showItemTypeModal, setShowItemTypeModal] = useState(false);
    const [showAddConsumableModal, setShowAddConsumableModal] = useState(false);
    const [newItem, setNewItem] = useState({
        type: '',
        name: '',
        serialNo: '',
        purchaseDate: '',
        purchaseCost: '',
        notes: '',
        image: null,
        subCategory: '',
        qty: 0,
        id: ''
    });

    // New states for search functionality
    const [searchExpanded, setSearchExpanded] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const navItems = [
        { path: '/staff', icon: 'home', label: 'Home' },
        { path: '/qr', icon: 'qr', label: '' },
        { path: '/staff/inventory', icon: 'active-cube', label: 'Inventory' }
    ];

    const fetchCategoryItems = async () => {
        try {
            const categoriesResponse = await axios.get('https://resource-link-main-14c755858b60.herokuapp.com/api/categories');
            const foundCategory = categoriesResponse.data.find(
                cat => cat.name.toLowerCase().replace(/[&\s]+/g, '-') === urlCategoryName
            );

            if (!foundCategory) {
                console.error('Category not found');
                return;
            }

            setCategory(foundCategory);
            setCategoryName(foundCategory.name);

            const itemsResponse = await axios.get('https://resource-link-main-14c755858b60.herokuapp.com/api/inventory');
            const categoryItems = itemsResponse.data.filter(
                item => item.category === foundCategory.name
            );
            setItems(categoryItems);

        } catch (error) {
            console.error('Error fetching items:', error);
        }
    };

    useEffect(() => {
        fetchCategoryItems();
    }, [urlCategoryName]);

    // Filter items based on the search term
    const getFilteredItems = () => {
        if (!searchTerm) return items;
        return items.filter((item) => {
            const matchName =
                item.name?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchId =
                item.id?.toLowerCase().includes(searchTerm.toLowerCase());
            return matchName || matchId;
        });
    };

    const handleBack = () => {
        navigate('/staff/inventory');
    };

    const handleCloseItemInfo = () => {
        setSelectedItem(null);
    };

    const handleItemClick = (item) => {
        navigate(`/staff/category/${item.category.toLowerCase()}/${item.id}`);
    };

    const handleEditItem = (item) => {
        setEditingItem(item);
        setShowEditModal(true);
    };

    const handleDeleteItem = async (item) => {
        setDeletingItemId(item._id);
        try {
            await axios.delete(`https://resource-link-main-14c755858b60.herokuapp.com/api/inventory/${item._id}`, {
                withCredentials: true
            });
            toast.success('Item deleted successfully!');
            fetchCategoryItems();
        } catch (error) {
            console.error('Error deleting item:', error);
            toast.error('Failed to delete item');
        } finally {
            setDeletingItemId(null);
        }
    };

    const handleSubmitEdit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await axios.put(
                `https://resource-link-main-14c755858b60.herokuapp.com/api/inventory/${editingItem._id}`,
                editingItem,
                { withCredentials: true }
            );
            toast.success('Item updated successfully!');
            setShowEditModal(false);
            fetchCategoryItems();
        } catch (error) {
            console.error('Error updating item:', error);
            toast.error('Failed to update item');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePlusClick = () => {
        setShowDropdown(!showDropdown);
    };

    const handleCreateSubCategory = () => {
        setShowDropdown(false);
        setShowSubCategoryModal(true);
    };

    const handleSubmitSubCategory = async (e) => {
        e.preventDefault();
        try {
            await axios.patch(
                `https://resource-link-main-14c755858b60.herokuapp.com/api/categories/${category._id}/subcategories`,
                { name: newSubCategory },
                { withCredentials: true }
            );
            
            toast.success('Subcategory created successfully!');
            setShowSubCategoryModal(false);
            setNewSubCategory('');
            fetchCategoryItems();
        } catch (error) {
            console.error('Error creating subcategory:', error);
            toast.error('Failed to create subcategory');
        }
    };

    const handleAddItem = () => {
        setShowDropdown(false);
        setShowItemTypeModal(true);
    };

    const handleItemTypeSelect = (type) => {
        setNewItem({ ...newItem, type });
        setShowItemTypeModal(false);
        if (type === 'Consumable') {
            setShowAddConsumableModal(true);
        } else {
            setShowAddItemModal(true);
        }
    };

    const handleNameChange = (e) => {
        setNewItem({
            ...newItem,
            name: e.target.value
        });
    };

    const handleIdChange = (e) => {
        setNewItem({
            ...newItem,
            id: e.target.value
        });
    };

    const handleSubmitItem = async (e) => {
        e.preventDefault();
        try {
            let imageBase64 = '';
            if (newItem.image) {
                if (typeof newItem.image === 'string') {
                    imageBase64 = newItem.image;
                } else {
                    const reader = new FileReader();
                    imageBase64 = await new Promise((resolve) => {
                        reader.onload = (e) => resolve(e.target.result);
                        reader.readAsDataURL(newItem.image);
                    });
                }
            }

            const itemData = {
                name: newItem.name,
                purchaseDate: newItem.purchaseDate,
                purchaseCost: newItem.purchaseCost,
                notes: newItem.notes,
                category: categoryName,
                subCategory: newItem.subCategory,
                itemImage: imageBase64,
                status: 'Good Condition',
                itemType: newItem.type,
                id: newItem.id,
                qty: newItem.type === 'Non-Consumable' ? 1 : newItem.qty,
                serialNo: newItem.type === 'Non-Consumable' ? newItem.serialNo : undefined
            };

            await axios.post('https://resource-link-main-14c755858b60.herokuapp.com/api/inventory', itemData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            toast.success('Item added successfully!');
            setShowAddConsumableModal(false);
            setShowAddItemModal(false);
            setNewItem({
                type: '',
                name: '',
                serialNo: '',
                purchaseDate: '',
                purchaseCost: '',
                notes: '',
                image: null,
                subCategory: '',
                qty: 0,
                id: ''
            });
            fetchCategoryItems();
        } catch (error) {
            console.error('Error submitting item:', error);
            console.error('Error details:', error.response?.data);
            toast.error('Failed to add item');
        }
    };

    return (
        <div className="view-category-items">
            <Navbar hideWelcome={true}/>
            <header>
                <div className="back-header">
                    <img 
                        src="/back-arrow.svg" 
                        alt="Back" 
                        className="back-arrow" 
                        onClick={handleBack}
                    />
                    <h1>{categoryName}</h1>
                    <div className="header-actions">
                        {searchExpanded && (
                            <div className="expanded-search">
                                <input
                                    type="text"
                                    placeholder="Search items..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    autoFocus
                                />
                                <span className='filter-items-close' onClick={() => setSearchExpanded(false)}>X </span>
                            </div>
                        )}
                        <div className="icon-group">
                        {!searchExpanded && (
                                <img
                                    src="/table-imgs/search.svg"
                                    alt="Search"
                                    className="header-icon"
                                    onClick={() => setSearchExpanded(true)}
                                />
                            )}
                            <div className="dropdown-container">
                                <img 
                                    src="/table-imgs/plus.svg" 
                                    alt="Add" 
                                    className="header-icon"
                                    onClick={handlePlusClick}
                                />
                                {showDropdown && (
                                    <div className="dropdown-menu">
                                        <button onClick={handleCreateSubCategory}>
                                            Create new sub-category
                                        </button>
                                        <button onClick={handleAddItem}>
                                            Add new Item
                                        </button>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </header>

            <div className="items-grid">
                {getFilteredItems().map((item) => (
                    <div 
                        key={item._id} 
                        className="item-card"
                    >
                        <div className="item-content">
                            <div 
                                className="item-image"
                                onClick={() => handleItemClick(item)}
                                style={{ cursor: 'pointer' }}
                            >
                                <img 
                                    src={item.itemImage || "/dashboard-imgs/placeholder.svg"} 
                                    alt={item.name} 
                                />
                            </div>
                            <div className="item-info">
                                <h3>{item.name}</h3>
                                <p className="sub-category">{item.subCategory || 'Sub category here'}</p>
                                <p className="item-status">Status: {item.status}</p>
                                <p className="item-quantity">Quantity: {item.qty}</p>
                                <div className="item-actions">
                                    <button onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditItem(item);
                                    }}>Edit</button>
                                    <button style={{color: 'red'}} onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteItem(item);
                                    }}>Delete</button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showEditModal && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Edit Item</h2>
                            <button 
                                className="close-button"
                                onClick={() => setShowEditModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleSubmitEdit}>
                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    value={editingItem.name}
                                    onChange={(e) => setEditingItem({
                                        ...editingItem,
                                        name: e.target.value
                                    })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select
                                    value={editingItem.status}
                                    onChange={(e) => setEditingItem({
                                        ...editingItem,
                                        status: e.target.value
                                    })}
                                >
                                    <option value="Good Condition">Good Condition</option>
                                    <option value="Damaged">Damaged</option>
                                    <option value="Lost">Lost</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Quantity</label>
                                <input
                                    type="number"
                                    value={editingItem.qty}
                                    onChange={(e) => setEditingItem({
                                        ...editingItem,
                                        qty: parseInt(e.target.value)
                                    })}
                                    min="0"
                                    required
                                />
                            </div>
                            <button 
                                type="submit" 
                                className="done-button"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Updating...' : 'Update'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {selectedItem && (
                <ItemInformation 
                    item={selectedItem} 
                    onClose={() => setSelectedItem(null)}
                />
            )}

            {showSubCategoryModal && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Create new sub-category</h2>
                            <button 
                                className="close-button"
                                onClick={() => setShowSubCategoryModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleSubmitSubCategory}>
                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    value={newSubCategory}
                                    onChange={(e) => setNewSubCategory(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="done-button">
                                Create
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showItemTypeModal && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Add new Item</h2>
                            <button 
                                className="close-button"
                                onClick={() => setShowItemTypeModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="form-group">
                            <label>Type</label>
                            <select
                                onChange={(e) => handleItemTypeSelect(e.target.value)}
                                defaultValue=""
                            >
                                <option value="" disabled>Select type</option>
                                <option value="Consumable">Consumable</option>
                                <option value="Non-Consumable">Non-Consumable</option>
                            </select>
                        </div>
                        <button 
                            className="form-cancel-btn"
                            onClick={() => setShowItemTypeModal(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {showAddItemModal && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Add new Item</h2>
                            <button 
                                className="close-button"
                                onClick={() => setShowAddItemModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleSubmitItem}>
                            <div className="form-group">
                                <label>Add Image</label>
                                <div className="image-upload-box">
                                    {newItem.image ? (
                                        <img 
                                            src={URL.createObjectURL(newItem.image)} 
                                            alt="Preview" 
                                            className="image-preview"
                                        />
                                    ) : (
                                        <div className="upload-placeholder">
                                            <span>+</span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setNewItem({
                                            ...newItem,
                                            image: e.target.files[0]
                                        })}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <input type="text" value="Consumable" readOnly hidden />
                            </div>
                            <div className="form-group">
                                <label>Sub-category <span className="required">*</span></label>
                                <select
                                    value={newItem.subCategory}
                                    onChange={(e) => setNewItem({
                                        ...newItem,
                                        subCategory: e.target.value
                                    })}
                                    required
                                >
                                    {category?.subCategories?.length > 0 ? (
                                        category.subCategories.map((sub, index) => (
                                            <option key={index} value={sub.name}>{sub.name}</option>
                                        ))
                                    ) : (
                                        <option value="">No subcategories available</option>
                                    )}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Name <span className="required">*</span></label>
                                <input
                                    type="text"
                                    value={newItem.name}
                                    onChange={handleNameChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Serial No <span className="required">*</span></label>
                                <input
                                    type="text"
                                    value={newItem.serialNo}
                                    onChange={(e) => setNewItem({
                                        ...newItem,
                                        serialNo: e.target.value
                                    })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Purchase Date <span className="required">*</span></label>
                                <input
                                    type="date"
                                    value={newItem.purchaseDate}
                                    onChange={(e) => setNewItem({
                                        ...newItem,
                                        purchaseDate: e.target.value
                                    })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Purchase Cost <span className="required">*</span></label>
                                <input
                                    type="number"
                                    value={newItem.purchaseCost}
                                    min={1}
                                    onChange={(e) => setNewItem({
                                        ...newItem,
                                        purchaseCost: e.target.value
                                    })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Notes</label>
                                <textarea
                                    value={newItem.notes}
                                    onChange={(e) => setNewItem({
                                        ...newItem,
                                        notes: e.target.value
                                    })}
                                />
                            </div>
                            <button type="submit" className="done-button">
                                Done
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showAddConsumableModal && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Add new Consumable Item</h2>
                            <button 
                                className="close-button"
                                onClick={() => setShowAddConsumableModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleSubmitItem}>
                            <div className="form-group">
                                <label>Add Image</label>
                                <div 
                                    className="image-upload-box"
                                    onClick={() => document.querySelector('input[type="file"]').click()}
                                >
                                    {newItem.image ? (
                                        <img 
                                            src={typeof newItem.image === 'string' ? newItem.image : URL.createObjectURL(newItem.image)} 
                                            alt="Preview" 
                                            className="image-preview"
                                        />
                                    ) : (
                                        <div className="upload-placeholder">
                                            <span>+</span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setNewItem({
                                            ...newItem,
                                            image: e.target.files[0]
                                        })}
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Sub-category</label>
                                <select
                                    value={newItem.subCategory}
                                    onChange={(e) => setNewItem({
                                        ...newItem,
                                        subCategory: e.target.value
                                    })}
                                >
                                    <option value="">None</option>
                                    {category?.subCategories?.length > 0 && (
                                        category.subCategories.map((sub, index) => (
                                            <option key={index} value={sub.name}>
                                                {sub.name}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>ID</label>
                                <input
                                    type="text"
                                    value={newItem.id}
                                    onChange={handleIdChange}
                                    placeholder="Enter item ID to search"
                                />
                            </div>
                            <div className="form-group">
                                <label>Name <span className="required">*</span></label>
                                <input
                                    type="text"
                                    value={newItem.name}
                                    onChange={handleNameChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Purchase Date <span className="required">*</span></label>
                                <input
                                    type="date"
                                    value={newItem.purchaseDate}
                                    onChange={(e) => setNewItem({
                                        ...newItem,
                                        purchaseDate: e.target.value
                                    })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Purchase Cost <span className="required">*</span></label>
                                <input
                                    type="number"
                                    value={newItem.purchaseCost}
                                    onChange={(e) => setNewItem({
                                        ...newItem,
                                        purchaseCost: e.target.value
                                    })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Qty <span className="required">*</span></label>
                                <input
                                    type="number"
                                    min={1}
                                    value={newItem.qty}
                                    onChange={(e) => setNewItem({
                                        ...newItem,
                                        qty: e.target.value
                                    })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Notes</label>
                                <textarea
                                    value={newItem.notes}
                                    onChange={(e) => setNewItem({
                                        ...newItem,
                                        notes: e.target.value
                                    })}
                                    placeholder="Add any additional notes here..."
                                />
                            </div>
                            <div className="form-group">
                                <button type="submit" className="done-button">
                                    Done
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default StaffInventoryItems;
