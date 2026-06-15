import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  List,
  Row,
  Space,
  Statistic,
  Tag,
  Typography,
} from 'antd';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { SectionCard } from '@/components/SectionCard';
import { getCatalogOverview } from '@/services/catalogService';
import { getDesktopAppInfo } from '@/services/desktopBridgeService';
import { runBootstrapAgentsSync } from '@/services/syncService';
import type { CatalogOverview } from '@shared/schemas/catalog';
import type { DesktopAppInfo, RunSyncTaskResult } from '@shared/schemas/desktop';

const { Paragraph, Text, Title } = Typography;

export function HomePage() {
  const [overview, setOverview] = useState<CatalogOverview | null>(null);
  const [appInfo, setAppInfo] = useState<DesktopAppInfo | null>(null);
  const [syncRunning, setSyncRunning] = useState(false);
  const [syncResult, setSyncResult] = useState<RunSyncTaskResult | null>(null);

  useEffect(() => {
    void getCatalogOverview().then(setOverview);
    void getDesktopAppInfo().then(setAppInfo);
  }, []);

  async function handleRunSync() {
    setSyncRunning(true);
    setSyncResult(null);

    try {
      const result = await runBootstrapAgentsSync();
      setSyncResult(result);

      if (result.ok) {
        const nextOverview = await getCatalogOverview();
        setOverview(nextOverview);
      }
    } finally {
      setSyncRunning(false);
    }
  }

  return (
    <div className="page">
      <PageHeader
        title="首页"
        subtitle="以绳网情报站的方式组织攻略资料：左侧主阅读区承载核心条目，右侧情报栏承载更新、活动和维护说明。"
        tags={['阶段三', '基础路由', '页面骨架']}
      />

      <div className="home-grid">
        <div className="home-main">
          <div className="hero-banner panel">
            <div className="hero-banner__copy">
              <Tag className="accent-tag">Wiki · Guide Hub</Tag>
              <Title level={1} className="hero-banner__title">
                绝区零 绳网情报站
              </Title>
              <Paragraph className="hero-banner__text">
                当前先搭建资料站式首页骨架，后续会把角色、音擎、驱动盘、配队与更新中心逐步接入真实数据与数据库链路。
              </Paragraph>
              <Space wrap>
                <Button type="primary">
                  <Link to="/agents">进入代理人图鉴</Link>
                </Button>
                <Button>
                  <Link to="/weapons">查看音擎索引</Link>
                </Button>
              </Space>
            </div>
            <div className="hero-banner__visual">
              <div className="hero-banner__badge">03 / 03</div>
              <div className="hero-banner__frame">角色主视觉区</div>
            </div>
          </div>

          <SectionCard
            title="快捷导航"
            description="保持信息站首页的入口密度，直接跳到核心资料页。"
          >
            <div className="quick-grid">
              {[
                { title: '代理人', path: '/agents' },
                { title: '音擎', path: '/weapons' },
                { title: '驱动盘', path: '/drive-discs' },
                { title: '配队', path: '/agents' },
                { title: '材料', path: '/drive-discs' },
                { title: '更新中心', path: '/' },
              ].map((item) => (
                <Link key={item.title} to={item.path} className="quick-grid__item">
                  <div className="quick-grid__icon">{item.title.slice(0, 1)}</div>
                  <Text>{item.title}</Text>
                </Link>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="资料概览"
            extra={
              <Text className="section-card__meta">
                最近同步：{overview?.last_updated_at ?? '--'}
              </Text>
            }
          >
            <Row gutter={[12, 12]}>
              <Col xs={12} md={8} xl={4}>
                <Statistic title="代理人" value={overview?.counts.agents ?? 0} />
              </Col>
              <Col xs={12} md={8} xl={4}>
                <Statistic title="音擎" value={overview?.counts.weapons ?? 0} />
              </Col>
              <Col xs={12} md={8} xl={4}>
                <Statistic title="驱动盘" value={overview?.counts.drive_discs ?? 0} />
              </Col>
              <Col xs={12} md={8} xl={4}>
                <Statistic title="配队" value={overview?.counts.teams ?? 0} />
              </Col>
              <Col xs={12} md={8} xl={4}>
                <Statistic title="材料" value={overview?.counts.materials ?? 0} />
              </Col>
              <Col xs={12} md={8} xl={4}>
                <Statistic title="版本" value={overview?.current_version ?? '--'} />
              </Col>
            </Row>
          </SectionCard>

          <SectionCard
            title="同步入口"
            description="通过 Electron 主进程受控调用 Python crawler，执行最小同步任务并把结果写回 SQLite。"
            extra={
              <Button
                type="primary"
                loading={syncRunning}
                disabled={appInfo?.bridgeStatus !== 'connected'}
                onClick={() => void handleRunSync()}
              >
                手动同步角色样例
              </Button>
            }
          >
            {appInfo?.bridgeStatus !== 'connected' ? (
              <Alert
                type="warning"
                showIcon
                message="当前不是 Electron 桌面壳环境"
                description="同步入口只能在 Electron 窗口中使用。如果你打开的是浏览器里的 http://127.0.0.1:5173，bridge 会不可用。请从桌面端开发命令启动应用后，在 Electron 窗口里执行同步。"
              />
            ) : syncResult ? (
              <Space direction="vertical" size={12} style={{ display: 'flex' }}>
                <Alert
                  type={syncResult.ok ? 'success' : 'error'}
                  showIcon
                  message={syncResult.ok ? '同步执行成功' : '同步执行失败'}
                  description={
                    syncResult.ok
                      ? `任务 ${syncResult.taskName} 已完成，写入 ${syncResult.recordCount} 条记录。`
                      : syncResult.errorMessage
                  }
                />
                <Descriptions size="small" column={1} bordered>
                  <Descriptions.Item label="任务">{syncResult.taskName}</Descriptions.Item>
                  <Descriptions.Item label="目标">{syncResult.target}</Descriptions.Item>
                  <Descriptions.Item label="结果">
                    {syncResult.ok ? syncResult.status : syncResult.errorCode}
                  </Descriptions.Item>
                  <Descriptions.Item label="输出路径">
                    {syncResult.ok ? syncResult.output : '--'}
                  </Descriptions.Item>
                </Descriptions>
              </Space>
            ) : (
              <Paragraph>
                当前入口会真正触发 Python CLI：`python -m src.cli bootstrap_agents --target
                sqlite`。
              </Paragraph>
            )}
          </SectionCard>

          <SectionCard
            title="更新日志精选"
            extra={<Link to="/agents">全部 →</Link>}
          >
            <div className="update-grid">
              {overview?.featured_agents.map((agent) => (
                <Card key={agent.id} className="update-tile" bordered={false}>
                  <Text className="update-tile__label">{agent.role}</Text>
                  <Title level={5}>{agent.name}</Title>
                  <Paragraph>{agent.summary}</Paragraph>
                  <Text type="secondary">最近更新：{agent.updated_at}</Text>
                </Card>
              ))}
            </div>
          </SectionCard>
        </div>

        <aside className="home-rail">
          <SectionCard title="关于 Wiki" description="参考图中的右侧情报栏结构，放置维护说明与站点简介。">
            <Paragraph>
              当前是本地桌面版攻略站骨架，后续会将爬虫、SQLite 与同步中心逐步接入。
            </Paragraph>
            <Paragraph>
              首页优先承担入口、更新摘要和侧边情报位，不在这一阶段加入复杂内容编辑能力。
            </Paragraph>
          </SectionCard>

          <SectionCard title="更新日志" extra={<Link to="/agents">全部</Link>}>
            <List
              size="small"
              dataSource={overview?.featured_agents ?? []}
              renderItem={(agent) => (
                <List.Item className="rail-list__item">
                  <Space direction="vertical" size={2}>
                    <Text strong>{agent.name}</Text>
                    <Text type="secondary">{agent.summary}</Text>
                  </Space>
                </List.Item>
              )}
            />
          </SectionCard>

          <SectionCard title="热门活动">
            <Button type="primary" block className="rail-action">
              活动日历
            </Button>
            <List
              size="small"
              dataSource={overview?.featured_weapons ?? []}
              renderItem={(weapon) => (
                <List.Item className="rail-list__item">
                  <Text>{weapon.name}</Text>
                </List.Item>
              )}
            />
          </SectionCard>
        </aside>
      </div>
    </div>
  );
}
