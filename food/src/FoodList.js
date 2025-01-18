import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

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
           {item.owner} - {item.name} - {new Date(item.expiryDate).toLocaleDateString()} - {item.category}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FoodList;
