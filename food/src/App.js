import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

function LoginRegister({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);


function submitUsername(e){
  setUsername(e.target.value);
}
function submitPassword(e){
  setPassword(e.target.value);
}

  const handleSubmit = (e) => {
    e.preventDefault();
    const endpoint = isLogin ? '/api/login' : '/api/register';
    console.log(username);

    fetch(`http://localhost:5000${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Request failed');
        console.log(res);
        return res.json();
      })
      .then((data) => {
        if (isLogin && data.token) {
          localStorage.setItem('token', data.token);
          onLogin(username);
        } else if (!isLogin) {
          alert('Registration successful');
        }
      })
      .catch(() => alert('Error occurred'));
  };

  return (
    <div className="login-register">
      <h2>{isLogin ? 'Login' : 'Register'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={submitUsername}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={submitPassword}
          required
        />
        <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
      </form>
      <button onClick={() => setIsLogin(!isLogin)}>
        Switch to {isLogin ? 'Register' : 'Login'}
      </button>
    </div>
  );
}

function Dashboard({ username }) {
  const [fridgeItems, setFridgeItems] = useState([]);
  const [groups, setGroups] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', expiryDate: '', category: 'Dairy' });
  const [newGroup, setNewGroup] = useState({ name: '', tag: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    fetch('/api/fridge', { headers })
      .then((response) => response.json())
      .then((data) => setFridgeItems(data));

    fetch('/api/groups', { headers })
      .then((response) => response.json())
      .then((data) => setGroups(data));

    fetch('/api/alerts', { headers })
      .then((response) => response.json())
      .then((data) => setAlerts(data));
  }, []);

  const handleAddItem = () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    fetch('/api/fridge', {
      method: 'POST',
      headers,
      body: JSON.stringify(newItem),
    }).then((response) => {
      if (response.ok) {
        alert('Item added successfully!');
        setFridgeItems([...fridgeItems, newItem]);
        setNewItem({ name: '', expiryDate: '', category: 'Dairy' });
      } else {
        alert('Failed to add item');
      }
    });
  };

  const handleAddGroup = () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    fetch('/api/groups', {
      method: 'POST',
      headers,
      body: JSON.stringify(newGroup),
    }).then((response) => {
      if (response.ok) {
        alert('Group added successfully!');
        setGroups([...groups, newGroup]);
        setNewGroup({ name: '', tag: '' });
      } else {
        alert('Failed to add group');
      }
    });
  };

  return (
    <div className="App">
      <header>
        <h1>Food Sharing App</h1>
        <div className="user-info">
          <span>👤 {username}</span>
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

      <main>
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
              </li>
            ))}
          </ul>
        </section>

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

function App() {
  const [username, setUsername] = useState(null);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={!username ? <LoginRegister onLogin={setUsername} /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/dashboard"
          element={username ? <Dashboard username={username} /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
