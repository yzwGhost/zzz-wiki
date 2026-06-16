from __future__ import annotations

from datetime import UTC, datetime
from uuid import uuid4

from src.adapters.mhy_zzz_drive_disc_adapter import MhyZzzDriveDiscAdapter
from src.cleaners.drive_disc_cleaner import clean_drive_disc_record
from src.models.records import TaskRunResult


TASK_NAME = "fetch_mhy_drive_discs"


def run_fetch_mhy_drive_discs_task() -> TaskRunResult:
    started_at = datetime.now(UTC)
    adapter = MhyZzzDriveDiscAdapter(sample_size=5)
    raw_records = adapter.fetch()
    records = [clean_drive_disc_record(raw_record) for raw_record in raw_records]
    finished_at = datetime.now(UTC)

    return TaskRunResult(
        log_id=f"sync-{uuid4()}",
        task_name=TASK_NAME,
        source_name=adapter.source_name,
        status="success",
        started_at=started_at.isoformat(),
        finished_at=finished_at.isoformat(),
        message=f"Fetched {len(records)} real drive discs from {adapter.source_name}.",
        raw_records=raw_records,
        records=records,
    )
