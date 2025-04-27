import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AppContext } from '../Context/AppContext';
import axios from 'axios';
import SockJS from 'sockjs-client';
import { over } from 'stompjs';

const ChatWindow = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [recipient, setRecipient] = useState(null);
    const [stompClient, setStompClient] = useState(null);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const messagesEndRef = useRef(null);
    const { userId } = useParams();
    const { user } = useContext(AppContext);
    const navigate = useNavigate();

  useEffect(() => {
    const fetchRecipientAndMessages = async () => {
      try {
        // Fetch recipient details
        const recipientResponse = await axios.get(`http://localhost:8081/user/${userId}`, {
          withCredentials: true
        });
        setRecipient(recipientResponse.data);

        // Fetch chat messages
        if (user?.id) {
          const messagesResponse = await axios.get(
            `http://localhost:8081/api/messages/${user.id}/${userId}`,
            { withCredentials: true }
          );
          setMessages(messagesResponse.data);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    if (userId) {
      fetchRecipientAndMessages();
    }
  }, [userId, user]);

  useEffect(() => {
    if (!user?.id) return;

    // Connect to WebSocket
    const socket = new SockJS('http://localhost:8081/ws');
    const client = over(socket);
    
    client.connect({}, () => {
      setStompClient(client);
      
      // Subscribe to private messages
      client.subscribe(`/user/${user.id}/queue/messages`, (message) => {
        const receivedMessage = JSON.parse(message.body);
        setMessages(prev => [...prev, receivedMessage]);
      });
    });

    return () => {
      if (client) {
        client.disconnect();
      }
    };
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleUpdateMessage = async (messageId) => {
    try {
      const response = await axios.put(
        `http://localhost:8081/api/messages/${messageId}`,
        { content: editContent },
        { withCredentials: true }
      );
      
      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, content: editContent } : msg
      ));
      setEditingMessageId(null);
      setEditContent('');
    } catch (error) {
      console.error('Failed to update message:', error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await axios.delete(
        `http://localhost:8081/api/messages/${messageId}`,
        { withCredentials: true }
      );
      setMessages(messages.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const startEditing = (message) => {
    setEditingMessageId(message.id);
    setEditContent(message.content);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditContent('');
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === '' || !stompClient || !user?.id || !userId) return;

    const messageDto = {
      senderId: user.id,
      receiverId: userId,
      content: newMessage
    };

    // Send via WebSocket
    stompClient.send("/app/chat", {}, JSON.stringify(messageDto));

    // Optimistically update UI
    const optimisticMessage = {
      id: Date.now(), // temporary ID
      senderId: user.id,
      receiverId: userId,
      content: newMessage,
      timestamp: new Date().toISOString(),
      status: 'DELIVERED'
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  if (!recipient) {
    return <div className="flex-1 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="border-b border-gray-200 p-4 flex items-center">
        <button 
          onClick={() => navigate('/dash')}
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          &larr;
        </button>
        {recipient.imageUrl ? (
          <img
            src={recipient.imageUrl}
            alt={recipient.firstName}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold text-lg">
            {getInitial(recipient.firstName)}
          </div>
        )}
        <div className="ml-3">
          <h3 className="font-semibold">{recipient.firstName} {recipient.lastName}</h3>
          <p className="text-xs text-gray-500">Online</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`relative group ${message.senderId === user?.id ? 'flex flex-col items-end' : ''}`}>
              {editingMessageId === message.id ? (
                <div className="w-full max-w-xs md:max-w-md lg:max-w-lg">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                    rows="3"
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      onClick={() => handleUpdateMessage(message.id)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-3 ${message.senderId === user?.id 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-800'}`}
                >
                  <p>{message.content}</p>
                  <p className={`text-xs mt-1 ${message.senderId === user?.id ? 'text-blue-100' : 'text-gray-500'}`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}
              
              {/* Message actions (only for sender's messages) */}
              {message.senderId === user?.id && editingMessageId !== message.id && (
                <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                  <button
                    onClick={() => startEditing(message)}
                    className="p-1 bg-gray-200 rounded-full hover:bg-gray-300"
                    title="Edit"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteMessage(message.id)}
                    className="p-1 bg-gray-200 rounded-full hover:bg-gray-300"
                    title="Delete"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            rows="1"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="ml-2 bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 disabled:bg-blue-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;