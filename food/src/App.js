import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import FoodList from './FoodList';


const BASE_URL = 'http://localhost:5020'; 


function LoginRegister({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const endpoint = isLogin ? '/api/login' : '/api/register';

    fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((error) => {
            throw new Error(error.message || 'Request failed');
          });
        }
        return res.json();
      })
      .then((data) => {
        if (isLogin && data.token) {
          localStorage.setItem('token', data.token);
          onLogin(username);
        } else if (!isLogin) {
          alert('Registration successful! Please log in.');
          setIsLogin(true);
        }
      })
      .catch((error) => setErrorMessage(error.message));
  };

  return (
    <div className="login-register">
      <h2>{isLogin ? 'Login' : 'Register'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
      </form>
      <button id="switchBtn" onClick={() => setIsLogin(!isLogin)}>
        Switch to {isLogin ? 'Register' : 'Login'}
      </button>
      {errorMessage && <p className="error">{errorMessage}</p>}
    </div>
  );
}


function Dashboard({ username }) {
  const [fridgeItems, setFridgeItems] = useState([]);
  const [groups, setGroups] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', expiryDate: '', category: 'Dairy' });
  const [newGroup, setNewGroup] = useState({ name: '', tag: '' });
  const navigate = useNavigate();
  const handleFoodListClick = () => {
    navigate('/food-list');  // Redirecționează către pagina food-list
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    


    fetch(`${BASE_URL}/api/fridge`, { headers })
      .then((res) => res.json())
      .then((data) => setFridgeItems(data));


    fetch(`${BASE_URL}/api/groups`, { headers })
      .then((res) => res.json())
      .then((data) => setGroups(data));

      fetch(`${BASE_URL}/api/alerts`, { headers })
      .then((res) => res.json())
      .then((data) => {
        console.log('Alerts data:', data);
        setAlerts(data);
      })
      .catch((err) => console.error('Error fetching alerts:', err));
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ro-RO');  // Formatează data pentru România
  };
  const handleAddItem = () => {
    if (!newItem.name.trim() || !newItem.expiryDate) {
      alert('Please provide a valid name and expiry date.');
      return;
    }
  ;


    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    fetch(`${BASE_URL}/api/fridge`, {
      method: 'POST',
      headers,
      body: JSON.stringify(newItem),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to add item');
        return res.json();
      })
      .then((data) => {
        setFridgeItems([...fridgeItems, data.item]);
        setNewItem({ name: '', expiryDate: '', category: 'Dairy' });
      })
      .catch((err) => alert(err.message));
  };

  const handleAddGroup = () => {
    if (!newGroup.name.trim() || !newGroup.tag.trim()) {
      alert('Please provide both group name and tag.');
      return;
    }
  
    

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    fetch(`${BASE_URL}/api/groups`, {
      method: 'POST',
      headers,
      body: JSON.stringify(newGroup),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to add group');
        return res.json();
      })
      .then((data) => {
        setGroups([...groups, data.group]);
        setNewGroup({ name: '', tag: '' });
      })
      .catch((err) => alert(err.message));
  };


  return (
    <div className="dashboard">
      <header>
        <h1>Welcome to Food Sharing App</h1>
        <div className="user-info">
          <span>👤 {username}</span>
          <button id="friendlist">Friends</button>
          <button id="foodList" onClick={handleFoodListClick}>Check food</button>
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
        <section>
          <h2>Your Fridge</h2>
          <div>
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
                {item.name} - {formatDate(item.expiryDate)} - {item.category}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2>Your Groups</h2>
          <div>
            <input
              type="text"
              placeholder="Group Name"
              value={newGroup.name}
              onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Tag"
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

        <section>
  <h2>Alerts</h2>
  {alerts.length === 0 ? (
    <p>No items expiring soon.</p>
  ) : (
    <ul>
      {alerts.map((alert) => (
        <li key={alert._id}>
          {alert.name} (Category: {alert.category}) - Expiry: {new Date(alert.expiryDate).toLocaleDateString()}
        </li>
      ))}
    </ul>
  )}
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
         <Route
          path="/food-list"
          element={<FoodList />}  // Rutează către FoodList
        />
      </Routes>
      
    </Router>
  );
}

export default App;
