'use client';
import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/app/context/AuthContext';

interface Message {
  message_id: number;
  sender_id: number;
  receiver_id: number;
  message_text: string;
  message?: string;
  sent_at: string;
  username: string;
  avatar_url: string;
}

interface Conversation {
  user_id: number;
  username: string;
  avatar_url: string;
  last_message: string;
  last_message_time: string;
}

interface Friend {
  user_id: number;
  username: string;
  avatar_url: string;
  status: string;
}

export default function Messages() {
  const socketRef = useRef<Socket | null>(null);
  const auth = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentChat, setCurrentChat] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat]);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io('http://localhost:5001', {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    // Set up socket event listeners
    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('receive_message', (message: Message) => {
      console.log('Received message:', message);
      // Update current chat if the message is from the selected user or if we're the sender
      if (selectedUser && (message.sender_id === selectedUser.user_id || message.receiver_id === selectedUser.user_id)) {
        setCurrentChat(prev => {
          // Check if message already exists to prevent duplicates
          const messageExists = prev.some(m => m.message_id === message.message_id);
          if (messageExists) return prev;
          console.log('Adding new message to chat:', message);
          return [...prev, message];
        });
      }
      // Always update conversations to show latest message
      fetchConversations();
    });

    // Initial data fetch
    fetchConversations();
    fetchFriends();

    // Cleanup function
    return () => {
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('receive_message');
        socket.disconnect();
      }
    };
  }, [selectedUser]); // Keep selectedUser as dependency

  // Add effect to scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [currentChat]);

  const fetchConversations = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/messages/conversations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchFriends = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/friends', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setFriends(data);
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const loadChat = async (conversation: Conversation) => {
    setSelectedUser(conversation);
    try {
      const response = await fetch(`http://localhost:5001/api/messages/${conversation.user_id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load chat');
      }
      
      const data = await response.json();
      console.log('Loaded chat data:', data);
      setCurrentChat(data);
    } catch (error) {
      console.error('Error loading chat:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newMessage.trim() || !socketRef.current) return;

    try {
      // First emit the socket event
      socketRef.current.emit('send_message', {
        receiver_id: selectedUser.user_id,
        message: newMessage
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const filteredFriends = friends.filter(friend =>
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startNewChat = (friend: Friend) => {
    const existingConversation = conversations.find(c => c.user_id === friend.user_id);
    if (existingConversation) {
      loadChat(existingConversation);
    } else {
      const newConversation: Conversation = {
        user_id: friend.user_id,
        username: friend.username,
        avatar_url: friend.avatar_url,
        last_message: '',
        last_message_time: new Date().toISOString()
      };
      loadChat(newConversation);
    }
    setIsNewChatModalOpen(false);
  };

  return (
    <main className="flex h-[calc(100vh-4rem)]">
      <aside className="w-1/3 border-r">
        <header className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Conversations</h2>
          <button
            onClick={() => setIsNewChatModalOpen(true)}
            className="bg-purple-400 text-white px-3 py-1 rounded-lg hover:bg-purple-500"
          >
            New Chat
          </button>
        </header>
        <nav className="overflow-y-auto">
          {conversations.map((conversation) => (
            <article
              key={conversation.user_id}
              onClick={() => loadChat(conversation)}
              className={`p-4 border-b cursor-pointer hover:bg-gray-100 ${
                selectedUser?.user_id === conversation.user_id ? 'bg-gray-100' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <figure className="w-10 h-10 rounded-full bg-gray-300">
                  {conversation.avatar_url && (
                    <img
                      src={conversation.avatar_url}
                      alt={conversation.username}
                      className="w-full h-full rounded-full"
                    />
                  )}
                </figure>
                <div>
                  <h3 className="font-semibold">{conversation.username}</h3>
                  <p className="text-sm text-gray-500">{conversation.last_message}</p>
                </div>
              </div>
            </article>
          ))}
        </nav>
      </aside>

      <section className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            <header className="p-4 border-b">
              <h2 className="text-xl font-bold">{selectedUser.username}</h2>
            </header>
            <main className="flex-1 overflow-y-auto p-4">
              {currentChat.map((message) => {
                console.log('Rendering message:', message); // Debug log for message rendering
                return (
                  <article
                    key={`message-${message.message_id}-${message.sent_at}`}
                    className={`mb-4 flex ${
                      message.sender_id === auth?.user?.user_id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        message.sender_id === auth?.user?.user_id
                          ? 'bg-purple-400 text-white rounded-tr-none'
                          : 'bg-gray-200 text-gray-800 rounded-tl-none'
                      }`}
                    >
                      <p className="break-words">{message.message_text || message.message}</p>
                      <time className={`text-xs ${message.sender_id === auth?.user?.user_id ? 'text-white/75' : 'text-gray-500'}`}>
                        {new Date(message.sent_at).toLocaleTimeString()}
                      </time>
                    </div>
                  </article>
                );
              })}
              <div ref={messagesEndRef} />
            </main>
            <footer className="p-4 border-t">
              <form onSubmit={sendMessage}>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 border rounded-lg p-2"
                    placeholder="Type a message..."
                    aria-label="Message input"
                  />
                  <button
                    type="submit"
                    className="bg-purple-400 text-white px-4 py-2 rounded-lg"
                  >
                    Send
                  </button>
                </div>
              </form>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation to start chatting
          </div>
        )}
      </section>

      {isNewChatModalOpen && (
        <dialog className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <header className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Start New Chat</h3>
              <button
                onClick={() => setIsNewChatModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close modal"
              >
                ✕
              </button>
            </header>
            <input
              type="text"
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border rounded-lg mb-4"
              aria-label="Search friends"
            />
            <nav className="max-h-64 overflow-y-auto">
              {filteredFriends.map((friend) => (
                <article
                  key={friend.user_id}
                  onClick={() => startNewChat(friend)}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  <figure className="w-10 h-10 rounded-full bg-gray-300">
                    {friend.avatar_url && (
                      <img
                        src={friend.avatar_url}
                        alt={friend.username}
                        className="w-full h-full rounded-full"
                      />
                    )}
                  </figure>
                  <span className="font-semibold">{friend.username}</span>
                </article>
              ))}
              {filteredFriends.length === 0 && (
                <p className="text-center text-gray-500">No friends found</p>
              )}
            </nav>
          </div>
        </dialog>
      )}
    </main>
  );
}