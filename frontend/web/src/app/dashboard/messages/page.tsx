'use client';
import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/app/context/AuthContext';
import Image from 'next/image';
import { motion } from 'framer-motion';
import ApiClient, { Friend, Message, Conversation } from '../../../utils/apiClient';

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
    socketRef.current = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001', {
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
      const { data, error } = await ApiClient.getConversations();
      if (error) {
        throw new Error(error);
      }
      if (data) {
        setConversations(data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchFriends = async () => {
    try {
      const { data, error } = await ApiClient.getAllFriends();
      if (error) {
        throw new Error(error);
      }
      if (data) {
        setFriends(data);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const loadChat = async (conversation: Conversation) => {
    setSelectedUser(conversation);
    try {
      const { data, error } = await ApiClient.getMessagesByUser(conversation.user_id);
      if (error) {
        throw new Error(error);
      }
      if (data) {
        console.log('Loaded chat data:', data);
        setCurrentChat(data);
      }
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

  return (    <main className="flex flex-col h-[calc(100vh-4rem)] bg-slate-900 md:flex-row">
      {/* Conversations sidebar - becomes top section on mobile */}
      <aside className="w-full md:w-1/3 border-b md:border-b-0 md:border-r bg-slate-800 shadow-sm border-slate-700 md:h-full">
        <header className="flex justify-between items-center p-4 border-b bg-slate-800 border-slate-700">
          <h2 className="text-xl font-bold text-white">Chats</h2>
          <button
            onClick={() => setIsNewChatModalOpen(true)}
            className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300"
          >
            New Chat
          </button>
        </header>
          <div className="overflow-y-auto max-h-[30vh] md:h-[calc(100vh-8rem)]">
          {conversations.map((conversation) => (
            <motion.article
              key={conversation.user_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => loadChat(conversation)}
              className={`p-4 border-b cursor-pointer hover:bg-slate-700/50 transition-colors duration-300 border-slate-700 ${
                selectedUser?.user_id === conversation.user_id ? 'bg-slate-700/50' : ''
              }`}
            >
              <div className="flex items-center space-x-4">
                <figure className="w-12 h-12 rounded-full bg-slate-700 overflow-hidden flex-shrink-0">
                  {conversation.avatar_url ? (
                    <Image
                      src={conversation.avatar_url}
                      alt={conversation.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-semibold">
                      {conversation.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </figure>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{conversation.username}</h3>
                  <p className="text-sm text-slate-300 truncate">{conversation.last_message}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </aside>

      {/* Chat area */}      <section className="flex-1 flex flex-col bg-slate-800 min-h-0">
        {selectedUser ? (
          <>
            <header className="p-4 border-b bg-slate-800 shadow-sm border-slate-700">
              <div className="flex items-center space-x-4">
                <figure className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden flex-shrink-0">
                  {selectedUser.avatar_url ? (
                    <Image
                      src={selectedUser.avatar_url}
                      alt={selectedUser.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-semibold">
                      {selectedUser.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </figure>
                <div>
                  <h3 className="font-semibold text-white">{selectedUser.username}</h3>
                  <p className="text-sm text-slate-300">Online</p>
                </div>
              </div>
            </header>            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
              {currentChat.map((message) => (
                <motion.div
                  key={message.message_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender_id === user?.user_id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.sender_id === user?.user_id
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-white'
                    }`}
                  >
                    <p>{message.message_text || message.message}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {new Date(message.sent_at).toLocaleTimeString()}
                    </span>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-4 border-t border-slate-700">
              <div className="flex flex-col gap-2 sm:flex-row sm:space-x-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 border border-slate-600 transition-colors duration-300"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300 w-full sm:w-auto"
                >
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-slate-300">Select a conversation to start chatting</p>
          </div>
        )}
      </section>

      {/* New Chat Modal */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-xl p-6 shadow-xl border border-slate-700 w-full max-w-md mx-4"
          >
            <h2 className="text-xl font-bold mb-4 text-white">New Chat</h2>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search friends..."
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 mb-4 focus:outline-none focus:border-blue-500 border border-slate-600 transition-colors duration-300"
            />
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredFriends.map((friend) => (
                <motion.button
                  key={friend.user_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => startNewChat(friend)}
                  className="w-full p-3 flex items-center space-x-3 hover:bg-slate-700/50 rounded-lg transition-colors duration-300"
                >
                  <figure className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden flex-shrink-0">
                    {friend.avatar_url ? (
                      <Image
                        src={friend.avatar_url}
                        alt={friend.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-semibold">
                        {friend.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </figure>
                  <div className="text-left">
                    <h3 className="font-semibold text-white">{friend.username}</h3>
                    <p className="text-sm text-slate-300">{friend.status}</p>
                  </div>
                </motion.button>
              ))}
            </div>
            <button
              onClick={() => setIsNewChatModalOpen(false)}
              className="mt-4 w-full border border-slate-700 rounded-lg py-2 text-slate-300 hover:bg-slate-700 transition-colors duration-300"
            >
              Cancel
            </button>
          </motion.div>
        </div>
      )}
    </main>
  );
}