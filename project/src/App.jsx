import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import SpacesHome from './pages/SpacesHome';
import SpaceShell from './pages/SpaceShell';
import DocumentsTab from './pages/DocumentsTab';
import ChatTab from './pages/ChatTab';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthPage />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <div className="flex h-screen bg-slate-50">
          <Sidebar />
          <div className="flex-1">
            <SpacesHome />
          </div>
        </div>
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
  return <RouterProvider router={router} />;
}