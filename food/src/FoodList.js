import React, { useState, useEffect } from 'react';
import './FoodList.css'; 

function FoodList() {
  const [foodItems, setFoodItems] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    fetch('http://localhost:5020/api/fridgelist', { headers })
      .then((res) => res.json())
      .then((data) => setFoodItems(data))
      .catch((err) => console.error('Error fetching food items:', err));
  }, []);

  return (
    <div className="food-list">
      <h2>Food List</h2>
      <ul>
        {foodItems.map((item) => (
          <li key={item.id}>
            <strong>{item.name}</strong> 
            <span>({item.category})</span>
            <small>Owner: {item.owner}</small>
            <small>Expiry: {new Date(item.expiryDate).toLocaleDateString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FoodList;
