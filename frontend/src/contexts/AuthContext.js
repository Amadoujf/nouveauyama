import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const AuthContext = createContext(null);

const API_URL = process.env.REACT_APP_BACKEND_URL;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("auth_token"));

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // Check auth status on mount
  const checkAuth = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/me`);
      setUser(response.data);
    } catch (error) {
      setUser(null);
      setToken(null);
      localStorage.removeItem("auth_token");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Register
  const register = async (name, email, password, phone = null) => {
    const response = await axios.post(
      `${API_URL}/api/auth/register`,
      { name, email, password, phone }
    );
    
    const { token: newToken, ...userData } = response.data;
    setToken(newToken);
    setUser(userData);
    localStorage.setItem("auth_token", newToken);
    
    return userData;
  };

  // Login
  const login = async (email, password) => {
    const response = await axios.post(
      `${API_URL}/api/auth/login`,
      { email, password }
    );
    
    const { token: newToken, ...userData } = response.data;
    setToken(newToken);
    setUser(userData);
    localStorage.setItem("auth_token", newToken);
    
    return userData;
  };

  // Google OAuth Login
  // NOTE: For production, implement Google OAuth using:
  // 1. Create credentials at https://console.cloud.google.com/
  // 2. Use a library like react-oauth/google
  // 3. Verify tokens on backend with google-auth-library
  const loginWithGoogle = () => {
    // Temporarily disabled - requires Google Cloud Console setup
    alert("Google OAuth n'est pas encore configuré. Veuillez utiliser l'authentification par email/mot de passe.");
    console.log("Google OAuth requires setup. See AuthContext.js for instructions.");
  };

  // Process Google OAuth callback (placeholder for future implementation)
  const processGoogleCallback = async (sessionId) => {
    console.log("Google callback received:", sessionId);
    // Implement when Google OAuth is configured
    return null;
  };

  // Logout
  const logout = async () => {
    try {
      await axios.post(`${API_URL}/api/auth/logout`);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("auth_token");
    }
  };

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isAdmin,
    register,
    login,
    loginWithGoogle,
    processGoogleCallback,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
