import { Navigate, type RouteObject } from 'react-router-dom';

import AuthGuard from '@/layouts/authGuard';
import LoginPage from '@/layouts/login';
import AnalyticsPage from '@/pages/analytics';
import DashboardPage from '@/pages/dashboard';

export type ExtendRouteObject = RouteObject & {
  title?: string;
  children?: ExtendRouteObject[];
};

const protectedChildRoutes: ExtendRouteObject[] = [
  {
    path: 'dashboard',
    element: <DashboardPage />,
    title: '대시보드',
  },
  {
    path: 'analytics',
    element: <AnalyticsPage />,
    title: '통계',
  },
];

export const routes: ExtendRouteObject[] = [
  {
    path: '/login',
    element: <LoginPage />,
    title: '로그인',
  },
  {
    path: '/',
    element: <AuthGuard navItems={protectedChildRoutes} />,
    children: [
      {
        index: true,
        element: <Navigate to="dashboard" replace />,
      },
      ...protectedChildRoutes,
    ],
  },
];
