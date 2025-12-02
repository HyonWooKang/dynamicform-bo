import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import { AuthProvider } from './contexts/auth';
import { LoadingProvider } from './contexts/loading';
import { MenuProvider } from './contexts/menu';
import { routes } from './routes';

function App() {
  const router = createBrowserRouter(routes);

  return (
    <AuthProvider>
      <LoadingProvider>
        <MenuProvider>
          <RouterProvider router={router} />
        </MenuProvider>
      </LoadingProvider>
    </AuthProvider>
  );
}

export default App;
