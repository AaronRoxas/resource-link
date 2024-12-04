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

      <div className="chart-container" style={{ 
        maxWidth: '500px', 
        margin: '2rem', 
        marginLeft: '2rem' 
      }}>
        <h2>Most Borrowed/Withdrew Items</h2>
        <Pie data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default AdminChart;