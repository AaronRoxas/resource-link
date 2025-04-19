import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../../components/NavBar';
import '../../styles/new/admin.css';

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
    const [searchTerm, setSearchTerm] = useState('');
    const [searchExpanded, setSearchExpanded] = useState(false);
    const [showEditSubCategoryModal, setShowEditSubCategoryModal] = useState(false);
    const [editingSubCategory, setEditingSubCategory] = useState(null);
    const fileInputRef = useRef(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);


    const getFilteredItems = () => {
        return items.filter(item => {
            const matchSubCategory = !filters.subCategory || item.subCategory === filters.subCategory;
            const matchStatus = !filters.status || item.status === filters.status;
            const matchSearch =
                !searchTerm ||
                (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (item.id && item.id.toLowerCase().includes(searchTerm.toLowerCase()));
            return matchSubCategory && matchStatus && matchSearch;
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
        setIsLoading(true);
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
        } finally {
            setIsLoading(false);
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
            
            // Remove deleted item from UI without reload
            setItems((prevItems) => prevItems.filter(i => i._id !== item._id));
            
        } catch (error) {
            console.error('Error deleting item:', error);
            toast.error('Failed to delete item');
        } finally {
            setDeletingItemId(null);
        }
    };

    const handleEditSubCategory = (subCategory) => {
        setEditingSubCategory(subCategory);
        setShowEditSubCategoryModal(true);
    };

    const handleDeleteSubCategory = async (subCategoryName) => {
        try {
            await axios.delete(
                `https://resource-link-main-14c755858b60.herokuapp.com/api/categories/${category._id}/subcategories/${subCategoryName}`,
                { withCredentials: true }
            );
            toast.success('Subcategory deleted successfully!');
            fetchCategoryItems();
        } catch (error) {
            console.error('Error deleting subcategory:', error);
            toast.error('Failed to delete subcategory');
        }
    };

    const handleSubmitEditSubCategory = async (e) => {
        e.preventDefault();
        try {
            await axios.put(
                `https://resource-link-main-14c755858b60.herokuapp.com/api/categories/${category._id}/subcategories/${editingSubCategory.name}`,
                { newName: editingSubCategory.newName },
                { withCredentials: true }
            );
            toast.success('Subcategory updated successfully!');
            setShowEditSubCategoryModal(false);
            setEditingSubCategory(null);
            fetchCategoryItems();
        } catch (error) {
            console.error('Error updating subcategory:', error);
            toast.error('Failed to update subcategory');
        }
    };

    return (
        <div className="view-category-items">
            <Navbar hideWelcome={true}/>
            <div style={{ position: 'relative', minHeight: 'calc(100vh - 60px)' }}>
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
                            {searchExpanded ? (
                                <div className="expanded-search">
                                    <input
                                        type="text"
                                        placeholder="Search items..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        autoFocus
                                    />
                                    <span className='filter-items-close' onClick={() => {
                                        setSearchExpanded(false);
                                        setSearchTerm("");
                                    }}>X 
                                    </span>
                                </div>
                            ) : (
                                <>
                                    <div className="dropdown-container">
                                        <img 
                                            src="/table-imgs/edit.svg" 
                                            alt="Edit Subcategories" 
                                            className="header-icon"
                                            onClick={() => setShowEditSubCategoryModal(true)}
                                        />
                                        {showEditSubCategoryModal && (
                                            <div className="dropdown-menu">
                                                {category?.subCategories?.map((sub, index) => (
                                                    <button 
                                                        key={index} 
                                                        onClick={() => handleEditSubCategory(sub)}
                                                    >
                                                        {sub.name}
                                                    </button>
                                                ))}
                                    </div>
                                        )}
                                    </div>
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

                                    <img 
                                        src="/table-imgs/filter.svg" 
                                        alt="Filter" 
                                        className="header-icon"
                                        onClick={handleFilterClick}
                                    />
                                    <img 
                                        src="/table-imgs/search.svg" 
                                        alt="Search" 
                                        className="header-icon"
                                        onClick={() => setSearchExpanded(true)}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {showFilterModal && (
                    <div className="filter-modal">
                        <h2>Filter Items</h2>
                        <button 
                            className="close-btn"
                            onClick={() => setShowFilterModal(false)}
                        >
                            ×
                        </button>
                        <div className="form-group">
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
                        <div className="form-group">
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
                        <div className="actions">
                            <button 
                                className="clear-btn"
                                onClick={clearFilters}
                            >
                                Clear Filters
                            </button>
                            <button 
                                className="apply-btn"
                                onClick={() => setShowFilterModal(false)}
                            >
                                Apply
                            </button>
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
                                    <div className="image-upload-box" onClick={() => fileInputRef.current?.click()}>
                                        {newItem.image ? (
                                            <img 
                                                src={typeof newItem.image === 'string' ? newItem.image : URL.createObjectURL(newItem.image)} 
                                                alt="Preview" 
                                                className="image-preview"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setNewItem({ ...newItem, image: null });
                                                }}
                                            />
                                        ) : (
                                            <div className="upload-placeholder">
                                                <span>+</span>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={fileInputRef}
                                        onChange={(e) => setNewItem({
                                            ...newItem,
                                            image: e.target.files[0]
                                        })}
                                        style={{ display: 'none' }}
                                    />
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
                                        <option value="" selected disabled>Select Sub-categories</option>
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
                                        max={1000000000}        
                                        onChange={(e) => {
                                        const value = e.target.value;
                                        if (!isNaN(value) && !value.includes("e") && value.length <= 10) {
                                            const numericValue = Number(value);
                                            if (numericValue >= 1 && numericValue <= 1000000000) {
                                            setNewItem({ ...newItem, purchaseCost: numericValue });
                                            }
                                        }
                                        }}
                                        onKeyDown={(e) => {
                                        // Block typing of e, E, -, +, and enforce max length via key input
                                        if (["e", "E", "-", "+"].includes(e.key)) {
                                            e.preventDefault();
                                        }

                                        // Optional: prevent typing more than 10 digits 
                                        if (e.target.value.length >= 10 && !["Backspace", "Delete", "ArrowLeft", "ArrowRight"].includes(e.key)) {
                                            e.preventDefault();
                                        }
                                        }}
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
                                <button type="submit" className="done-button" disabled={isLoading}>
                                    {isLoading ? 'Submitting...' : 'Done'}
                                </button>
                                <button 
                                type="button" 
                                className='cancel-button' 
                                onClick={() => {setShowAddItemModal(false);setShowItemTypeModal(true);}}>
                                Back</button>
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
                                    <div className="image-upload-box" onClick={() => fileInputRef.current?.click()}>
                                        {newItem.image ? (
                                            <img 
                                                src={typeof newItem.image === 'string' ? newItem.image : URL.createObjectURL(newItem.image)} 
                                                alt="Preview" 
                                                className="image-preview"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setNewItem({ ...newItem, image: null });
                                                }}
                                            />
                                        ) : (
                                            <div className="upload-placeholder">
                                                <span>+</span>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={fileInputRef}
                                        onChange={(e) => setNewItem({
                                            ...newItem,
                                            image: e.target.files[0]
                                        })}
                                        style={{ display: 'none' }}
                                    />
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
                                        min={1}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (!isNaN(value) && !value.includes("e")) { // Prevents non-numeric input
                                            setNewItem({ ...newItem, purchaseCost: value });
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "e" || e.key === "-" || e.key === "+") {
                                            e.preventDefault(); // Blocks typing 'e', '-', and '+'
                                            }
                                        }}
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
                                <button type="submit" className="done-button" disabled={isLoading}>
                                    {isLoading ? 'Submitting...' : 'Done'}
                                </button>
                                <button 
                                type="button" 
                                className='cancel-button' 
                                onClick={() => {setShowAddConsumableModal(false);setShowItemTypeModal(true);}}>
                                Back</button>
                            </form>
                        </div>
                    </div>
                )}
                {showEditSubCategoryModal && editingSubCategory && (
                    <div className="modal-backdrop">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>Edit Subcategory</h2>
                                <button 
                                    className="close-button"
                                    onClick={() => {
                                        setShowEditSubCategoryModal(false);
                                        setEditingSubCategory(null);
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                            <form onSubmit={handleSubmitEditSubCategory}>
                                <div className="form-group">
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        value={editingSubCategory.newName || editingSubCategory.name}
                                        onChange={(e) => setEditingSubCategory({
                                            ...editingSubCategory,
                                            newName: e.target.value
                                        })}
                                        required
                                    />
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="update-button">
                                        Update
                                    </button>
                                    <button 
                                        type="button" 
                                        className="delete-button"
                                        onClick={() => {
                                            if (window.confirm('Are you sure you want to delete this subcategory?')) {
                                                handleDeleteSubCategory(editingSubCategory.name);
                                                setShowEditSubCategoryModal(false);
                                                setEditingSubCategory(null);
                                            }
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}


                {showDeleteModal && (
                    <div className="category-modal-backdrop">
                        <div className="category-form-container">
                            <div className="category-form-header">
                                <h2>Delete Item</h2>
                                
                                <button 
                                    className="category-close-button"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setSelectedItems(null);
                                    }}
                                >
                                    &times;
                                </button>
                            </div>
                            <div className="delete-confirmation">
                            <hr />
                                <p>Are you sure you want to delete "{selectedItems?.name}"?</p>
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
                                        setSelectedItems(null);
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
                                    onClick={() => {
                                        handleDeleteItem(selectedItems);
                                        setShowDeleteModal(false);
                                    }}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
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
                                    <td data-label="ID">{item.id}</td>
                                    <td 
                                        data-label="Item"
                                        onClick={() => handleItemClick(item)}
                                        style={{ cursor: 'pointer' }}
                                        className="item-name-cell"
                                    >
                                        {item.name}
                                    </td>
                                    <td data-label="Serial No.">{item.serialNo}</td>
                                    <td data-label="Sub-category">{item.subCategory || 'N/A'}</td>
                                    <td data-label="Status">
                                        <span className={`status-badge ${item.status ? item.status.toLowerCase().replace(' ', '-') : ''}`}>
                                            {item.status || 'Good Condition'}
                                        </span>
                                    </td>
                                    <td data-label="Check-in/Check-out">
                                        <span className={`availability-badge ${item.availability === 'Check-in' ? 'check-in' : 'check-out'}`}>
                                            {item.availability}
                                        </span>
                                    </td>
                                    <td data-label="Assigned To">{borrowings[item._id]?.borrower || '-'}</td>
                                    <td data-label="Approved By">{borrowings[item._id]?.receiptData?.approvedBy || '-'}</td>
                                    <td data-label="Date">
                                        {borrowings[item._id]?.borrowDate 
                                            ? new Date(borrowings[item._id].borrowDate).toLocaleDateString() 
                                            : '-'}
                                    </td>
                                    <td data-label="Stock">{item.qty}</td>
                                    <td data-label="Action" className="actions-cell">
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
                                                onClick={() => {
                                                    setSelectedItems(item);
                                                    setShowDeleteModal(true);
                                                }}
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
        </div>
    );
};

export default AdminCategoryItems; 