import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ItemInformation from './ItemInformation';

const ItemPage = () => {
  const { itemId } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axios.get(`https://resource-link-main-14c755858b60.herokuapp.com/api/items/find/${itemId}`);
        setItem(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching item:', error);
        setError('Item not found');
        setLoading(false);
      }
    };

    fetchItem();
  }, [itemId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!item) return <div>Item not found</div>;

  return (
    <div className="item-page">
      <ItemInformation 
        selectedItem={item} 
        handleCloseItemInfo={() => window.close()} 
      />
    </div>
  );
};

export default ItemPage;