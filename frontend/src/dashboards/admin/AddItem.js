import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import '../../styles/AddItem.css'; 
import BottomNav from '../../components/BottomNav'; 
import axios from 'axios';

const AddItem = () => {
  const [formData, setFormData] = useState({
    name: '',
    status: 'In Stock',
    serialNo: '',
    purchaseDate: '',
    purchaseCost: '',
    notes: '',
    stocks: '',
    category: ''
  });

  const [importMethod, setImportMethod] = useState('single'); // 'single' or 'bulk'
  const [bulkItems, setBulkItems] = useState([]);
  const [previewData, setPreviewData] = useState([]);

  const [generatedId, setGeneratedId] = useState('');

  const navItems = [
    { path: '/admin', icon: 'home', label: 'Home' },
    { path: '/adminChart', icon: 'chart', label: 'Chart' },
    { path: '/addItem', icon: 'qr', label: 'Add Item' },
    { path: '/addUser', icon: 'profile', label: 'Add User' },
    { path: '/adminCategories', icon: 'cube', label: 'Inventory' },
  ];

  const categoryCodes = {
    'Devices': 'DEV',
    'Books': 'BOOK',
    'Lab Equipments': 'LAB',
    'Misc': 'MISC'
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === 'category' && value) {
      fetchCategoryCount(value);
    }
  };

  const fetchCategoryCount = async (category) => {
    try {
      const response = await axios.get(`https://resource-link-main-14c755858b60.herokuapp.com/api/items/category-count/${category}`);
      const count = response.data.count;
      const categoryCode = categoryCodes[category] || category.substring(0, 4).toUpperCase();
      setGeneratedId(`${categoryCode}-${count + 1}`);
    } catch (error) {
      console.error('Error fetching category count:', error);
      setGeneratedId('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://resource-link-main-14c755858b60.herokuapp.com/api/items', { 
        ...formData, 
        id: generatedId 
      });
      console.log('Item added:', response.data);
      setFormData({
        name: '',
        status: 'In Stock',
        serialNo: '',
        purchaseDate: '',
        purchaseCost: '',
        notes: '',
        stocks: '',
        category: ''
      });
      setGeneratedId('');
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      // Preview the data
      setPreviewData(data);
      setBulkItems(data);
    };

    reader.readAsBinaryString(file);
  };

  const handleBulkSubmit = async () => {
    try {
      const response = await axios.post('https://resource-link-main-14c755858b60.herokuapp.com/api/items/bulk', bulkItems);
      console.log('Bulk import response:', response.data);
      setPreviewData([]);
      setBulkItems([]);
      alert(`${response.data.message}\nSuccessful: ${response.data.successfulItems.length}\nFailed: ${response.data.failedItems.length}`);
    } catch (error) {
      console.error('Error adding bulk items:', error);
      alert('Error adding items. Please check the format and try again.');
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        name: 'Example Item',
        serialNo: 'SN123',
        purchaseDate: '2024-01-01',
        purchaseCost: 1000,
        notes: 'Sample notes',
        category: 'Books',
        stocks: 10
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'item_template.xlsx');
  };

  return (
    <div className="add-item-container">
      <h1>Add new Item</h1>

      <div className="import-method-selector">
        <button 
          className={`method-button ${importMethod === 'single' ? 'active' : ''}`}
          onClick={() => setImportMethod('single')}
        >
          Single Item
        </button>
        <button 
          className={`method-button ${importMethod === 'bulk' ? 'active' : ''}`}
          onClick={() => setImportMethod('bulk')}
        >
          Bulk Import
        </button>
      </div>

      {importMethod === 'single' ? (
        <form onSubmit={handleSubmit}>
          <div className="fields-container">
            <div className="field">
              <label>ID</label>
              <input 
                type="text" 
                name="id" 
                value={generatedId || 'Select a category'} 
                readOnly 
              />
            </div>
            <div className="field">
              <label>Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="field">
              <label>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select a category</option>
                <option value="Devices">Devices</option>
                <option value="Books">Books</option>
                <option value="Lab Equipments">Lab Equipments</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>
            <div className="field">
              <label>Serial No.</label>
              <input type="text" name="serialNo" value={formData.serialNo} onChange={handleChange} required />
            </div>
            <div className="field">
              <label>Purchase Date</label>
              <input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleChange} required />
            </div>
            <div className="field">
              <label>Purchase Cost</label>
              <input type="number" name="purchaseCost" value={formData.purchaseCost} onChange={handleChange} min={1}required />
            </div>
            <div className="field">
              <label>Stocks</label>
              <input type="number" name="stocks" value={formData.stocks} onChange={handleChange} required />
            </div>
            <div className="field">
              <label>Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange}></textarea>
            </div>
            <div className="field">
              <button type="submit" className="submit-button">Add Item</button>
            </div>
          </div>
          
        </form>
      ) : (
        <div className="bulk-import-container">
          <div className="template-section">
            <button onClick={downloadTemplate} className="template-button">
              Download Template
            </button>
            <p className="template-info">
              Download and fill the template with your items data, then upload it below.
            </p>
          </div>

          <div className="upload-section">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="file-input"
            />
          </div>

          {previewData.length > 0 && (
            <div className="preview-section">
              <h3>Preview ({previewData.length} items)</h3>
              <div className="preview-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Serial No.</th>
                      <th>Stocks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(0, 5).map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td>{item.category}</td>
                        <td>{item.serialNo}</td>
                        <td>{item.stocks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {previewData.length > 5 && (
                  <p className="preview-more">
                    And {previewData.length - 5} more items...
                  </p>
                )}
              </div>
              <button 
                onClick={handleBulkSubmit}
                className="submit-button"
              >
                Import {previewData.length} Items
              </button>
            </div>
          )}
        </div>
      )}

      <BottomNav navItems={navItems} />
    </div>
  );
};

export default AddItem;