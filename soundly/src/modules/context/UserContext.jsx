// src/context/UserContext.js
import React, { createContext, useState } from 'react';

// Создаем контекст
export const UserContext = createContext();

// Провайдер для контекста
export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState({});

  return (
    <UserContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserContext.Provider>
  );
};