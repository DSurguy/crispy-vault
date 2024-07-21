import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import HomeRoute from './routes/home/HomeRoute';
import AddAssetRoute from './routes/add-asset/AddAssetRoute';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Outlet />,
    children: [
      {
        path: '',
        element: <HomeRoute />
      },
      {
        path: 'add-asset',
        element: <AddAssetRoute />
      }
    ]
  }
])

export default function App() {
  return <RouterProvider router={router} />;
}
