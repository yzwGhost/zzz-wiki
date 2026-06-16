import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Empty,
  message,
  Space,
  Steps,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { FeedbackRetryButton, FeedbackStatePanel } from '@/components/FeedbackStatePanel';
import { FeedbackSkeleton } from '@/components/FeedbackSkeleton';
import { PageHeader } from '@/components/PageHeader';
import { SectionCard } from '@/components/SectionCard';
import { getDesktopAppInfo } from '@/services/desktopBridgeService';
import {
  type AsyncStatus,
  createBridgeUnavailableError,
  createReadError,
  createSyncFailureError,
  normalizeError,
  type UserFacingError,
} from '@/lib/feedback';
import {
  getRecentSyncLogs,
  getSyncOverview,
  runBootstrapAgentsSync,
  runRealAgentsSync,
  runRealDriveDiscsSync,
  runRealWeaponsSync,
} from '@/services/syncService';
import { useAppStore } from '@/store/appStore';
import type {
  DesktopAppInfo,
  RunSyncTaskResult,
  SyncLogSummary,
  SyncOverview,
} from '@shared/schemas/desktop';

const { Paragraph, Text } = Typography;

type SyncStage = 'idle' | 'preparing' | 'running' | 'success' | 'failed';
type SyncTaskKey =
  | 'bootstrap_agents'
  | 'fetch_mhy_agents'
  | 'fetch_mhy_weapons'
  | 'fetch_mhy_drive_discs';

function statusTagColor(status: string) {
  if (status === 'success') {
    return 'success';
  }

  if (status === 'failed') {
    return 'error';
  }

  return 'default';
}

function statusLabel(status: string) {
  if (status === 'success') {
    return '成功';
  }

  if (status === 'failed') {
    return '失败';
  }

  if (status === 'running') {
    return '运行中';
  }

  return '待命';
}

function syncTaskLabel(taskName: string) {
  if (taskName === 'fetch_mhy_agents') {
    return '真实角色样本';
  }

  if (taskName === 'fetch_mhy_weapons') {
    return '真实音擎样本';
  }

  if (taskName === 'fetch_mhy_drive_discs') {
    return '真实驱动盘样本';
  }

  if (taskName === 'bootstrap_agents') {
    return '本地样例';
  }

  return taskName;
}

function toSyncStage(
  syncRunning: boolean,
  syncResult: RunSyncTaskResult | null,
  latestStatus: string | null,
): SyncStage {
  if (syncRunning && !syncResult) {
    return 'running';
  }

  if (syncResult?.ok) {
    return 'success';
  }

  if (syncResult && !syncResult.ok) {
    return 'failed';
  }

  if (latestStatus === 'success') {
    return 'success';
  }

  if (latestStatus === 'failed') {
    return 'failed';
  }

  return 'idle';
}

function stageIndex(stage: SyncStage): number {
  if (stage === 'idle') {
    return 0;
  }

  if (stage === 'preparing') {
    return 1;
  }

  if (stage === 'running') {
    return 2;
  }

  return 3;
}

function stageStatus(stage: SyncStage): 'wait' | 'process' | 'finish' | 'error' {
  if (stage === 'failed') {
    return 'error';
  }

  if (stage === 'idle') {
    return 'wait';
  }

  if (stage === 'preparing' || stage === 'running') {
    return 'process';
  }

  return 'finish';
}

const columns: ColumnsType<SyncLogSummary> = [
  {
    title: '任务',
    dataIndex: 'taskName',
    key: 'taskName',
    width: 160,
    render: (taskName: string) => syncTaskLabel(taskName),
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    render: (status: string) => <Tag color={statusTagColor(status)}>{statusLabel(status)}</Tag>,
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
  const [pageStatus, setPageStatus] = useState<AsyncStatus>('loading');
  const [pageError, setPageError] = useState<UserFacingError | null>(null);
  const [activeSyncTask, setActiveSyncTask] =
    useState<SyncTaskKey>('fetch_mhy_drive_discs');
  const [syncRunning, setSyncRunning] = useState(false);
  const [syncResult, setSyncResult] = useState<RunSyncTaskResult | null>(null);
  const [syncStage, setSyncStage] = useState<SyncStage>('idle');

  useEffect(() => {
    setActiveSection('sync-center');
  }, [setActiveSection]);

  async function loadSyncData() {
    setPageStatus('loading');
    setPageError(null);

    try {
      const [nextAppInfo, nextOverview, nextLogs] = await Promise.all([
        getDesktopAppInfo(),
        getSyncOverview(),
        getRecentSyncLogs(10),
      ]);

      setAppInfo(nextAppInfo);
      setOverview(nextOverview);
      setLogs(nextLogs);
      setPageStatus('success');
    } catch (nextError) {
      setPageError(normalizeError(nextError, createReadError('同步中心')));
      setPageStatus('error');
    }
  }

  useEffect(() => {
    void loadSyncData();
  }, []);

  async function handleRunSync() {
    setSyncStage('preparing');
    setSyncRunning(true);
    setSyncResult(null);

    try {
      setSyncStage('running');
      const result =
        activeSyncTask === 'fetch_mhy_agents'
          ? await runRealAgentsSync()
          : activeSyncTask === 'fetch_mhy_weapons'
            ? await runRealWeaponsSync()
            : activeSyncTask === 'fetch_mhy_drive_discs'
              ? await runRealDriveDiscsSync()
              : await runBootstrapAgentsSync();

      setSyncResult(result);
      setSyncStage(result.ok ? 'success' : 'failed');

      if (result.ok) {
        void message.success(`同步完成，已写入 ${result.recordCount} 条记录。`);
      } else {
        const syncError = createSyncFailureError(result);
        void message.error(syncError.title);
      }

      await loadSyncData();
    } finally {
      setSyncRunning(false);
    }
  }

  const latestLog = overview?.latestLog ?? null;
  const bridgeConnected = appInfo?.bridgeStatus === 'connected';
  const currentStage =
    syncRunning || syncStage === 'preparing'
      ? syncStage
      : toSyncStage(false, syncResult, latestLog?.status ?? null);

  return (
    <div className="page">
      <PageHeader
        title="同步中心"
        subtitle="集中查看最近同步状态、历史日志和手动同步入口。当前保持单任务、手动触发的管理模式，不引入复杂调度。"
        tags={['工具管理', 'SQLite 日志', '手动同步']}
      />

      <SectionCard
        title="同步总览"
        description="这里展示最新一次同步状态，以及后续失败重试和增量同步的扩展位。"
        extra={
          <Space wrap>
            <Button
              type={activeSyncTask === 'fetch_mhy_drive_discs' ? 'primary' : 'default'}
              disabled={syncRunning}
              onClick={() => setActiveSyncTask('fetch_mhy_drive_discs')}
            >
              真实驱动盘样本
            </Button>
            <Button
              type={activeSyncTask === 'fetch_mhy_weapons' ? 'primary' : 'default'}
              disabled={syncRunning}
              onClick={() => setActiveSyncTask('fetch_mhy_weapons')}
            >
              真实音擎样本
            </Button>
            <Button
              type={activeSyncTask === 'fetch_mhy_agents' ? 'primary' : 'default'}
              disabled={syncRunning}
              onClick={() => setActiveSyncTask('fetch_mhy_agents')}
            >
              真实角色样本
            </Button>
            <Button
              type={activeSyncTask === 'bootstrap_agents' ? 'primary' : 'default'}
              disabled={syncRunning}
              onClick={() => setActiveSyncTask('bootstrap_agents')}
            >
              本地样例数据
            </Button>
            <Button
              type="primary"
              loading={syncRunning}
              disabled={!bridgeConnected}
              onClick={() => void handleRunSync()}
            >
              {syncRunning
                ? `正在执行 ${syncTaskLabel(activeSyncTask)}`
                : `执行${syncTaskLabel(activeSyncTask)}同步`}
            </Button>
            <Button disabled>失败重试（预留）</Button>
            <Button disabled>增量同步（预留）</Button>
          </Space>
        }
      >
        {pageStatus === 'loading' ? <FeedbackSkeleton variant="sync" /> : null}

        {pageStatus === 'error' && pageError ? (
          <FeedbackStatePanel
            tone="error"
            title={pageError.title}
            description={pageError.description}
            action={<FeedbackRetryButton onClick={() => void loadSyncData()} />}
          />
        ) : null}

        {pageStatus === 'success' ? (
          <>
            <div className="sync-summary-grid">
              <Card bordered={false} className="panel sync-summary-card">
                <Text className="sync-summary-card__label">当前任务</Text>
                <Text className="sync-summary-card__value">
                  {syncTaskLabel(activeSyncTask)}同步
                </Text>
              </Card>
              <Card bordered={false} className="panel sync-summary-card">
                <Text className="sync-summary-card__label">最近状态</Text>
                <Tag color={statusTagColor(latestLog?.status ?? 'idle')} className="sync-summary-card__tag">
                  {statusLabel(latestLog?.status ?? 'idle')}
                </Tag>
              </Card>
              <Card bordered={false} className="panel sync-summary-card">
                <Text className="sync-summary-card__label">日志数量</Text>
                <Text className="sync-summary-card__value">{logs.length} 条</Text>
              </Card>
            </div>

            <Card bordered={false} className="panel sync-stage-card">
              <Text className="sync-summary-card__label">执行阶段</Text>
              <Steps
                current={stageIndex(currentStage)}
                status={stageStatus(currentStage)}
                size="small"
                items={[
                  { title: '待命', description: '未执行任务' },
                  { title: '准备', description: '准备发起任务' },
                  { title: '执行中', description: '等待 Python / SQLite 完成' },
                  {
                    title: currentStage === 'failed' ? '失败' : '完成',
                    description: currentStage === 'failed' ? '任务执行失败' : '任务已返回结果',
                  },
                ]}
              />
            </Card>

            {!bridgeConnected ? (
              <Alert
                type="warning"
                showIcon
                message={createBridgeUnavailableError().title}
                description={createBridgeUnavailableError().description}
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
                    : createSyncFailureError(syncResult).description
                }
              />
            ) : null}

            <Descriptions bordered size="small" column={2} style={{ marginTop: 16 }}>
              <Descriptions.Item label="最近任务">
                {latestLog?.taskName ? syncTaskLabel(latestLog.taskName) : '--'}
              </Descriptions.Item>
              <Descriptions.Item label="最近状态">
                {latestLog ? (
                  <Tag color={statusTagColor(latestLog.status)}>{statusLabel(latestLog.status)}</Tag>
                ) : (
                  '--'
                )}
              </Descriptions.Item>
              <Descriptions.Item label="开始时间">{latestLog?.startedAt ?? '--'}</Descriptions.Item>
              <Descriptions.Item label="结束时间">{latestLog?.finishedAt ?? '--'}</Descriptions.Item>
              <Descriptions.Item label="输出目标">{latestLog?.target ?? '--'}</Descriptions.Item>
              <Descriptions.Item label="输出路径">{latestLog?.output ?? '--'}</Descriptions.Item>
              <Descriptions.Item label="记录数">{latestLog?.recordCount ?? '--'}</Descriptions.Item>
              <Descriptions.Item label="错误码">{latestLog?.errorCode ?? '--'}</Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 16 }}>
              <Text type="secondary">
                当前可用任务：
                {overview?.availableTasks
                  .map((task) => `${syncTaskLabel(task.taskName)} (${task.targets.join(' / ')})`)
                  .join('，') ?? '--'}
              </Text>
            </div>
          </>
        ) : null}
      </SectionCard>

      <SectionCard
        title="最近日志"
        description="日志字段保持与 SQLite `sync_logs` 兼容，页面按任务、状态、时间和结果摘要展示。"
      >
        {pageStatus === 'loading' ? <FeedbackSkeleton variant="sync" /> : null}
        {pageStatus === 'success' && logs.length ? (
          <Table<SyncLogSummary>
            rowKey="id"
            columns={columns}
            dataSource={logs}
            pagination={false}
            expandable={{
              expandedRowRender: (record) => (
                <div className="sync-log-details">
                  <Descriptions bordered size="small" column={2}>
                    <Descriptions.Item label="来源任务">{record.sourceName ?? '--'}</Descriptions.Item>
                    <Descriptions.Item label="错误码">{record.errorCode ?? '--'}</Descriptions.Item>
                    <Descriptions.Item label="输出路径">{record.output ?? '--'}</Descriptions.Item>
                    <Descriptions.Item label="记录数">{record.recordCount ?? '--'}</Descriptions.Item>
                    <Descriptions.Item label="退出码">{record.exitCode ?? '--'}</Descriptions.Item>
                    <Descriptions.Item label="目标">{record.target ?? '--'}</Descriptions.Item>
                  </Descriptions>
                  <div className="sync-log-details__streams">
                    <div className="sync-log-details__stream">
                      <Text className="sync-summary-card__label">STDOUT</Text>
                      <pre>{record.stdout?.trim() || '无输出'}</pre>
                    </div>
                    <div className="sync-log-details__stream">
                      <Text className="sync-summary-card__label">STDERR</Text>
                      <pre>{record.stderr?.trim() || '无输出'}</pre>
                    </div>
                  </div>
                </div>
              ),
              rowExpandable: (record) =>
                Boolean(
                  record.stdout?.trim() ||
                    record.stderr?.trim() ||
                    record.errorCode ||
                    record.output ||
                    record.sourceName,
                ),
            }}
            rowClassName={(record) => `sync-log-row sync-log-row--${record.status}`}
            scroll={{ x: 1100 }}
          />
        ) : null}
        {pageStatus === 'success' && !logs.length ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂时没有同步日志，先执行一次手动同步。"
          />
        ) : null}
      </SectionCard>

      <SectionCard
        title="扩展位"
        description="保留后续失败重试、增量同步和多任务管理所需的位置，但这一阶段不实现复杂调度。"
      >
        <Space direction="vertical" size={8} style={{ display: 'flex' }}>
          <Paragraph>失败重试：后续可基于最近失败日志直接回填任务参数，一键重跑。</Paragraph>
          <Paragraph>增量同步：后续可在 Python adapter 内基于源站时间戳或 hash 增量抓取。</Paragraph>
          <Paragraph>多任务队列：后续可增加任务列表、运行中状态和更细粒度日志详情。</Paragraph>
        </Space>
      </SectionCard>
    </div>
  );
}
