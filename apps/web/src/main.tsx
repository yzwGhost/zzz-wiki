import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { RouterProvider } from 'react-router-dom';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import { router } from './routes';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#f6db2f',
          colorBgBase: '#070707',
          colorTextBase: '#f5f5f5',
          colorBorder: '#2b2b2b',
          borderRadius: 18,
          fontFamily: '"Bahnschrift", "Segoe UI", "PingFang SC", sans-serif',
        },
      }}
    >
      <AppErrorBoundary>
        <RouterProvider router={router} />
      </AppErrorBoundary>
    </ConfigProvider>
  </React.StrictMode>,
);
