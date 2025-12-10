import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import { AuthProvider } from './contexts/auth';
import { BranchProvider } from './contexts/branch';
import { KioskProvider } from './contexts/kiosk';
import { LoadingProvider } from './contexts/loading';
import { MenuProvider } from './contexts/menu';
import { TagProvider } from './contexts/tags';
import { routes } from './routes';

function App() {
  const router = createBrowserRouter(routes);

  return (
    <AuthProvider>
      <LoadingProvider>
        <BranchProvider>
          <KioskProvider>
            <MenuProvider>
              <TagProvider>
                <RouterProvider router={router} />
              </TagProvider>
            </MenuProvider>
          </KioskProvider>
        </BranchProvider>
      </LoadingProvider>
    </AuthProvider>
  );
}

export default App;
