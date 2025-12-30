import { createContext, useState, useEffect } from "react";
import api from "../api/axios";
import { getUserById } from "../api/users";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Logged-in user data
  const [me, setMe] = useState(null);        // { id, username }
  const [profile, setProfile] = useState(null); // { avatar }

  // Cache for author ID → username
  const [userMap, setUserMap] = useState({});

  // 🔹 Load current user when token changes
  useEffect(() => {
    if (!token) {
      setMe(null);
      setProfile(null);
      return;
    }

    api.get("auth/me/")
      .then((res) => {
        setMe(res.data.user);
        setProfile(res.data.profile);
      })
      .catch(() => {
        setMe(null);
        setProfile(null);
      });
  }, [token]);

  // 🔹 Fetch + cache username by ID (for posts/comments)
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
    setMe(null);
    setProfile(null);
    setUserMap({});
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        login,
        logout,
        me,
        profile,
        userMap,
        ensureUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
