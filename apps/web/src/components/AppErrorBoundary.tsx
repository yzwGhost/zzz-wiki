import React from 'react';
import { Button, Space, Typography } from 'antd';
import { FeedbackStatePanel } from '@/components/FeedbackStatePanel';

const { Text } = Typography;

interface AppErrorBoundaryState {
  hasError: boolean;
  errorMessage: string | null;
}

export class AppErrorBoundary extends React.Component<React.PropsWithChildren, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false,
    errorMessage: null,
  };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Unhandled renderer error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-error-shell">
          <FeedbackStatePanel
            tone="error"
            title="页面出现异常"
            description={this.state.errorMessage ?? '渲染层发生未处理错误，请刷新页面后重试。'}
            action={
              <Space wrap>
                <Button type="primary" onClick={() => window.location.reload()}>
                  刷新页面
                </Button>
                <Button onClick={() => (window.location.hash = '#/')}>
                  返回首页
                </Button>
              </Space>
            }
          />
          <Text type="secondary">如果问题持续存在，请重新打开 Electron 窗口或检查最近同步日志。</Text>
        </div>
      );
    }

    return this.props.children;
  }
}
