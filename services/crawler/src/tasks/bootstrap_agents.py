from __future__ import annotations

from datetime import UTC, datetime
from uuid import uuid4

from src.adapters.mock_agent_adapter import MockAgentAdapter
from src.cleaners.agent_cleaner import clean_agent_record
from src.models.records import TaskRunResult


TASK_NAME = "bootstrap_agents"


def run_bootstrap_agents_task() -> TaskRunResult:
    started_at = datetime.now(UTC)
    adapter = MockAgentAdapter()
    raw_records = adapter.fetch()
    records = [clean_agent_record(raw_record) for raw_record in raw_records]
    finished_at = datetime.now(UTC)

    return TaskRunResult(
        log_id=f"sync-{uuid4()}",
        task_name=TASK_NAME,
        source_name=adapter.source_name,
        status="success",
        started_at=started_at.isoformat(),
        finished_at=finished_at.isoformat(),
        message=f"Fetched {len(records)} agents from {adapter.source_name}.",
        raw_records=raw_records,
        records=records,
    )
