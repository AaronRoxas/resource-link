import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NavBar from '../../components/NavBar';
import '../../styles/new/admin.css';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const AdminChart = () => {
  const [stats, setStats] = useState({
    users: 0,
    categories: 0,
    consumables: 0,
    nonConsumables: 0,
  });
  const [itemStats, setItemStats] = useState({});
  const [conditionStats, setConditionStats] = useState({
    'Good Condition': 0,
    'For Maintenance': 0,
    'Low Stock': 0,
    'For repair': 0
  });
  const [stockStats, setStockStats] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRes = await axios.get('https://resource-link-main-14c755858b60.herokuapp.com/api/users');
        const categoriesRes = await axios.get('https://resource-link-main-14c755858b60.herokuapp.com/api/categories');
        const itemsRes = await axios.get('https://resource-link-main-14c755858b60.herokuapp.com/api/items');
        const activitiesRes = await axios.get('https://resource-link-main-14c755858b60.herokuapp.com/api/activities');
        
        // Filter activities to only include Withdraw and check-out actions
        const relevantActivities = activitiesRes.data.filter(
          activity => activity.action === 'Withdraw' || activity.action === 'check-out'
        );

        // Count occurrences of each item
        const itemCounts = relevantActivities.reduce((acc, activity) => {
          const itemName = activity.itemName;
          acc[itemName] = (acc[itemName] || 0) + 1;
          return acc;
        }, {});

        // Sort items by count and get top 5
        const sortedItems = Object.entries(itemCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .reduce((obj, [key, value]) => ({
            ...obj,
            [key]: value
          }), {});
        
        setItemStats(sortedItems);

        const items = itemsRes.data;

        const consumables = items.filter(item => item.itemType === 'Consumable').length;
        const nonConsumables = items.filter(item => item.itemType === 'Non-Consumable').length;

        // Calculate condition statistics with normalized status names
        const conditions = itemsRes.data.reduce((acc, item) => {
          let status = item.status || 'Good Condition';
          if (status.toLowerCase() === 'good condition') {
            status = 'Good Condition';
          }
          if (status.toLowerCase() !== 'reserved') {
            acc[status] = (acc[status] || 0) + 1;
          }
          return acc;
        }, {});
        
        setConditionStats(conditions);

        // Calculate stock statistics from actual items
        const stockCounts = itemsRes.data.reduce((acc, item) => {
          const itemName = item.name;
          acc[itemName] = (acc[itemName] || 0) + (item.qty || 0);
          return acc;
        }, {});

        // Get top items by quantity
        const topStocks = Object.entries(stockCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
          .reduce((obj, [key, value]) => ({
            ...obj,
            [key]: value
          }), {});

        setStockStats(topStocks);

        setStats({
          users: usersRes.data.length,
          categories: categoriesRes.data.length,
          consumables,
          nonConsumables,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const chartData = {
    labels: Object.keys(itemStats),
    datasets: [
      {
        data: Object.values(itemStats),
        backgroundColor: [
          '#4CAF50',
          '#2196F3',
          '#F44336',
          '#FF9800',
          '#E91E63',
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const value = context.raw;
            const percentage = ((value / total) * 100).toFixed(0);
            return `${context.label}: ${percentage}%`;
          }
        }
      }
    },
    cutout: '40%',
  };

  const conditionChartData = {
    labels: Object.keys(conditionStats),
    datasets: [
      {
        data: Object.values(conditionStats),
        backgroundColor: [
          '#4CAF50',
          '#2196F3',
          '#F44336',
          '#9C27B0',
        ],
        borderWidth: 0,
      },
    ],
  };

  const stockChartData = {
    labels: Object.keys(stockStats),
    datasets: [
      {
        data: Object.values(stockStats),
        backgroundColor: [
          '#4CAF50', 
          '#2196F3',
          '#F44336',  
          '#FF9800', 
          '#E91E63',
          '#9C27B0',
          '#00BCD4',
          '#FF5722',
          '#795548',
          '#607D8B',
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="admin-chart">
      <NavBar hideWelcome={true} />
      <div className="admin-chart-container">
        <h1>Dashboard Overview</h1>
        
        <div className="stats-cards">
          <div className="stat-card" style={{ background: '#F3E5F5' }}>
            <div className="stat-icon" style={{ background: '#9C27B0' }}>👤</div>
            <div className="stat-content">
              <div className="stat-value">{stats.users}</div>
              <div className="stat-title">Users</div>
            </div>
          </div>
          
          <div className="stat-card" style={{ background: '#FFF3E0' }}>
            <div className="stat-icon" style={{ background: '#FF9800' }}>📁</div>
            <div className="stat-content">
              <div className="stat-value">{stats.categories}</div>
              <div className="stat-title">Categories</div>
            </div>
          </div>
          
          <div className="stat-card" style={{ background: '#E3F2FD' }}>
            <div className="stat-icon" style={{ background: '#2196F3' }}>🔧</div>
            <div className="stat-content">
              <div className="stat-value">{stats.nonConsumables}</div>
              <div className="stat-title">Non-Consumables</div>
            </div>
          </div>
          
          <div className="stat-card" style={{ background: '#E8F5E9' }}>
            <div className="stat-icon" style={{ background: '#4CAF50' }}>📦</div>
            <div className="stat-content">
              <div className="stat-value">{stats.consumables}</div>
              <div className="stat-title">Consumables</div>
            </div>
          </div>
        </div>

        <div className="charts-grid">
          <div className="chart-section">
            <div className="chart-header">
              <h2>Stocks Overview</h2>
              {/* <a href="#" className="view-more">View More</a> */}
            </div>
            <div className="chart-container">
              <Pie data={stockChartData} options={chartOptions} />
            </div>
          </div>

          <div className="chart-section">
            <div className="chart-header">
              <h2>Most Borrowed/Withdrew</h2>
              {/* <a href="#" className="view-more">View More</a> */}
            </div>
            <div className="chart-container">
              <Pie data={chartData} options={chartOptions} />
            </div>
          </div>

          <div className="chart-section">
            <div className="chart-header">
              <h2>Asset Conditions</h2>
              {/* <a href="#" className="view-more">View More</a> */}
            </div>
            <div className="chart-container">
              <Pie data={conditionChartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChart;