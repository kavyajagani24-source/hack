import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  userName: string | null;
  login: (name: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedAuth = localStorage.getItem("isAuthenticated");
    const storedName = localStorage.getItem("userName");
    if (storedAuth === "true" && storedName) {
      setIsAuthenticated(true);
      setUserName(storedName);
    }
  }, []);

  const login = (name: string) => {
    setIsAuthenticated(true);
    setUserName(name);
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("userName", name);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserName(null);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userName");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userName, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
