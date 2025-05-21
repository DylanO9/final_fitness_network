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
  const user = auth?.user;
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
    <main className="flex h-[calc(100vh-4rem)] bg-gray-50">
      {/* Conversations sidebar */}
      <aside className="w-1/3 border-r bg-white shadow-sm">
        <header className="flex justify-between items-center p-4 border-b bg-white">
          <h2 className="text-xl font-bold text-gray-800">Conversations</h2>
          <button
            onClick={() => setIsNewChatModalOpen(true)}
            className="bg-purple-400 text-white px-4 py-2 rounded-lg hover:bg-purple-500 transition-colors duration-200"
          >
            New Chat
          </button>
        </header>
        
        <div className="overflow-y-auto h-[calc(100vh-8rem)]">
          {conversations.map((conversation) => (
            <article
              key={conversation.user_id}
              onClick={() => loadChat(conversation)}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${
                selectedUser?.user_id === conversation.user_id ? 'bg-purple-50' : ''
              }`}
            >
              <div className="flex items-center space-x-4">
                <figure className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                  {conversation.avatar_url ? (
                    <img
                      src={conversation.avatar_url}
                      alt={conversation.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-purple-200 flex items-center justify-center text-purple-600 font-semibold">
                      {conversation.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </figure>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate">{conversation.username}</h3>
                  <p className="text-sm text-gray-500 truncate">{conversation.last_message}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </aside>

      {/* Chat area */}
      <section className="flex-1 flex flex-col bg-white">
        {selectedUser ? (
          <>
            <header className="p-4 border-b bg-white shadow-sm">
              <div className="flex items-center space-x-4">
                <figure className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                  {selectedUser.avatar_url ? (
                    <img
                      src={selectedUser.avatar_url}
                      alt={selectedUser.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-purple-200 flex items-center justify-center text-purple-600 font-semibold">
                      {selectedUser.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </figure>
                <h2 className="text-xl font-bold text-gray-800">{selectedUser.username}</h2>
              </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
              <div className="max-w-3xl mx-auto space-y-4">
                {currentChat.map((message) => (
                  <article
                    key={`message-${message.message_id}-${message.sent_at}`}
                    className={`flex ${
                      message.sender_id === user?.user_id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-2xl ${
                        message.sender_id === user?.user_id
                          ? 'bg-purple-400 text-white rounded-tr-none'
                          : 'bg-white text-gray-800 rounded-tl-none shadow-sm'
                      }`}
                    >
                      <p className="break-words text-sm">{message.message_text || message.message}</p>
                      <time className={`text-xs mt-1 block ${
                        message.sender_id === user?.user_id ? 'text-white/75' : 'text-gray-500'
                      }`}>
                        {new Date(message.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </time>
                    </div>
                  </article>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </main>

            <footer className="p-4 border-t bg-white">
              <form onSubmit={sendMessage} className="max-w-3xl mx-auto">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                    placeholder="Type a message..."
                    aria-label="Message input"
                  />
                  <button
                    type="submit"
                    className="bg-purple-400 text-white px-6 py-2 rounded-full hover:bg-purple-500 transition-colors duration-200 flex items-center justify-center"
                  >
                    Send
                  </button>
                </div>
              </form>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50">
            <div className="text-center">
              <p className="text-lg mb-2">Select a conversation to start chatting</p>
              <p className="text-sm text-gray-400">Or start a new chat with a friend</p>
            </div>
          </div>
        )}
      </section>

      {/* New Chat Modal */}
      {isNewChatModalOpen && (
        <dialog className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] flex flex-col">
            <header className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Start New Chat</h3>
              <button
                onClick={() => setIsNewChatModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
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
              className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
              aria-label="Search friends"
            />
            <nav className="flex-1 overflow-y-auto">
              {filteredFriends.map((friend) => (
                <article
                  key={friend.user_id}
                  onClick={() => startNewChat(friend)}
                  className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-200"
                >
                  <figure className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                    {friend.avatar_url ? (
                      <img
                        src={friend.avatar_url}
                        alt={friend.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-purple-200 flex items-center justify-center text-purple-600 font-semibold">
                        {friend.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </figure>
                  <span className="font-semibold text-gray-800">{friend.username}</span>
                </article>
              ))}
              {filteredFriends.length === 0 && (
                <p className="text-center text-gray-500 py-4">No friends found</p>
              )}
            </nav>
          </div>
        </dialog>
      )}
    </main>
  );
}