import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Descriptions,
  Empty,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader } from '@/components/PageHeader';
import { SectionCard } from '@/components/SectionCard';
import { getDesktopAppInfo } from '@/services/desktopBridgeService';
import {
  getRecentSyncLogs,
  getSyncOverview,
  runBootstrapAgentsSync,
} from '@/services/syncService';
import { useAppStore } from '@/store/appStore';
import type {
  DesktopAppInfo,
  RunSyncTaskResult,
  SyncLogSummary,
  SyncOverview,
} from '@shared/schemas/desktop';

const { Paragraph, Text } = Typography;

function statusTagColor(status: string) {
  if (status === 'success') {
    return 'success';
  }

  if (status === 'failed') {
    return 'error';
  }

  return 'default';
}

const columns: ColumnsType<SyncLogSummary> = [
  {
    title: '任务',
    dataIndex: 'taskName',
    key: 'taskName',
    width: 160,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    render: (status: string) => <Tag color={statusTagColor(status)}>{status}</Tag>,
  },
  {
    title: '目标',
    dataIndex: 'target',
    key: 'target',
    width: 100,
    render: (target: string | null) => target ?? '--',
  },
  {
    title: '开始时间',
    dataIndex: 'startedAt',
    key: 'startedAt',
    width: 220,
  },
  {
    title: '结束时间',
    dataIndex: 'finishedAt',
    key: 'finishedAt',
    width: 220,
    render: (finishedAt: string | null) => finishedAt ?? '--',
  },
  {
    title: '记录数',
    dataIndex: 'recordCount',
    key: 'recordCount',
    width: 90,
    render: (recordCount: number | null) => recordCount ?? '--',
  },
  {
    title: '说明',
    dataIndex: 'message',
    key: 'message',
  },
];

export function SyncCenterPage() {
  const setActiveSection = useAppStore((state) => state.setActiveSection);
  const [appInfo, setAppInfo] = useState<DesktopAppInfo | null>(null);
  const [overview, setOverview] = useState<SyncOverview | null>(null);
  const [logs, setLogs] = useState<SyncLogSummary[]>([]);
  const [syncRunning, setSyncRunning] = useState(false);
  const [syncResult, setSyncResult] = useState<RunSyncTaskResult | null>(null);

  useEffect(() => {
    setActiveSection('sync-center');
  }, [setActiveSection]);

  async function loadSyncData() {
    const [nextAppInfo, nextOverview, nextLogs] = await Promise.all([
      getDesktopAppInfo(),
      getSyncOverview(),
      getRecentSyncLogs(10),
    ]);

    setAppInfo(nextAppInfo);
    setOverview(nextOverview);
    setLogs(nextLogs);
  }

  useEffect(() => {
    void loadSyncData();
  }, []);

  async function handleRunSync() {
    setSyncRunning(true);
    setSyncResult(null);

    try {
      const result = await runBootstrapAgentsSync();
      setSyncResult(result);
      await loadSyncData();
    } finally {
      setSyncRunning(false);
    }
  }

  const latestLog = overview?.latestLog ?? null;
  const bridgeConnected = appInfo?.bridgeStatus === 'connected';

  return (
    <div className="page">
      <PageHeader
        title="同步中心"
        subtitle="集中查看最近同步状态、历史日志和手动同步入口。当前仍保持单任务、手动触发的管理模式，不引入复杂调度。"
        tags={['工具管理', 'SQLite 日志', '手动同步']}
      />

      <SectionCard
        title="同步总览"
        description="这里展示最新一次同步状态，以及后续失败重试和增量同步的扩展位。"
        extra={
          <Space wrap>
            <Button
              type="primary"
              loading={syncRunning}
              disabled={!bridgeConnected}
              onClick={() => void handleRunSync()}
            >
              手动同步角色样例
            </Button>
            <Button disabled>失败重试（预留）</Button>
            <Button disabled>增量同步（预留）</Button>
          </Space>
        }
      >
        {!bridgeConnected ? (
          <Alert
            type="warning"
            showIcon
            message="当前不是 Electron 桌面壳环境"
            description="同步中心需要通过 preload 和主进程访问本地 SQLite 与 Python 任务。请在 Electron 窗口中使用。"
          />
        ) : null}

        {syncResult ? (
          <Alert
            style={{ marginTop: bridgeConnected ? 0 : 12 }}
            type={syncResult.ok ? 'success' : 'error'}
            showIcon
            message={syncResult.ok ? '同步执行成功' : '同步执行失败'}
            description={
              syncResult.ok
                ? `任务 ${syncResult.taskName} 已完成，写入 ${syncResult.recordCount} 条记录。`
                : `${syncResult.errorCode}: ${syncResult.errorMessage}`
            }
          />
        ) : null}

        <Descriptions bordered size="small" column={2} style={{ marginTop: 16 }}>
          <Descriptions.Item label="最近任务">
            {latestLog?.taskName ?? '--'}
          </Descriptions.Item>
          <Descriptions.Item label="最近状态">
            {latestLog ? <Tag color={statusTagColor(latestLog.status)}>{latestLog.status}</Tag> : '--'}
          </Descriptions.Item>
          <Descriptions.Item label="开始时间">
            {latestLog?.startedAt ?? '--'}
          </Descriptions.Item>
          <Descriptions.Item label="结束时间">
            {latestLog?.finishedAt ?? '--'}
          </Descriptions.Item>
          <Descriptions.Item label="输出目标">
            {latestLog?.target ?? '--'}
          </Descriptions.Item>
          <Descriptions.Item label="输出路径">
            {latestLog?.output ?? '--'}
          </Descriptions.Item>
          <Descriptions.Item label="记录数">
            {latestLog?.recordCount ?? '--'}
          </Descriptions.Item>
          <Descriptions.Item label="错误码">
            {latestLog?.errorCode ?? '--'}
          </Descriptions.Item>
        </Descriptions>

        <div style={{ marginTop: 16 }}>
          <Text type="secondary">
            当前可用任务：
            {overview?.availableTasks.map((task) => `${task.label} (${task.targets.join(' / ')})`).join('，') ??
              '--'}
          </Text>
        </div>
      </SectionCard>

      <SectionCard
        title="最近日志"
        description="日志字段保持与 SQLite `sync_logs` 兼容，页面按任务、状态、时间和结果摘要展示。"
      >
        {logs.length ? (
          <Table<SyncLogSummary>
            rowKey="id"
            columns={columns}
            dataSource={logs}
            pagination={false}
            scroll={{ x: 1100 }}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂时没有同步日志，先执行一次手动同步。"
          />
        )}
      </SectionCard>

      <SectionCard
        title="扩展位"
        description="保留后续失败重试、增量同步和多任务管理所需的位置，但这一阶段不实现复杂调度。"
      >
        <Space direction="vertical" size={8} style={{ display: 'flex' }}>
          <Paragraph>
            失败重试：后续可基于最近失败日志直接回填任务参数，一键重跑。
          </Paragraph>
          <Paragraph>
            增量同步：后续可在 Python adapter 内基于源站时间戳或 hash 增量抓取。
          </Paragraph>
          <Paragraph>
            多任务队列：后续可增加任务列表、运行中状态和更细粒度日志详情。
          </Paragraph>
        </Space>
      </SectionCard>
    </div>
  );
}
