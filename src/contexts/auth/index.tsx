import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

type AllowedAccount = {
  username: string;
  password: string;
  displayName?: string;
};

type User = {
  username: string;
  displayName: string;
};

type AuthContextValue = {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const allowedAccounts: AllowedAccount[] = [
  {
    username: 'benzenes',
    password: 'benzenes1!',
  },
  {
    username: 'admin',
    password: '123',
  },
];

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (username: string, password: string) => {
    const trimmedUsername = username.trim();
    await new Promise((resolve) => setTimeout(resolve, 400));

    const account = allowedAccounts.find(
      (allowedAccount) => allowedAccount.username === trimmedUsername,
    );

    if (!account || account.password !== password) {
      throw new Error('INVALID_CREDENTIALS');
    }

    setUser({
      username: account.username,
      displayName: account.displayName ?? account.username,
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
    }),
    [login, logout, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
