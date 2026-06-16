import { Button, Space } from 'antd';
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { FeedbackStatePanel } from '@/components/FeedbackStatePanel';

export function RouteErrorPage() {
  const error = useRouteError();

  const description = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : '路由切换过程中发生未处理异常，请返回安全页面后重试。';

  return (
    <div className="page app-error-shell">
      <FeedbackStatePanel
        tone="error"
        title="页面路由异常"
        description={description}
        action={
          <Space wrap>
            <Button type="primary" onClick={() => (window.location.hash = '#/')}>
              返回首页
            </Button>
            <Button onClick={() => window.location.reload()}>
              刷新页面
            </Button>
          </Space>
        }
      />
    </div>
  );
}
