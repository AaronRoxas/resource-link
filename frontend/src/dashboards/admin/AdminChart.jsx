import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NavBar from '../../components/NavBar';
import '../../styles/AdminChart.css';
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
          // Normalize "Good condition" to "Good Condition"
          if (status.toLowerCase() === 'good condition') {
            status = 'Good Condition';
          }
          // Skip if status is "Reserved"
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

        // Get top items by quantity (adjust the number as needed)
        const topStocks = Object.entries(stockCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10) // Increase the number to show more items
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
          '#4CAF50', // green
          '#2196F3', // blue
          '#F44336', // red
          '#FF9800', // orange
          '#E91E63', // pink
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
      title: {
        display: true,
        text: 'Most Borrowed/Withdrew',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 20
        }
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

  // Add new chart data for conditions
  const conditionChartData = {
    labels: Object.keys(conditionStats),
    datasets: [
      {
        data: Object.values(conditionStats),
        backgroundColor: [
          '#4CAF50', // Good condition - green
          '#2196F3', // For maintenance - blue
          '#F44336', // Low stock - red
          '#9C27B0', // For repair - purple
        ],
        borderWidth: 0,
      },
    ],
  };

  const conditionChartOptions = {
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Asset Conditions',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 20
        }
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

  // Add new chart data for stocks
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
          '#E91E63', // pink - for any additional items
        ],
        borderWidth: 0,
      },
    ],
  };

  const stockChartOptions = {
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 20,
          usePointStyle: true,
        }
      },
      title: {
        display: true,
        text: 'Stocks Overview',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const value = context.raw;
            const percentage = ((value / total) * 100).toFixed(0);
            return `${context.label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '40%',
  };

  return (
    <div className="admin-chart">
      <NavBar hideWelcome={true} />
      <h1 className="dashboard-title">Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="icon bg-purple"><img src="/charts-imgs/users.svg" alt="Users" /></div>
          <div className="stat-number">{stats.users}</div>
          <div className="stat-label">Users</div>
        </div>

        <div className="stat-card">
          <div className="icon bg-orange"><img src="/charts-imgs/categories.svg" alt="Categories" /></div>
          <div className="stat-number">{stats.categories}</div>
          <div className="stat-label">Categories</div>
        </div>

        <div className="stat-card">
          <div className="icon bg-blue"><img src="/charts-imgs/non-consumables.svg" alt="Non-Consumables" /></div>
          <div className="stat-number">{stats.nonConsumables}</div>
          <div className="stat-label">Non-Consumables</div>
        </div>

        <div className="stat-card">
          <div className="icon bg-green"><img src="/charts-imgs/consumables.svg" alt="Consumables" /></div>
          <div className="stat-number">{stats.consumables}</div>
          <div className="stat-label">Consumables</div>
        </div>
      </div>

      <div className="charts-container">
        <div>
          <h2 className="admin-chart-section-title">Stocks Overview</h2>
          <div className="admin-chart-section-header">
            <div className="admin-chart-view-more">View more</div>
          </div>
          <div className="chart-wrapper">
            <Pie data={stockChartData} options={stockChartOptions} />
          </div>
        </div>

        <div>
          <h2 className="admin-chart-section-title">Most Borrowed/Withdrew</h2>
          <div className="admin-chart-section-header">
            <div className="admin-chart-view-more">View more</div>
          </div>
          <div className="chart-wrapper">
            <Pie data={chartData} options={chartOptions} />
          </div>
        </div>

        <div>
          <h2 className="admin-chart-section-title">Asset Conditions</h2>
          <div className="admin-chart-section-header">
            <div className="admin-chart-view-more">View more</div>
          </div>
          <div className="chart-wrapper">
            <Pie data={conditionChartData} options={conditionChartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChart;