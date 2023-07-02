import React, { createContext, useEffect, useState } from "react";
import axios from "axios";
import { axiosInstance } from "../config";


export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(sessionStorage.getItem("user")) || null
  );

  const setSessionStorage = (user) => {
    const now = new Date();
    const expirationTime = now.getTime() + 24 * 60 * 60 * 1000;
    sessionStorage.setItem(
      "user",
      JSON.stringify({ user, expirationTime })
    );
    setCurrentUser(user);
  };

  const clearSessionStorage = () => {
    sessionStorage.removeItem("user");
    setCurrentUser(null);
  };

  const login = async (values) => {
    const res = await axiosInstance.post("api/auth/login", values);
    setSessionStorage(res.data);
  };

  const register = async (values) => {
    const res = await axiosInstance.post("api/auth/register", values);
    setSessionStorage(res.data);
  };

  const logout = async () => {
    await axiosInstance.post("api/auth/logout");
    clearSessionStorage();
  };

  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem("user"));
    if (userData) {
      const now = new Date().getTime();
      if (now > userData.expirationTime) {
        clearSessionStorage();
      } else {
        setCurrentUser(userData.user);
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
