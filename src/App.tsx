import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import { AuthProvider } from './contexts/auth';
import { LoadingProvider } from './contexts/loading';
import { routes } from './routes';

function App() {
  const router = createBrowserRouter(routes);

  return (
    <AuthProvider>
      <LoadingProvider>
        <RouterProvider router={router} />
      </LoadingProvider>
    </AuthProvider>
  );
}

export default App;
