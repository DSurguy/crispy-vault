import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomeRoute from './routes/home/HomeRoute';
import AddAssetRoute from './routes/add-asset/AddAssetRoute';
import RootRoute from './routes/root/RootRoute';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRoute />,
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
