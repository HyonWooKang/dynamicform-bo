import {
  NavLink,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import { useAuth } from '@/contexts/auth';

type NavItem = {
  path?: string;
  title?: string;
};

type AuthGuardProps = {
  navItems: NavItem[];
};

export default function AuthGuard({ navItems }: AuthGuardProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname ?? '/' }}
      />
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-screen w-full flex-col bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4">
        <h1 className="text-lg font-semibold text-gray-900">
          MEGI Coffee Control Center
        </h1>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="font-medium text-gray-900">{user.displayName}</span>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
          >
            로그아웃
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="flex w-64 flex-col border-r border-gray-200 bg-white px-6 py-10">
          <nav className="flex-1 space-y-1">
            {navItems
              .filter((route) => route.path && route.title)
              .map((route) => (
                <NavLink
                  key={route.path}
                  to={`/${route.path}`}
                  className={({ isActive }) =>
                    [
                      'flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    ].join(' ')
                  }
                  end
                >
                  {route.title}
                </NavLink>
              ))}
          </nav>
        </aside>

        <main className="flex flex-1 flex-col overflow-y-auto bg-gray-50">
          <div className="mx-auto max-w-6xl py-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
