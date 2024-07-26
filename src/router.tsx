import { invoke } from '@tauri-apps/api';
import { createBrowserRouter } from 'react-router-dom';
import HomeRoute from './routes/home/HomeRoute';
import AddAssetRoute from './routes/add-asset/AddAssetRoute';
import RootRoute from './routes/root/RootRoute';
import ListAssetsRoute from './routes/list-assets/ListAssetsRoute';
import AssetRoute from './routes/asset/AssetRoute';
import RouteError from './components/RouteError';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRoute />,
    errorElement: <RouteError />,
    children: [
      {
        path: '',
        element: <HomeRoute />
      },
      {
        path: 'add-asset',
        element: <AddAssetRoute />
      },
      {
        path: 'list-assets',
        element: <ListAssetsRoute />
      },
      {
        path: 'asset/:assetUuid',
        element: <AssetRoute />,
        loader: async ({ params: { assetUuid }}) => {
          if( !assetUuid ) throw new Error("Unable to load asset, asset ID is undefined");
          const asset = await invoke('get_asset', {
            uuid: assetUuid
          });
          return {
            asset
          }
        },
        errorElement: <RouteError />
      }
    ]
  }
])