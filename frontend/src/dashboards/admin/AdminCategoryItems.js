import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import BottomNav from '../../components/BottomNav';
import ItemInformation from '../../components/ItemInformation';
import Navbar from '../../components/NavBar';
import '../../styles/AdminCategoryItems.css';

const AdminCategoryItems = () => {
    const [items, setItems] = useState([]);
    const [categoryName, setCategoryName] = useState('');
    const [category, setCategory] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showSubCategoryModal, setShowSubCategoryModal] = useState(false);
    const [newSubCategory, setNewSubCategory] = useState('');
    const [showAddItemModal, setShowAddItemModal] = useState(false);
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
    const [selectedItems, setSelectedItems] = useState([]);
    const [showItemInfo, setShowItemInfo] = useState(false);
    const { categoryName: urlCategoryName } = useParams();
    const navigate = useNavigate();
    const [showItemTypeModal, setShowItemTypeModal] = useState(false);
    const [showAddConsumableModal, setShowAddConsumableModal] = useState(false);
    const [borrowings, setBorrowings] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [deletingItemId, setDeletingItemId] = useState(null);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filters, setFilters] = useState({
        subCategory: '',
        status: ''
    });

    const getFilteredItems = () => {
        return items.filter(item => {
            const matchSubCategory = !filters.subCategory || item.subCategory === filters.subCategory;
            const matchStatus = !filters.status || item.status === filters.status;
            return matchSubCategory && matchStatus;
        });
    };

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            subCategory: '',
            status: ''
        });
        setShowFilterModal(false);
    };

    const handleFilterClick = () => {
        setShowFilterModal(true);
    };

    
    const navItems = [
        { path: '/admin', icon: 'home', label: 'Home' },
        { path: '/admin/inventory', icon: 'chart', label: 'Chart' },
        { path: '/admin/manage-user', icon: 'profile', label: 'Manage User' },
        { path: '/admin/inventory', icon: 'cube', label: 'Inventory' },
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

            // Fetch borrowings for all items
            const borrowingsResponse = await axios.get('https://resource-link-main-14c755858b60.herokuapp.com/api/borrowings', {
                withCredentials: true
            });

            // Create a map of itemId to borrower info
            const borrowingsMap = borrowingsResponse.data.reduce((acc, borrowing) => {
                // Only include active borrowings
                if (borrowing.receiptData?.status === 'On-going') {
                    // Use the _id from the populated itemId object
                    const itemId = borrowing.itemId._id;
                    acc[itemId] = borrowing;
                }
                return acc;
            }, {});

            console.log('Final borrowings map:', borrowingsMap);
            setBorrowings(borrowingsMap);

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
        setShowItemTypeModal(true);
    };

    const handleItemTypeSelect = (type) => {
        setNewItem(prev => ({ ...prev, type }));
        setShowItemTypeModal(false);
        if (type === 'Non-Consumable') {
            setShowAddItemModal(true);
        } else if (type === 'Consumable') {
            setShowAddConsumableModal(true);
        }
    };

    const handleIdChange = async (e) => {
        const enteredId = e.target.value.toUpperCase();
        setNewItem(prev => ({
            ...prev,
            id: enteredId
        }));

        if (enteredId) {
            const existingItem = items.find(item => item.id === enteredId);
            if (existingItem) {
                setNewItem({
                    type: 'Consumable',
                    name: existingItem.name,
                    purchaseDate: existingItem.purchaseDate.split('T')[0],
                    purchaseCost: existingItem.purchaseCost,
                    notes: existingItem.notes || '',
                    image: existingItem.itemImage || null,
                    subCategory: existingItem.subCategory,
                    qty: existingItem.qty || 0,
                    id: existingItem.id
                });
            }
        }
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

            // Calculate the status based on quantity
            const quantity = newItem.type === 'Non-Consumable' ? 1 : newItem.qty;
            const status = quantity < 10 ? 'Low Stock' : 'Good Condition';

            const itemData = {
                name: newItem.name,
                purchaseDate: newItem.purchaseDate,
                purchaseCost: newItem.purchaseCost,
                notes: newItem.notes,
                category: categoryName,
                subCategory: newItem.subCategory,
                itemImage: imageBase64,
                status: status,
                itemType: newItem.type,
                id: newItem.id,
                qty: quantity,
                serialNo: newItem.type === 'Non-Consumable' ? newItem.serialNo : undefined
            };

            const existingItem = items.find(item => item.id === newItem.id);
            
            if (existingItem) {
                await axios.put(`https://resource-link-main-14c755858b60.herokuapp.com/api/inventory/${existingItem._id}`, itemData, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                toast.success('Item updated successfully!');
            } else {
                await axios.post('https://resource-link-main-14c755858b60.herokuapp.com/api/inventory', itemData, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                toast.success('Item added successfully!');
            }

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
                subCategory: category?.subCategories?.[0]?.name || '',
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

    const handleItemClick = (item) => {
        navigate(`/admin/category/${item.category.toLowerCase()}/${item.id}`);
    };

    const handleCloseItemInfo = (itemId) => {
        setSelectedItems(selectedItems.filter(item => item._id !== itemId));
        if (selectedItems.length === 1) {
            setShowItemInfo(false);
        }
    };

    const generateAbbreviatedId = (itemName) => {
        if (!itemName) return '';

        // Take first 2-3 letters of category name as prefix
        const categoryPrefix = categoryName
            .slice(0, 3)  // Take first 3 letters
            .replace(/[aeiou]/gi, '')  // Remove vowels
            .slice(0, 2)  // Take first 2 consonants
            .toUpperCase();
        
        // Find all existing IDs that start with this prefix
        const similarIds = items
            .filter(item => item.id.startsWith(categoryPrefix))
            .map(item => {
                const num = parseInt(item.id.split('-')[1]);
                return isNaN(num) ? 0 : num;
            });

        const nextNum = similarIds.length > 0 ? Math.max(...similarIds) + 1 : 1;
        const formattedNum = String(nextNum).padStart(4, '0');
        
        return `${categoryPrefix}-${formattedNum}`;
    };

    const handleNameChange = (e) => {
        const newName = e.target.value;
        setNewItem(prev => ({
            ...prev,
            name: newName,
            id: generateAbbreviatedId(newName)
        }));
    };

    const handleEditItem = (item) => {
        setNewItem(item);
        setShowAddItemModal(true);
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
                            onClick={handleFilterClick}
                        />
                    </div>
                </div>
            </header>

                      {/* Add the filter modal before the items table */}
                      {showFilterModal && (
    <div className="filter-items-modal-backdrop">
        <div className="filter-items-content">
            <div className="filter-items-header">
                <h2>Filter Items</h2>
                <button 
                    className="filter-items-close"
                    onClick={() => setShowFilterModal(false)}
                >
                    ×
                </button>
            </div>
            <div className="filter-items-options">
                <div className="filter-items-group">
                    <label>Sub-category</label>
                    <select
                        value={filters.subCategory}
                        onChange={(e) => handleFilterChange('subCategory', e.target.value)}
                    >
                        <option value="">All</option>
                        {category?.subCategories?.map((sub, index) => (
                            <option key={index} value={sub.name}>
                                {sub.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="filter-items-group">
                    <label>Status</label>
                    <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                        <option value="">All</option>
                        <option value="Good Condition">Good Condition</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="For Repair">For Repair</option>
                        <option value="Under Maintenance">Under Maintenance</option>
                    </select>
                </div>
            </div>
            <div className="filter-items-actions">
                <button 
                    className="filter-items-clear"
                    onClick={clearFilters}
                >
                    Clear Filters
                </button>
                <button 
                    className="filter-items-apply"
                    onClick={() => setShowFilterModal(false)}
                >
                    Apply
                </button>
            </div>
        </div>
    </div>
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
                            <button type="submit" className="create-button">
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
                                <div className="image-upload-box">
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
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <input type="text" value="Consumable" readOnly hidden />
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
                                />
                            </div>
                            <button type="submit" className="done-button">
                                Done
                            </button>
                        </form>
                    </div>
                </div>
            )}
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
                            <th>Assigned To</th>
                            <th>Approved By</th>
                            <th>Date</th>
                            <th>Stock</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {getFilteredItems().map((item) => (
                            <tr key={item._id}>
                                {/* Keep the existing row content */}
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
                                    <span className={`status-badge ${item.status ? item.status.toLowerCase().replace(' ', '-') : ''}`}>
                                        {item.status || 'Good Condition'}
                                    </span>
                                </td>
                                <td>
                                    <span className={`availability-badge ${item.availability === 'Check-in' ? 'check-in' : 'check-out'}`}>
                                        {item.availability}
                                    </span>
                                </td>
                                <td>{borrowings[item._id]?.borrower || '-'}</td>
                                <td>{borrowings[item._id]?.receiptData?.approvedBy || '-'}</td>
                                <td>{borrowings[item._id]?.borrowDate ? new Date(borrowings[item._id].borrowDate).toLocaleDateString() : '-'}</td>
                                <td>{item.qty}</td>
                                <td className="actions-cell">
                                    <div className="action-buttons-container">
                                        {item.itemType !== 'Consumable' && (
                                            <img 
                                                src="/table-imgs/edit.svg" 
                                                alt="Edit" 
                                                className="action-icon"
                                                onClick={() => handleEditItem(item)}
                                                style={{ paddingRight: '8px' }}
                                            />
                                        )}
                                        <img 
                                            src={deletingItemId === item._id ? "/table-imgs/spinner.svg" : "/table-imgs/delete.svg"}
                                            alt="Delete" 
                                            className="action-icon"
                                            onClick={() => handleDeleteItem(item)}
                                            style={{ 
                                                paddingLeft: item.itemType !== 'Consumable' ? '8px' : '0',
                                                cursor: deletingItemId === item._id ? 'not-allowed' : 'pointer',
                                                opacity: deletingItemId === item._id ? 0.5 : 1
                                            }}
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
};

export default AdminCategoryItems; 