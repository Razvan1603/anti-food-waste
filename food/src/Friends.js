import React, { useState, useEffect } from 'react';
import './Friends.css'; 
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

const BASE_URL = 'http://localhost:5020';

const Friends = () => {
  const [friends, setFriends] = useState([]);
  const [newFriend, setNewFriend] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupTag, setNewGroupTag] = useState('');
  const [friendGroupSelections, setFriendGroupSelections] = useState({});
  const navigate = useNavigate();

  // Fetch friends
  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    fetch(`${BASE_URL}/api/friends`, { headers })
      .then((res) => res.json())
      .then((data) => {
        setFriends(data.filter((friend) => friend && friend.username));
      })
      .catch(() => setErrorMessage('Failed to fetch friends.'));
  }, []);

  // Fetch groups
  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    fetch(`${BASE_URL}/api/groups`, { headers })
      .then((res) => res.json())
      .then((data) => {
        console.log("Groups received from API:", data); // ✅ Debug
        setGroups(data);
      })
      .catch(() => setErrorMessage('Failed to fetch groups.'));
  }, []);

  const handleHomeClick = () => navigate('/dashboard');

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
      .then((res) => res.json())
      .then(() => {
        setFriends((prev) => [...prev, { username: newFriend }]);
        setNewFriend('');
      })
      .catch(() => alert('Failed to add friend.'));
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim() || !newGroupTag.trim()) {
      alert('Please provide a valid group name and tag.');
      return;
    }

    const token = localStorage.getItem('token');
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    fetch(`${BASE_URL}/api/groups`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: newGroupName, tag: newGroupTag }),
    })
      .then((res) => res.json())
      .then((data) => {
        setGroups((prev) => [...prev, data.group]);
        setNewGroupName('');
        setNewGroupTag('');
      })
      .catch(() => alert('Failed to create group.'));
  };

  const handleGroupChange = (friendUsername, groupName) => {
    setFriendGroupSelections((prev) => ({
      ...prev,
      [friendUsername]: groupName,
    }));
  };

  const handleAddFriendToGroup = (friendUsername) => {
    const selectedGroup = friendGroupSelections[friendUsername];

    if (!selectedGroup) {
      alert('Please select a group.');
      return;
    }

    const token = localStorage.getItem('token');
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    fetch(`${BASE_URL}/api/groups/add-friend`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        username: friendUsername,
        group: selectedGroup,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
        } else {
          alert(`Added ${friendUsername} to group ${selectedGroup}`);
        }
      })
      .catch(() => alert('Failed to add friend to group.'));
  };
  console.log("Groups in React:", groups);
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
        {friends.length > 0 ? (
          friends.map((friend, index) => (
            <li key={index}>
              <strong>{friend.username}</strong>
              <select
                onChange={(e) =>
                  handleGroupChange(friend.username, e.target.value)
                }
                value={friendGroupSelections[friend.username] || ''}
              >
                <option value="">Select Group</option>
                {groups.map((group) => (
                  <option key={group._id} value={group.name}>
                    {group.name} ({group.tag})
                  </option>
                ))}
              </select>
              <button onClick={() => handleAddFriendToGroup(friend.username)}>
                Add to Group
              </button>
            </li>
          ))
        ) : (
          <p>No friends found.</p>
        )}
      </ul>
      <h2>Create New Group</h2>
      <div>
        <input
          type="text"
          placeholder="Group Name"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Group Tag (e.g., vegetarian)"
          value={newGroupTag}
          onChange={(e) => setNewGroupTag(e.target.value)}
        />
        <button onClick={handleCreateGroup}>Create Group</button>
      </div>
      <h2>Existing Groups</h2>
      <ul>
        {groups.length > 0 ? (
          groups.map((group) => (
            <li key={group._id}>
              <strong>{group.name}</strong> ({group.tag})
              <ul>
                {group.members.length > 0 ? (
                  group.members.map((member, index) => (
                    <li key={index}>{member.username}</li>
                  ))
                ) : (
                  <p>No members yet.</p>
                )}
              </ul>
            </li>
          ))
        ) : (
          <p>No groups found.</p>
        )}
      </ul>
    </div>
  );
};

export default Friends;
