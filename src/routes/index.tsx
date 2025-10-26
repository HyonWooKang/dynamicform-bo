import type { RouteObject } from 'react-router-dom';

import LoginPage from '@/layouts/login';

export type ExtendRouteObject = RouteObject & {
  title?: string;
  children?: ExtendRouteObject[];
};

export const routes: ExtendRouteObject[] = [
  {
    path: '/',
    // element: <AuthLayout />,
    element: <LoginPage />,
    title: '로그인',
  },
];
