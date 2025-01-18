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
      .then((data) => {
        console.log('Data received:', data);
        if (Array.isArray(data)) {
          const friendsWithUsername = data.filter(friend => friend && friend.username);
          console.log('Filtered friends:', friendsWithUsername);  // Logăm lista de prieteni validați
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
  

  const handleAddFriend = () => {
    if (!newFriend.trim()) {
      alert('Please enter a valid username.');
      return;
    }
  
    const token = localStorage.getItem('token');
    const headers = { 
      Authorization: `Bearer ${token}`, 
      'Content-Type': 'application/json' 
    };
  
    // Adăugăm prietenul în lista locală înainte de a primi răspunsul
    const tempFriend = { username: newFriend, owner: 'me' };  // Sau folosește datele corespunzătoare pentru un prieten
    setFriends((prevFriends) => [...prevFriends, tempFriend]);
    
    fetch(`${BASE_URL}/api/friends`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ username: newFriend }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to add friend.');
        }
        return res.json();
      })
      .then((data) => {
        // În cazul în care răspunsul este corect, confirmăm adăugarea
        console.log('Friend added successfully:', data);
        setNewFriend('');
      })
      .catch((err) => {
        console.error('Error adding friend:', err.message);
        // În cazul în care există o eroare, eliminăm prietenul din listă
        setFriends((prevFriends) => prevFriends.filter(friend => friend.username !== newFriend));
        alert(err.message);
      });
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
        {friends.length > 0 ? (
          friends.map((friend, index) => (
            <li key={index}>
              {/* Verifică dacă friend.username există înainte de a-l afișa */}
              <strong>{friend.username ? friend.username : 'Unknown User'}</strong>
            </li>
          ))
        ) : (
          <p>No friends found.</p>
        )}
      </ul>
    </div>
  );
}

export default Friends;
