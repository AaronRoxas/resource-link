import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NavBar from '../../components/NavBar';
import '../../styles/AdminChart.css';
const AdminChart = () => {
  const [stats, setStats] = useState({
    users: 0,
    categories: 0,
    consumables: 0,
    nonConsumables: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRes = await axios.get('http://localhost:5000/api/users');
        const categoriesRes = await axios.get('http://localhost:5000/api/categories');
        const itemsRes = await axios.get('http://localhost:5000/api/items');
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
    </div>
  );
};

export default AdminChart;