'use client';
import { useState, useEffect } from 'react';
import { FaTimes, FaUserPlus, FaCheck, FaTimes as FaX, FaSearch, FaUser } from 'react-icons/fa';

interface FriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Friend {
  user_id: number;
  username: string;
  avatar_url: string;
  status: string;
}

interface User {
  user_id: number;
  username: string;
  avatar_url: string;
  bio: string;
}

export default function FriendsModal({ isOpen, onClose }: FriendsModalProps) {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'add' | 'discover'>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<Friend[]>([]);
  const [newFriendUsername, setNewFriendUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchFriends();
      fetchFriendRequests();
      if (activeTab === 'discover') {
        fetchUsers();
      }
    }
  }, [isOpen, activeTab]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('https://fitness-network-backend-lcuf.onrender.com/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        setUsers([]);
        setError('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      setError('Failed to load users');
    }
  };

  const fetchFriends = async () => {
    try {
      const response = await fetch('https://fitness-network-backend-lcuf.onrender.com/api/friends', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch friends');
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setFriends(data);
      } else {
        setFriends([]);
        setError('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
      setFriends([]);
      setError('Failed to load friends');
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const response = await fetch('https://fitness-network-backend-lcuf.onrender.com/api/friends/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch friend requests');
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        // Filter friend requests to only show pending ones
        const pendingRequests = data.filter(request => request.status === 'pending');
        setFriendRequests(pendingRequests);
      } else {
        setFriendRequests([]);
        setError('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      setFriendRequests([]);
      setError('Failed to load friend requests');
    }
  };

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendUsername) return;

    setLoading(true);
    try {
      const response = await fetch('https://fitness-network-backend-lcuf.onrender.com/api/friends/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ username: newFriendUsername }),
      });

      if (response.ok) {
        setNewFriendUsername('');
        alert('Friend request sent!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to send friend request');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      alert('Error sending friend request');
    }
    setLoading(false);
  };

  const handleFriendRequest = async (friendId: number, status: 'accepted' | 'declined') => {
    try {
      const response = await fetch('https://fitness-network-backend-lcuf.onrender.com/api/friends/respond', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ friend_id: friendId, status }),
      });

      if (response.ok) {
        fetchFriendRequests();
        if (status === 'accepted') {
          fetchFriends();
        }
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to respond to friend request');
      }
    } catch (error) {
      console.error('Error responding to friend request:', error);
      alert('Error responding to friend request');
    }
  };

  const handleRemoveFriend = async (friendId: number) => {
    try {
      const response = await fetch('https://fitness-network-backend-lcuf.onrender.com/api/friends', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ friend_id: friendId }),
      });

      if (response.ok) {
        fetchFriends();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to remove friend');
      }
    } catch (error) {
      console.error('Error removing friend:', error);
      alert('Error removing friend');
    }
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Friends</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500 text-white rounded-lg">
            {error}
          </div>
        )}

        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setActiveTab('friends')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'friends'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-gray-300'
            }`}
          >
            Friends
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'requests'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-gray-300'
            }`}
          >
            Requests
          </button>
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'discover'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-gray-300'
            }`}
          >
            Discover
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'add'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-gray-300'
            }`}
          >
            Add Friend
          </button>
        </div>

        <div className="mt-4">
          {activeTab === 'friends' && (
            <div className="space-y-4">
              {Array.isArray(friends) && friends.map((friend) => (
                <div
                  key={friend.user_id}
                  className="flex items-center justify-between bg-slate-700 p-4 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center">
                      <FaUser className="text-slate-400 text-xl" />
                    </div>
                    <span className="text-white">{friend.username}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveFriend(friend.user_id)}
                    className="p-2 bg-red-600 rounded-lg hover:bg-red-700"
                  >
                    <FaTimes className="text-white" />
                  </button>
                </div>
              ))}
              {(!Array.isArray(friends) || friends.length === 0) && (
                <p className="text-gray-400 text-center">No friends yet</p>
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-4">
              {Array.isArray(friendRequests) && friendRequests.map((request) => (
                <div
                  key={request.user_id}
                  className="flex items-center justify-between bg-slate-700 p-4 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center">
                      <FaUser className="text-slate-400 text-xl" />
                    </div>
                    <span className="text-white">{request.username}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleFriendRequest(request.user_id, 'accepted')}
                      className="p-2 bg-green-600 rounded-lg hover:bg-green-700"
                    >
                      <FaCheck className="text-white" />
                    </button>
                    <button
                      onClick={() => handleFriendRequest(request.user_id, 'declined')}
                      className="p-2 bg-red-600 rounded-lg hover:bg-red-700"
                    >
                      <FaX className="text-white" />
                    </button>
                  </div>
                </div>
              ))}
              {(!Array.isArray(friendRequests) || friendRequests.length === 0) && (
                <p className="text-gray-400 text-center">No pending friend requests</p>
              )}
            </div>
          )}

          {activeTab === 'discover' && (
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg pl-10"
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {Array.isArray(filteredUsers) && filteredUsers.map((user) => (
                  <div
                    key={user.user_id}
                    className="flex items-center justify-between bg-slate-700 p-4 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center">
                        <FaUser className="text-slate-400 text-xl" />
                      </div>
                      <div>
                        <span className="text-white block">{user.username}</span>
                        {user.bio && (
                          <span className="text-gray-400 text-sm block">{user.bio}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddFriend({ preventDefault: () => {} } as React.FormEvent)}
                      className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      <FaUserPlus className="text-white" />
                    </button>
                  </div>
                ))}
                {(!Array.isArray(filteredUsers) || filteredUsers.length === 0) && (
                  <p className="text-gray-400 text-center">No users found</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'add' && (
            <form onSubmit={handleAddFriend} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={newFriendUsername}
                  onChange={(e) => setNewFriendUsername(e.target.value)}
                  className="mt-1 block w-full rounded-md bg-slate-700 border-gray-600 text-white px-3 py-2"
                  placeholder="Enter username"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-300"
              >
                <FaUserPlus />
                <span>{loading ? 'Sending...' : 'Send Friend Request'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 