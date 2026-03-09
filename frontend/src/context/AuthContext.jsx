import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('habitUser');
    // Ensure we parse and return the full object including the ID
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (userData) => {
    // FIX: Map the backend response to ensure 'id' is present
    const userToSave = {
      id: userData.id || userData.userId, // Matches your MySQL/Mongo ID field
      username: userData.username,
      email: userData.email
    };
    
    setUser(userToSave);
    localStorage.setItem('habitUser', JSON.stringify(userToSave));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('habitUser');
    // Force a reload to clear any stale states in memory
    window.location.href = '/login'; 
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);