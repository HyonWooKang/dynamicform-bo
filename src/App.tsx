import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import { LoadingProvider } from './contexts/loading';
import { routes } from './routes';

function App() {
  const router = createBrowserRouter(routes);

  return (
    <LoadingProvider>
      <RouterProvider router={router} />
    </LoadingProvider>
  );
}

export default App;
