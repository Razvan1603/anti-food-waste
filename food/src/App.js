import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [fridgeItems, setFridgeItems] = useState([]);
  const [groups, setGroups] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', expiryDate: '', category: 'Dairy' });
  const [newGroup, setNewGroup] = useState({ name: '', tag: '' });

  useEffect(() => {
    fetch('/api/fridge')
      .then((response) => response.json())
      .then((data) => setFridgeItems(data));

    fetch('/api/groups')
      .then((response) => response.json())
      .then((data) => setGroups(data));

    fetch('/api/alerts')
      .then((response) => response.json())
      .then((data) => setAlerts(data));
  }, []);

  const handleAddItem = () => {
    if (!newItem.name.trim()) {
      alert('Please enter a food name.');
      return;
    }
    if (!newItem.expiryDate) {
      alert('Please select an expiry date.');
      return;
    }
    if (new Date(newItem.expiryDate) <= new Date()) {
      alert('Expiry date must be in the future.');
      return;
    }
  
    fetch('/api/fridge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    })
      .then(() => {
        alert('Item added successfully!');
        setFridgeItems([...fridgeItems, newItem]);
        setNewItem({ name: '', expiryDate: '', category: 'Dairy' });
      });
  };

  const handleAddGroup = () => {
    fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newGroup),
    })
      .then(() => {
        alert('Group added successfully!');
        setGroups([...groups, newGroup]);
        setNewGroup({ name: '', tag: '' });
      });
  };

  const handleMarkAvailable = (itemId) => {
    fetch(`/api/fridge/mark-available/${itemId}`, { method: 'POST' }).then(() => {
      alert('Item marked as available!');
      setFridgeItems(
        fridgeItems.map((item) =>
          item.id === itemId ? { ...item, available: true } : item
        )
      );
    });
  };

  return (
    <div className="App">
      <header>
        <h1>Food Sharing App</h1>
      </header>

      <main>
        {/* Fridge Section */}
        <section className="fridge">
          <h2>Your Fridge</h2>
          <div className="add-item">
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
              <option value="Dairy">Dairy</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Meat">Meat</option>
            </select>
            <button onClick={handleAddItem}>Add Food</button>
          </div>
          <ul>
            {fridgeItems.map((item) => (
              <li key={item.id}>
                <strong>{item.name}</strong> - {item.expiryDate} - {item.category}
                {!item.available && (
                  <button onClick={() => handleMarkAvailable(item.id)}>Mark as Available</button>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* Groups Section */}
        <section className="groups">
          <h2>Your Groups</h2>
          <div className="add-group">
            <input
              type="text"
              placeholder="Group Name"
              value={newGroup.name}
              onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Tag (e.g., Vegetarian)"
              value={newGroup.tag}
              onChange={(e) => setNewGroup({ ...newGroup, tag: e.target.value })}
            />
            <button onClick={handleAddGroup}>Add Group</button>
          </div>
          <ul>
            {groups.map((group) => (
              <li key={group.id}>
                {group.name} - {group.tag}
              </li>
            ))}
          </ul>
        </section>

        {/* Alerts Section */}
        <section className="alerts">
          <h2>Alerts</h2>
          <ul>
            {alerts.map((alert) => (
              <li key={alert.id}>{alert.message}</li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

export default App;
