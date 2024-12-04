// src/App.js
import React, { useState, useEffect } from 'react';

const App = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', expiryDate: '', category: '' });

  const loadItems = async () => {
    try {
      const response = await fetch('/api/items');
      if (!response.ok) throw new Error('Failed to fetch items');
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };


  const addItem = async (event) => {
    event.preventDefault();

    const response = await fetch('/api/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newItem),
    });

    if (response.ok) {
      setNewItem({ name: '', expiryDate: '', category: '' });  
      loadItems(); 
    } else {
      alert('Failed to add item');
    }
  };

 
  useEffect(() => {
    loadItems();
  }, []);

  return (
    <div>
      <h1>Anti Food Waste App</h1>
      <h2>Add Food Item</h2>
      <form onSubmit={addItem}>
        <input
          type="text"
          placeholder="Food Name"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
        />
        <input
          type="date"
          value={newItem.expiryDate}
          onChange={(e) => setNewItem({ ...newItem, expiryDate: e.target.value })}
        />
        <select
          value={newItem.category}
          onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
        >
          <option value="fruits">Fruits</option>
          <option value="vegetables">Vegetables</option>
          <option value="dairy">Dairy</option>
          <option value="meat">Meat</option>
          <option value="other">Other</option>
        </select>
        <button type="submit">Add Item</button>
      </form>
      
      <h2>Food Items</h2>
      <ul>
        {items.map(item => (
          <li key={item.id}>
            <strong>{item.name}</strong> - <em>{item.category}</em> (expires: {item.expiryDate})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
