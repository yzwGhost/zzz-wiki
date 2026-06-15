import { createHashRouter } from 'react-router-dom';
import { AppShell } from '@/app/AppShell';
import { AgentDetailPage } from '@/pages/AgentDetailPage';
import { AgentsPage } from '@/pages/AgentsPage';
import { DriveDiscDetailPage } from '@/pages/DriveDiscDetailPage';
import { DriveDiscsPage } from '@/pages/DriveDiscsPage';
import { HomePage } from '@/pages/HomePage';
import { WeaponDetailPage } from '@/pages/WeaponDetailPage';
import { WeaponsPage } from '@/pages/WeaponsPage';

export const router = createHashRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'agents',
        element: <AgentsPage />,
      },
      {
        path: 'agents/:slug',
        element: <AgentDetailPage />,
      },
      {
        path: 'weapons',
        element: <WeaponsPage />,
      },
      {
        path: 'weapons/:slug',
        element: <WeaponDetailPage />,
      },
      {
        path: 'drive-discs',
        element: <DriveDiscsPage />,
      },
      {
        path: 'drive-discs/:slug',
        element: <DriveDiscDetailPage />,
      },
    ],
  },
]);
