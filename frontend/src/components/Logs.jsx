import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Logs.css';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(14);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const activitiesRes = await fetch('https://resource-link-main-14c755858b60.herokuapp.com/api/activities');
        const activities = await activitiesRes.json();

        // Format the activities and ensure newest first
        const formattedLogs = activities
          .map(activity => ({
            date: new Date(activity.timestamp),
            borrower: activity.borrower,
            itemName: activity.itemName,
            action: activity.action,
            _id: activity._id,
            type: 'activity'
          }))
          .sort((a, b) => b.date.getTime() - a.date.getTime());

        setLogs(formattedLogs);
      } catch (error) {
        console.error('Error fetching logs:', error);
      }
    };

    fetchLogs();
  }, []);

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

  const getActionStyle = (action) => {
    const styles = {
      'check-out': 'action-checkout',
      'check-in': 'action-checkin',
      'removed': 'action-removed',
      'added': 'action-added',
      'pending': 'action-pending',
      'updated': 'action-updated',
      'withdraw': 'action-checkout',
      'declined': 'action-declined'
    };
    return styles[action.toLowerCase()] || '';
  };

  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = logs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(logs.length / logsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="logs-page">
      <div className="header">
        <div className="back-button" onClick={handleBack}>
          <img src="/back-arrow.svg" alt="Back" />
          <span>Logs</span>
        </div>
      </div>

      <div className="logs-table-container">
        <table className="logs-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>User</th>
              <th>Item</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentLogs.map((log) => (
              <tr key={log._id}>
                <td>
                  {log.date.toLocaleDateString()} {log.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td>{log.borrower}</td>
                <td>{log.itemName}</td>
                <td>
                  <span className={`action-badge ${getActionStyle(log.action)}`}>
                    {log.action.toLowerCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <button 
            onClick={() => paginate(currentPage - 1)} 
            disabled={currentPage === 1}
            className="pagination-button"
          >
            Previous
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button 
            onClick={() => paginate(currentPage + 1)} 
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Logs;