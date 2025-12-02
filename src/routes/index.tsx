import { Navigate, Outlet, type RouteObject } from 'react-router-dom';

import AuthGuard from '@/layouts/authGuard';
import LoginPage from '@/layouts/login';
import AnalyticsPage from '@/pages/analytics';
import BranchCreatePage from '@/pages/branch/create';
import BranchDetailPage from '@/pages/branch/detail';
import BranchManagementPage from '@/pages/branch';
import DashboardPage from '@/pages/dashboard';
import MenuDetailPage from '@/pages/menu/detail';
import MenuManagementPage from '@/pages/menu';
import TagSettingsPage from '@/pages/settings/tags';

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
    title: '분석',
  },
  {
    path: 'branch',
    title: '지점관리',
    element: <Outlet />,
    children: [
      {
        index: true,
        element: <BranchManagementPage />,
      },
      {
        path: 'create',
        element: <BranchCreatePage />,
      },
      {
        path: ':branchId',
        element: <BranchDetailPage />,
      },
    ],
  },
  {
    path: 'menu',
    title: '메뉴 관리',
    element: <Outlet />,
    children: [
      {
        index: true,
        element: <MenuManagementPage />,
      },
      {
        path: ':menuId',
        element: <MenuDetailPage />,
      },
    ],
  },
  {
    path: 'settings/tags',
    element: <TagSettingsPage />,
    title: '카테고리 관리',
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
