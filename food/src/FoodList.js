import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import './FoodList.css'; 
import './App.css'


function FoodList() {
  const [foodItems, setFoodItems] = useState([]);
  const navigate=useNavigate();

  useEffect(() => {
    


 const token = localStorage.getItem('token'); 


 const headers = { 
   Authorization: `Bearer ${token}`,
   'Content-Type': 'application/json' 
 };

    fetch('http://localhost:5020/api/fridgelist', { headers })
      .then((res) => res.json())
      .then((data) => setFoodItems(data))
      .catch((err) => console.error('Error fetching food items:', err));
  }, []);
  const handleHomeClick = () => {
    navigate('/dashboard');  
  };


  return (

    
    <div className="food-list">
        <div className="dashboard">
      <header>
        <h1>Food Sharing App</h1>
        <div className="user-info">
      

         <button onClick={handleHomeClick}>Home</button>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/';
            }}
          >
            Logout
          </button>
        </div>
      </header>
      </div>
      <h2>Food List</h2>
      <ul>
        {foodItems.map((item) => (
          <li key={item.id}>
            <strong>{item.name}</strong> 
            <span>({item.category})</span>
            <small>Owner: {item.owner}</small>
            <small>Expiry: {new Date(item.expiryDate).toLocaleDateString()}</small>
            <button id="btnClaim">Claim</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FoodList;
