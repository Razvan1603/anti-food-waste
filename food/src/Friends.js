import React, { useState, useEffect } from 'react';
import './Friends.css'; 

const BASE_URL = 'http://localhost:5020';

function Friends() {
  const [friends, setFriends] = useState([]);
  const [newFriend, setNewFriend] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    fetch(`${BASE_URL}/api/friends`, { headers })
      .then((res) => res.json())
      .then((data) => setFriends(data))
      .catch((err) => setErrorMessage('Failed to fetch friends.'));
  }, []);

  const handleAddFriend = () => {
    if (!newFriend.trim()) {
      alert('Please enter a valid username.');
      return;
    }

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    fetch(`${BASE_URL}/api/friends`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ username: newFriend }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to add friend.');
        return res.json();
      })
      .then((data) => {
        setFriends([...friends, data.friend]);
        setNewFriend('');
      })
      .catch((err) => alert(err.message));
  };

  return (
    <div className="friends">
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
        {friends.map((friend) => (
          <li key={friend.id}>{friend.username}</li>
        ))}
      </ul>
    </div>
  );
}

export default Friends;
