import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const [user, setUser] = useState(null);  // Store user data

  // Fetch user info from backend when component mounts
  useEffect(() => {
    axios
      .get('http://localhost:8081/user-info', { withCredentials: true })
      .then((response) => {
        setUser(response.data);  // Store user data in context
      })
      .catch((error) => {
        console.error('Error fetching user info:', error);
      });
  }, []);

  const value = {
    user, // Provide user data in context
  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
