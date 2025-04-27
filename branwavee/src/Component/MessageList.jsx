import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from '../Context/AppContext';

const MessageList = () => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [unreadCounts, setUnreadCounts] = useState({});
    const navigate = useNavigate();
    
    // Access context this way
    const { user } = useContext(AppContext);

  useEffect(() => {
    const fetchUsersAndUnreadCounts = async () => {
        try {
          const usersResponse = await axios.get('http://localhost:8081/all-users', { 
            withCredentials: true 
          });
          setUsers(usersResponse.data);
      
          if (user?.id) {
            const unreadResponse = await axios.get(
              `http://localhost:8081/api/messages/unread/${user.id}`, 
              { 
                withCredentials: true,
                headers: {
                  'Content-Type': 'application/json'
                }
              }
            );
            const counts = {};
            unreadResponse.data.forEach(item => {
              counts[item.senderId] = item.count;
            });
            setUnreadCounts(counts);
          }
        } catch (error) {
          console.error('Failed to fetch data:', error);
        }
      };

    fetchUsersAndUnreadCounts();
  }, [user]);

  const filteredUsers = users.filter(user =>
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const handleUserClick = (userId) => {
    navigate(`/message/${userId}`);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Messages</h2>
        <button className="text-gray-400 hover:text-gray-600">✏️</button>
      </div>

      <input
        type="text"
        placeholder="Search Messages"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 rounded-md border border-gray-300 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <div className="flex-1 overflow-y-auto">
        <ul className="space-y-4">
          {filteredUsers.map(user => (
            <li
              key={user.id}
              className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 p-2 rounded-lg relative"
              onClick={() => handleUserClick(user.id)}
            >
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.firstName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold text-lg">
                  {getInitial(user.firstName)}
                </div>
              )}
              <div className="flex-1">
                <div className="font-semibold text-sm">{user.firstName} {user.lastName}</div>
                <div className="text-xs text-gray-500">Last message preview...</div>
              </div>
              {/* {unreadCounts[user.id] > 0 && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCounts[user.id]}
                </div>
              )} */}
            </li>
          ))}
        </ul>

        {filteredUsers.length === 0 && (
          <div className="text-center text-gray-400 mt-6">
            No users found.
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageList;