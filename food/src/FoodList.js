import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import './FoodList.css';
import './App.css';

function FoodList() {
  const [fridgeItems, setFridgeItems] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [searchOwner, setSearchOwner] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' pentru crescător, 'desc' pentru descrescător
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    fetch('http://localhost:5020/api/fridgelist', { headers })
      .then((res) => res.json())
      .then((data) => setFridgeItems(data))
      .catch((err) => console.error('Error fetching food items:', err));
  }, []);

  const handleHomeClick = () => {
    navigate('/dashboard');
  };
// Functie pentru a partaja pe Facebook
const handleShareOnFacebook = (itemName) => {
    if (window.FB) {
      window.FB.ui({
        method: 'share',
        href: window.location.href, // sau un link personalizat pentru postare
        quote: `Check out this food item: ${itemName}`,
      }, function(response) {
        if (response && !response.error_message) {
          alert('Successfully shared on Facebook!');
        } else {
          alert('Error while sharing on Facebook.');
        }
      });
    } else {
      alert('Facebook SDK is not loaded.');
    }
  };
  const handleClaim = (_id) => {
    const token = localStorage.getItem('token');
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    fetch(`http://localhost:5020/api/fridgelist/${_id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ available: false }),
    })
      .then((res) => res.json())
      .then(() => {
        setFridgeItems((prevItems) =>
          prevItems.map((item) =>
            item._id === _id ? { ...item, available: false } : item
          )
        );
      })
      .catch((err) => console.error('Error claiming food item:', err));
  };

  const handleSearch = (items) =>
    items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchName.toLowerCase()) &&
        item.owner.toLowerCase().includes(searchOwner.toLowerCase())
    );

  const handleSort = (items) => {
    return [...items].sort((a, b) => {
      let fieldA = a[sortField];
      let fieldB = b[sortField];

      if (sortField === 'expiryDate') {
        fieldA = new Date(fieldA);
        fieldB = new Date(fieldB);
      }

      if (fieldA < fieldB) return sortOrder === 'asc' ? -1 : 1;
      if (fieldA > fieldB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  };
  const handleShareOnInstagram = (itemName) => {
    const instagramURL = `https://www.instagram.com/create/story/?text=${encodeURIComponent('Check out this food item: ' + itemName)}`;
    window.open(instagramURL, '_blank');
  };

  const filteredItems = handleSort(handleSearch(fridgeItems));

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
      <div className="filters">
        <input
          type="text"
          placeholder="Search by name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search by owner"
          value={searchOwner}
          onChange={(e) => setSearchOwner(e.target.value)}
        />
        <button onClick={() => setSortField('expiryDate')}>Sort by Expiry</button>
        <button onClick={() => setSortField('category')}>Sort by Category</button>
        <button onClick={() => setSortField('available')}>Sort by Availability</button>
        <button
          onClick={() =>
            setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'))
          }
        >
          Toggle Order ({sortOrder})
        </button>
      </div>
      <ul>
        {filteredItems.map((item) => (
          <li key={item._id}>
            <strong>{item.name}</strong>
            <span>({item.category})</span>
            <small>Owner: {item.owner}</small>
            <small>Expiry: {new Date(item.expiryDate).toLocaleDateString()}</small>
            <button
              id="btnClaim"
              onClick={() => handleClaim(item._id)}
              disabled={!item.available}
            >
              {item.available ? 'Claim' : 'Claimed'}
            </button>
            <button
              onClick={() => handleShareOnFacebook(item.name)}
            >
              Share on Facebook
            </button>
            <button
              onClick={() => handleShareOnInstagram(item.name)}
            >
              Share on Instagram
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FoodList;
