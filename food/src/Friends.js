import React, { useState, useEffect } from 'react';
import './Friends.css'; 
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

const BASE_URL = 'http://localhost:5020';

const Friends = () => {
  const [friends, setFriends] = useState([]);
  const [newFriend, setNewFriend] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    fetch(`${BASE_URL}/api/friends`, { headers })
      .then((res) => res.json())
      .then((data) => {
        console.log('Data received:', data);
        if (Array.isArray(data)) {
          const friendsWithUsername = data.filter(friend => friend && friend.username);
          console.log('Filtered friends:', friendsWithUsername);
          setFriends(friendsWithUsername);
        } else {
          console.error('Invalid data format received');
          setErrorMessage('Invalid data format received.');
        }
      })
      .catch((err) => {
        console.error('Error fetching friends:', err);
        setErrorMessage('Failed to fetch friends.');
      });
  }, []);

  const handleHomeClick = () => {
    navigate('/dashboard');
  };

  const handleAddFriend = () => {
    if (!newFriend.trim()) {
      alert('Please enter a valid username.');
      return;
    }

    const token = localStorage.getItem('token');
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    fetch(`${BASE_URL}/api/friends`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ username: newFriend }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((error) => {
            throw new Error(error.message);
          });
        }
        return res.json();
      })
      .then((data) => {
        console.log('Friend added successfully:', data);
        setFriends((prevFriends) => [...prevFriends, { username: newFriend, owner: 'me' }]);
        setNewFriend('');
      })
      .catch((err) => {
        console.error('Error adding friend:', err.message);
        alert(err.message);
      });
  };

  // Eliminăm duplicatele din lista de prieteni
  const uniqueFriends = friends.filter(
    (friend, index, self) =>
      index === self.findIndex((f) => f.username === friend.username)
  );

  return (
    <div className="friends">
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
      <h2>Friends List</h2>
      <div>
        <input
          type="text"
          placeholder="Add a friend's username"
          value={newFriend}
          onChange={(e) => setNewFriend(e.target.value)}
        />
        <button onClick={handleAddFriend}>Add Friend</button>
      </div>
      {errorMessage && <p className="error">{errorMessage}</p>}
      <ul>
        {uniqueFriends.length > 0 ? (
          uniqueFriends.map((friend, index) => (
            <li key={index}>
              <strong>{friend.username ? friend.username : 'Unknown User'}</strong>
            </li>
          ))
        ) : (
          <p>No friends found.</p>
        )}
      </ul>
    </div>
  );
};

export default Friends;
