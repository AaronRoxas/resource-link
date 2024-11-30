import React, { useState, useEffect } from 'react';
import '../styles/InventoryAlert.css';
import { useNavigate, useLocation } from 'react-router-dom';

const InventoryAlert = () => {
  const [inventoryAlerts, setInventoryAlerts] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilter, setActiveFilter] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchInventoryAlerts = async () => {
      try {
        const response = await fetch('https://resource-link-main-14c755858b60.herokuapp.com/api/items');
        const data = await response.json();
        const alerts = data.filter(item => 
          item.status === 'For repair' || 
          item.status === 'Low Stock' || 
          item.status === 'For Maintenance'
        );
        setInventoryAlerts(alerts);
      } catch (error) {
        console.error('Error fetching inventory alerts:', error);
      }
    };

    fetchInventoryAlerts();
  }, []);

  const handleFilter = (status) => {
    setActiveFilter(status);
    setShowFilter(false);
  };

  const filteredAlerts = activeFilter
    ? inventoryAlerts.filter(item => item.status === activeFilter)
    : inventoryAlerts;

  const handleBack = () => {
    const path = location.pathname;
    if (path.includes('staff')) {
      navigate('/staff');
    } else if (path.includes('admin')) {
      navigate('/admin');
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="inventory-alerts-page">
      <div className="header">
        <div className="back-button" onClick={handleBack}>
          <img src="/back-arrow.svg" alt="Back" />
          <span>Inventory Alerts</span>
        </div>
        <img 
          src={activeFilter ? '/table-imgs/active-filter.svg' : '/table-imgs/filter.svg'} 
          alt="Filter" 
          className="filter-icon"
          onClick={() => setShowFilter(!showFilter)} 
        />
      </div>

      {showFilter && (
        <div className="filter-modal">
          <div className="filter-content">
            <h3>Sort by:</h3>
            <div className="filter-options">
              <span 
                className={`filter-badge for-repair ${activeFilter === 'For repair' ? 'active' : ''}`}
                onClick={() => handleFilter('For repair')}
              >
                For repair
              </span>
              <span 
                className={`filter-badge low-stock ${activeFilter === 'Low Stock' ? 'active' : ''}`}
                onClick={() => handleFilter('Low Stock')}
              >
                Low stock
              </span>
              <span 
                className={`filter-badge for-maintenance ${activeFilter === 'For Maintenance' ? 'active' : ''}`}
                onClick={() => handleFilter('For Maintenance')}
              >
                For maintenance
              </span>
              {activeFilter && (
                <span 
                  className="remove-filter"
                  onClick={() => {
                    setActiveFilter('');
                    setShowFilter(false);
                  }}
                >
                  Remove filter
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="alerts-table-container">
        <table className="alerts-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Item</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredAlerts.map((item) => (
              <tr key={item._id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>
                  <span className={`status-badge ${item.status.toLowerCase().replace(' ', '-')}`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryAlert;
