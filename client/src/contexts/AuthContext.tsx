import React, { createContext, useContext, useState, useEffect } from 'react';
import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

interface User {
  username: string;
  passwordHash: string;
  twoFactorSecret?: string;
  twoFactorEnabled: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string, token?: string) => Promise<boolean>;
  logout: () => void;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  enable2FA: () => Promise<{ secret: string; qrCode: string }>;
  verify2FA: (token: string) => boolean;
  disable2FA: () => void;
  getAccessLog: () => AccessLogEntry[];
  loginAttempts: number;
  isLocked: boolean;
}

interface AccessLogEntry {
  timestamp: Date;
  username: string;
  success: boolean;
  ipAddress?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default admin credentials (will be hashed)
const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'Munitions2025';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState<NodeJS.Timeout | null>(null);

  // Initialize default user if not exists
  useEffect(() => {
    const storedUser = localStorage.getItem('agc-admin-user');
    if (!storedUser) {
      // Create default admin user with hashed password
      const passwordHash = bcrypt.hashSync(DEFAULT_PASSWORD, 10);
      const defaultUser: User = {
        username: DEFAULT_USERNAME,
        passwordHash,
        twoFactorEnabled: false
      };
      localStorage.setItem('agc-admin-user', JSON.stringify(defaultUser));
    }

    // Check for existing session
    const session = sessionStorage.getItem('agc-admin-session');
    if (session) {
      const sessionData = JSON.parse(session);
      const sessionAge = Date.now() - sessionData.timestamp;
      // Session expires after 30 minutes of inactivity
      if (sessionAge < 30 * 60 * 1000) {
        setIsAuthenticated(true);
        const userData = JSON.parse(localStorage.getItem('agc-admin-user') || '{}');
        setUser(userData);
        startSessionTimeout();
      } else {
        sessionStorage.removeItem('agc-admin-session');
      }
    }

    // Check if account is locked
    const lockUntil = localStorage.getItem('agc-admin-lock-until');
    if (lockUntil) {
      const lockTime = parseInt(lockUntil);
      if (Date.now() < lockTime) {
        setIsLocked(true);
        const unlockIn = lockTime - Date.now();
        setTimeout(() => {
          setIsLocked(false);
          localStorage.removeItem('agc-admin-lock-until');
          setLoginAttempts(0);
        }, unlockIn);
      } else {
        localStorage.removeItem('agc-admin-lock-until');
      }
    }
  }, []);

  const startSessionTimeout = () => {
    // Clear existing timeout
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
    }

    // Set new timeout for 30 minutes
    const timeout = setTimeout(() => {
      logout();
    }, 30 * 60 * 1000);

    setSessionTimeout(timeout);
  };

  const login = async (username: string, password: string, token?: string): Promise<boolean> => {
    if (isLocked) {
      return false;
    }

    const storedUser = localStorage.getItem('agc-admin-user');
    if (!storedUser) {
      return false;
    }

    const userData: User = JSON.parse(storedUser);

    // Check username
    if (userData.username !== username) {
      handleFailedLogin(username);
      return false;
    }

    // Check password
    const passwordMatch = bcrypt.compareSync(password, userData.passwordHash);
    if (!passwordMatch) {
      handleFailedLogin(username);
      return false;
    }

    // Check 2FA if enabled
    if (userData.twoFactorEnabled && userData.twoFactorSecret) {
      if (!token) {
        return false;
      }
      const verified = speakeasy.totp.verify({
        secret: userData.twoFactorSecret,
        encoding: 'base32',
        token: token,
        window: 2
      });
      if (!verified) {
        handleFailedLogin(username);
        return false;
      }
    }

    // Successful login
    setIsAuthenticated(true);
    setUser(userData);
    setLoginAttempts(0);
    
    // Create session
    sessionStorage.setItem('agc-admin-session', JSON.stringify({
      timestamp: Date.now(),
      username
    }));

    // Log access
    logAccess(username, true);

    // Start session timeout
    startSessionTimeout();

    return true;
  };

  const handleFailedLogin = (username: string) => {
    const newAttempts = loginAttempts + 1;
    setLoginAttempts(newAttempts);
    logAccess(username, false);

    // Lock account after 3 failed attempts for 15 minutes
    if (newAttempts >= 3) {
      const lockUntil = Date.now() + 15 * 60 * 1000;
      localStorage.setItem('agc-admin-lock-until', lockUntil.toString());
      setIsLocked(true);
      setTimeout(() => {
        setIsLocked(false);
        localStorage.removeItem('agc-admin-lock-until');
        setLoginAttempts(0);
      }, 15 * 60 * 1000);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    sessionStorage.removeItem('agc-admin-session');
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) return false;

    // Verify old password
    const passwordMatch = bcrypt.compareSync(oldPassword, user.passwordHash);
    if (!passwordMatch) {
      return false;
    }

    // Hash new password
    const newPasswordHash = bcrypt.hashSync(newPassword, 10);
    const updatedUser: User = {
      ...user,
      passwordHash: newPasswordHash
    };

    // Save to localStorage
    localStorage.setItem('agc-admin-user', JSON.stringify(updatedUser));
    setUser(updatedUser);

    return true;
  };

  const enable2FA = async (): Promise<{ secret: string; qrCode: string }> => {
    const secret = speakeasy.generateSecret({
      name: 'Munitions Quiz - Admin',
      issuer: 'Académie Militaire'
    });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url || '');

    return {
      secret: secret.base32,
      qrCode
    };
  };

  const verify2FA = (token: string): boolean => {
    if (!user || !user.twoFactorSecret) return false;

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    if (verified && !user.twoFactorEnabled) {
      // Enable 2FA
      const updatedUser: User = {
        ...user,
        twoFactorEnabled: true
      };
      localStorage.setItem('agc-admin-user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }

    return verified;
  };

  const disable2FA = () => {
    if (!user) return;

    const updatedUser: User = {
      ...user,
      twoFactorEnabled: false,
      twoFactorSecret: undefined
    };

    localStorage.setItem('agc-admin-user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const logAccess = (username: string, success: boolean) => {
    const log = getAccessLog();
    const entry: AccessLogEntry = {
      timestamp: new Date(),
      username,
      success
    };
    log.push(entry);
    
    // Keep only last 100 entries
    const trimmedLog = log.slice(-100);
    localStorage.setItem('agc-admin-access-log', JSON.stringify(trimmedLog));
  };

  const getAccessLog = (): AccessLogEntry[] => {
    const log = localStorage.getItem('agc-admin-access-log');
    if (!log) return [];
    
    const parsed = JSON.parse(log);
    return parsed.map((entry: any) => ({
      ...entry,
      timestamp: new Date(entry.timestamp)
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        changePassword,
        enable2FA,
        verify2FA,
        disable2FA,
        getAccessLog,
        loginAttempts,
        isLocked
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
