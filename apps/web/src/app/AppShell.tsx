import { Avatar, Button, Input, Layout, Menu, Space, Tag, Typography } from 'antd';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

const { Header, Content } = Layout;
const { Text, Title } = Typography;

const navigationItems = [
  { key: '/', label: '首页' },
  { key: '/agents', label: '代理人' },
  { key: '/weapons', label: '音擎' },
  { key: '/drive-discs', label: '驱动盘' },
];

export function AppShell() {
  const location = useLocation();

  return (
    <Layout className="shell">
      <Header className="shell-header">
        <div className="shell-header__brand">
          <div className="shell-logo">ZZZ</div>
          <div>
            <Text className="shell-brand__eyebrow">米游社 · 地区零</Text>
            <Title level={5} className="shell-brand__title">
              绳网情报站
            </Title>
          </div>
        </div>

        <Menu
          mode="horizontal"
          selectedKeys={[navigationItems.find((item) => location.pathname.startsWith(item.key) && item.key !== '/' )?.key ?? (location.pathname === '/' ? '/' : '')]}
          items={navigationItems.map((item) => ({
            key: item.key,
            label: <NavLink to={item.key}>{item.label}</NavLink>,
          }))}
          className="shell-nav"
        />

        <Space size={12} className="shell-header__actions">
          <Input
            placeholder="搜索代理人 / 音擎 / 驱动盘"
            prefix={<span className="shell-inline-icon">⌕</span>}
            className="shell-search"
          />
          <Button type="text" shape="circle" className="shell-icon-button">
            ◉
          </Button>
          <Avatar className="shell-avatar">绳</Avatar>
        </Space>
      </Header>

      <Content className="shell-content">
        <div className="shell-background-mark">NEW ERIDU ARCHIVE</div>
        <div className="shell-floating-tools">
          <Button shape="circle" className="shell-floating-tools__button">
            热
          </Button>
          <Button shape="circle" className="shell-floating-tools__button">
            讯
          </Button>
          <Tag className="shell-floating-tools__tag">导航</Tag>
        </div>
        <Outlet />
      </Content>
    </Layout>
  );
}
