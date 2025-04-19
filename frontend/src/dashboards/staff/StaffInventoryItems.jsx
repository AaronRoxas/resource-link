import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ItemInformation from '../../components/ItemInformation';
import '../../styles/ViewItems.css';
import Navbar from '../../components/NavBar';
import { toast } from 'react-toastify';
import { smartSearch, getHighlightedText } from '../../utils/smartSearch';

const StaffInventoryItems = () => {
    const [items, setItems] = useState([]);
    const [categoryName, setCategoryName] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
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
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditSubCategoryModal, setShowEditSubCategoryModal] = useState(false);
    const [editingSubCategory, setEditingSubCategory] = useState(null);
    const fileInputRef = useRef(null);

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
        if (!searchTerm || searchTerm.trim() === '') return items;
        return smartSearch(items, searchTerm);
    };

    const renderHighlightedText = (text, searchTerm) => {
        if (!searchTerm || searchTerm.trim() === '') return text;
        const { parts, hasMatch } = getHighlightedText(text, searchTerm);
        if (!hasMatch) return text;

        return parts.map((part, index) => (
            part.toLowerCase() === searchTerm.toLowerCase() ? (
                <span key={index} className="highlight">{part}</span>
            ) : part
        ));
    };

    const handleBack = () => {
        navigate('/staff/inventory');
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
    
            // Assign a default ID if none is provided
            const itemId = newItem.id || generateAbbreviatedId(newItem.name);
    
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
                id: itemId, // Use the generated or provided ID
                qty: quantity,
                serialNo: newItem.type === 'Non-Consumable' ? newItem.serialNo : undefined
            };
    
            const existingItem = items.find(item => item.id === itemId);
    
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
        

    
    const handleEditSubCategory = (subCategory) => {
        setEditingSubCategory(subCategory);
        setShowEditSubCategoryModal(true);
    };

    const handleDeleteSubCategory = async (subCategoryName) => {
        try {
            await axios.delete(
                `https://resource-link-main-14c755858b60.herokuapp.com/api/categories/${category._id}/subcategories/${subCategoryName}`
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
                { newName: editingSubCategory.newName }
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
                                <span className='filter-items-close' style={{cursor:"pointer"}} onClick={() => setSearchExpanded(false)}>X </span>
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
                                <div className="item-details">
                                    <h3>{renderHighlightedText(item.name, searchTerm)}</h3>
                                    <p>ID: {renderHighlightedText(item.id, searchTerm)}</p>
                                </div>
                                <p className="sub-category">{item.subCategory || 'Sub category here'}</p>
                                <p className="item-status">Status: {item.status}</p>
                                <p className="item-quantity">Quantity: {item.qty}</p>
                                <div className="item-actions">
                                    <button onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditItem(item);
                                    }}>Edit</button>
                                    <button style={{color: 'red'}}
                                            onClick={() => {
                                                setSelectedItems(item);
                                                setShowDeleteModal(true);
                                    }}
                                    >Delete</button>
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

                                        //prevent typing more than 10 digits 
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
                                <button type="submit" className="done-button" disabled={isLoading}>
                                    {isLoading ? 'Submitting...' : 'Done'}
                                </button>
                                <button 
                                type="button" 
                                className='cancel-button' 
                                onClick={() => {setShowAddConsumableModal(false);setShowItemTypeModal(true);}}>
                                Back</button>
                            </div>
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
        </div>
    );
};

export default StaffInventoryItems;
