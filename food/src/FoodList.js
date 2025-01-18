import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import './FoodList.css'; 
import './App.css'


function FoodList() {
  const [fridgeItems, setFridgeItems] = useState([]);
  const navigate=useNavigate();

  useEffect(() => {
    


 const token = localStorage.getItem('token'); 


 const headers = { 
   Authorization: `Bearer ${token}`,
   'Content-Type': 'application/json' 
 };

    fetch('http://localhost:5020/api/fridgelist', { headers })
      .then((res) => res.json())
      .then((data) => setFridgeItems(data))
      .catch((err) => console.error('Error fetching food items:', err));
  }, []);
  const handleHomeClick = () => {
    navigate('/dashboard');  
  };
  const handleClaim = (_id) => {
    const token = localStorage.getItem('token');
    const headers = { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  
    // Trimite cererea PATCH pentru a marca alimentul ca "claimed"
    fetch(`http://localhost:5020/api/fridgelist/${_id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ available: false }),  // Setăm "available" la false pentru a marca alimentul ca ne-disponibil
    })
      .then((res) => res.json())
      .then((updatedItem) => {
        // Verifică dacă `updatedItem` conține datele așteptate
        console.log('Updated item from server:', updatedItem); 
  
        // Actualizează starea locală a alimentelor pe baza răspunsului serverului
        setFridgeItems((prevItems) =>
          prevItems.map((item) =>
            item._id === _id ? { ...item, available: false  } : item
        
    
          )
        );
      }) 
      .catch((err) => console.error('Error claiming food item:', err));
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
        {fridgeItems.map((item) => (
          <li key={item._id}>
            <strong>{item.name}</strong> 
            <span>({item.category})</span>
            <small>Owner: {item.owner}</small>
            <small>Expiry: {new Date(item.expiryDate).toLocaleDateString()}</small>
            <button
              id="btnClaim"
              onClick={() => handleClaim(item._id)}
              disabled={!item.available} // Dezactivează butonul dacă alimentul a fost deja revendicat
            >
              {item.available ? 'Claim' : 'Claimed'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FoodList;
