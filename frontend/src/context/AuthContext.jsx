import { createContext, useState } from "react";
import { getUserById } from "../api/users";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [userMap, setUserMap] = useState({});

  // 🔹 Fetch + cache username by ID
  const ensureUser = async (userId) => {
    if (userMap[userId]) return;

    try {
      const res = await getUserById(userId);
      setUserMap((prev) => ({
        ...prev,
        [res.data.id]: res.data.username,
      }));
    } catch (err) {
      console.error("Failed to load user", userId);
    }
  };

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUserMap({});
  };

  return (
    <AuthContext.Provider
      value={{ token, login, logout, userMap, ensureUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
