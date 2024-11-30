import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import BottomNav from '../../components/BottomNav';
import ItemInformation from '../../components/ItemInformation';

const AdminCategoryItems = () => {
    const [items, setItems] = useState([]);
    const [categoryName, setCategoryName] = useState('');
    const [category, setCategory] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showSubCategoryModal, setShowSubCategoryModal] = useState(false);
    const [newSubCategory, setNewSubCategory] = useState('');
    const [showAddItemModal, setShowAddItemModal] = useState(false);
    const [newItem, setNewItem] = useState({
        name: '',
        serialNo: '',
        purchaseDate: '',
        purchaseCost: '',
        notes: '',
        image: null,
        subCategory: ''
    });
    const [selectedItems, setSelectedItems] = useState([]);
    const [showItemInfo, setShowItemInfo] = useState(false);
    const { categoryName: urlCategoryName } = useParams();
    const navigate = useNavigate();

    const navItems = [
        { path: '/admin', icon: 'home', label: 'Home' },
        { path: '/admin/inventory', icon: 'chart', label: 'Chart' },
        { path: '/adminQr', icon: 'qr', label: 'QR' },
        { path: '/addUser', icon: 'profile', label: 'Add User' },
        { path: '/adminUsers', icon: 'active-cube', label: 'Inventory' }
    ];

    const fetchCategoryItems = async () => {
        try {
            const categoriesResponse = await axios.get('https://resource-link-main-14c755858b60.herokuapp.com/api/categories', {
                withCredentials: true
            });
            
            const foundCategory = categoriesResponse.data.find(
                cat => cat.name.toLowerCase().replace(/\s+/g, '-') === urlCategoryName
            );

            if (!foundCategory) {
                console.error('Category not found');
                return;
            }

            setCategory(foundCategory);
            setCategoryName(foundCategory.name);
            
            if (foundCategory.subCategories?.length > 0) {
                setNewItem(prev => ({
                    ...prev,
                    subCategory: foundCategory.subCategories[0].name
                }));
            }

            const itemsResponse = await axios.get('https://resource-link-main-14c755858b60.herokuapp.com/api/inventory', {
                withCredentials: true
            });

            const categoryItems = itemsResponse.data.filter(item => item.category === foundCategory.name);
            setItems(categoryItems);

        } catch (error) {
            console.error('Error fetching items:', error);
            toast.error('Error fetching items');
        }
    };

    useEffect(() => {
        fetchCategoryItems();
    }, [urlCategoryName]);

    useEffect(() => {
        if (category?.subCategories?.length > 0) {
            setNewItem(prev => ({
                ...prev,
                subCategory: category.subCategories[0].name
            }));
        }
    }, [category]);

    const handleBack = () => {
        navigate('/admin/inventory');
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
        setShowAddItemModal(true);
    };

    const handleSubmitItem = async (e) => {
        e.preventDefault();
        try {
            let imageBase64 = '';
            if (newItem.image) {
                const reader = new FileReader();
                imageBase64 = await new Promise((resolve) => {
                    reader.onload = (e) => resolve(e.target.result);
                    reader.readAsDataURL(newItem.image);
                });
            }

            const itemData = {
                name: newItem.name,
                serialNo: newItem.serialNo,
                purchaseDate: newItem.purchaseDate,
                purchaseCost: newItem.purchaseCost,
                notes: newItem.notes,
                category: categoryName,
                subCategory: newItem.subCategory,
                itemImage: imageBase64,
                status: 'Good Condition'
            };

            console.log('Submitting item with data:', itemData);

            const response = await axios.post('https://resource-link-main-14c755858b60.herokuapp.com/api/inventory', itemData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('Server response:', response.data);

            toast.success('Item added successfully!');
            setShowAddItemModal(false);
            setNewItem({
                name: '',
                serialNo: '',
                purchaseDate: '',
                purchaseCost: '',
                notes: '',
                image: null,
                subCategory: category?.subCategories?.[0]?.name || ''
            });
            fetchCategoryItems();
        } catch (error) {
            console.error('Error submitting item:', error);
            console.error('Error details:', error.response?.data);
            toast.error('Failed to add item');
        }
    };

    const handleItemClick = (item) => {
        const isAlreadySelected = selectedItems.some(selected => selected._id === item._id);
        if (isAlreadySelected) {
            setSelectedItems(selectedItems.filter(selected => selected._id !== item._id));
        } else {
            setSelectedItems([...selectedItems, item]);
        }
        setShowItemInfo(true);
    };

    const handleCloseItemInfo = (itemId) => {
        setSelectedItems(selectedItems.filter(item => item._id !== itemId));
        if (selectedItems.length === 1) {
            setShowItemInfo(false);
        }
    };

    return (
        <div className="view-category-items">
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
                                    <button onClick={handleAddItem}>Add new Item</button>
                                </div>
                            )}
                        </div>
                        <img 
                            src="/table-imgs/filter.svg" 
                            alt="Filter" 
                            className="header-icon"
                            onClick={() => {/* Add your filter handler */}}
                        />
                    </div>
                </div>
            </header>

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
                            <button type="submit" className="create-button">
                                Create
                            </button>
                        </form>
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
                                    onChange={(e) => setNewItem({
                                        ...newItem,
                                        name: e.target.value
                                    })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Serial No <span className="required">*</span>.</label>
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

            {showItemInfo && selectedItems.map(item => (
                <ItemInformation 
                    key={item._id}
                    selectedItem={item}
                    handleCloseItemInfo={() => handleCloseItemInfo(item._id)}
                    onBorrowingComplete={() => {
                        fetchCategoryItems();
                        handleCloseItemInfo(item._id);
                    }}
                />
            ))}

            <div className="items-table">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Item</th>
                            <th>Serial No.</th>
                            <th>Sub-category</th>
                            <th>Status</th>
                            <th>Check-in/Check-out</th>
                            <th>Staff In Charge</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => (
                            <tr key={item._id}>
                                <td>{item.id}</td>
                                <td 
                                    onClick={() => handleItemClick(item)}
                                    style={{ cursor: 'pointer' }}
                                    className="item-name-cell"
                                >
                                    {item.name}
                                </td>
                                <td>{item.serialNo}</td>
                                <td>{item.subCategory || 'N/A'}</td>
                                <td>
                                    <span className={`status-badge ${item.status ? item.status.toLowerCase() : ''}`}>
                                        {item.status || 'Good Condition'}
                                    </span>
                                </td>
                                <td>
                                    <span className={`availability-badge ${item.availability === 'Check-in' ? 'check-in' : 'check-out'}`}>
                                        {item.availability}
                                    </span>
                                </td>
                                <td>{item.staffInCharge}</td>
                                <td>{item.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <BottomNav navItems={navItems} />
        </div>
    );
};

export default AdminCategoryItems; 