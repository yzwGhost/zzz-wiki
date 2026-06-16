import { Avatar, Badge, Button, Input, Layout, Menu, Space, Tag, Typography } from 'antd';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useFavoriteStore } from '@/store/favoriteStore';
import shellLogoMark from '../../assets/logo.png';

const { Header, Content } = Layout;
const { Text, Title } = Typography;

const navigationItems = [
  { key: '/', label: '首页' },
  { key: '/agents', label: '代理人' },
  { key: '/weapons', label: '音擎' },
  { key: '/drive-discs', label: '驱动盘' },
  { key: '/sync-center', label: '同步中心' },
];

const shellSectionMeta = {
  home: {
    title: '首页',
    description: '本地资料总览与最近更新',
    status: 'MVP 资料站',
  },
  agents: {
    title: '代理人',
    description: '角色资料浏览与基础筛选',
    status: '搜索 / 筛选',
  },
  weapons: {
    title: '音擎',
    description: '基础效果索引与适配角色',
    status: '资料索引',
  },
  'drive-discs': {
    title: '驱动盘',
    description: '套装效果与适用场景速查',
    status: '套装推荐',
  },
  'sync-center': {
    title: '同步中心',
    description: '同步状态、日志与手动执行入口',
    status: '工具管理',
  },
} as const;

function resolveSectionKey(pathname: string): keyof typeof shellSectionMeta {
  if (pathname.startsWith('/agents')) {
    return 'agents';
  }

  if (pathname.startsWith('/weapons')) {
    return 'weapons';
  }

  if (pathname.startsWith('/drive-discs')) {
    return 'drive-discs';
  }

  if (pathname.startsWith('/sync-center')) {
    return 'sync-center';
  }

  return 'home';
}

export function AppShell() {
  const location = useLocation();
  const favoriteCount = useFavoriteStore((state) => Object.keys(state.favorites).length);
  const activeSection = resolveSectionKey(location.pathname);
  const sectionMeta = shellSectionMeta[activeSection];
  const selectedNavKey =
    navigationItems.find((item) => location.pathname.startsWith(item.key) && item.key !== '/')?.key ??
    (location.pathname === '/' ? '/' : '');

  return (
    <Layout className="shell">
      <Header className="shell-header">
        <div className="shell-header__brand">
          <div className="shell-logo">
            <img src={shellLogoMark} alt="绳网情报站图标" className="shell-logo__image" />
          </div>
          <div className="shell-brand__copy">
            <Title level={5} className="shell-brand__title">
              绳网情报站
            </Title>
          </div>
        </div>

        <Menu
          mode="horizontal"
          selectedKeys={[selectedNavKey]}
          items={navigationItems.map((item) => ({
            key: item.key,
            label: <NavLink to={item.key}>{item.label}</NavLink>,
          }))}
          className="shell-nav"
        />

        <Space size={12} className="shell-header__actions">
          <Input
            placeholder="搜索资料库"
            prefix={<span className="shell-inline-icon">⌕</span>}
            className="shell-search"
          />
          <Badge count={favoriteCount} size="small">
            <Button type="text" shape="circle" className="shell-icon-button">
              ★
            </Button>
          </Badge>
          <Avatar className="shell-avatar">绳</Avatar>
        </Space>
      </Header>

      <div className="shell-context-bar">
        <div className="shell-context-bar__main">
          <Text className="shell-context-bar__title">{sectionMeta.title}</Text>
          <Text className="shell-context-bar__description">{sectionMeta.description}</Text>
        </div>
        <Tag className="shell-context-bar__status">{sectionMeta.status}</Tag>
      </div>

      <Content className="shell-content">
        <div className="shell-background-mark">NEW ERIDU ARCHIVE</div>
        <Outlet />
      </Content>
    </Layout>
  );
}
