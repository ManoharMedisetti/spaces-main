import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import SpacesHome from './pages/SpacesHome';
import SpaceShell from './pages/SpaceShell';
import DocumentsTab from './pages/DocumentsTab';
import ChatTab from './pages/ChatTab';
import ProtectedRoute from './components/ProtectedRoute';
import ThemeProvider from './components/ThemeProvider';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthPage />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <SpacesHome />
      </ProtectedRoute>
    ),
  },
  {
    path: '/space/:id',
    element: (
      <ProtectedRoute>
        <SpaceShell />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'docs',
        element: <DocumentsTab />,
      },
      {
        path: 'chat',
        element: <ChatTab />,
      },
    ],
  },
]);

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}