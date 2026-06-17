from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any


RawCatalogRecord = dict[str, Any]


@dataclass(slots=True)
class IncrementalSyncSummary:
    created: int = 0
    updated: int = 0
    unchanged: int = 0
    failed: int = 0

    @property
    def written_count(self) -> int:
        return self.created + self.updated

    @property
    def total_count(self) -> int:
        return self.created + self.updated + self.unchanged + self.failed

    def to_dict(self) -> dict[str, Any]:
        return {
            "created": self.created,
            "updated": self.updated,
            "unchanged": self.unchanged,
            "failed": self.failed,
            "written_count": self.written_count,
            "total_count": self.total_count,
        }


@dataclass(slots=True)
class AgentRecord:
    id: str
    slug: str
    name: str
    name_en: str
    rarity: str
    element: str
    role: str
    faction: str
    avatar: str
    cover: str
    summary: str
    skill_intro: str
    game_version: str
    released_at: str
    updated_at: str
    source_url: str

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass(slots=True)
class WeaponRecord:
    id: str
    slug: str
    name: str
    rarity: str
    image: str
    base_stat: str
    sub_stat: str
    effect_desc: str
    fit_roles: list[str]
    fit_agents: list[str]
    source_url: str
    updated_at: str

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass(slots=True)
class DriveDiscRecord:
    id: str
    slug: str
    name: str
    image: str
    two_piece_effect: str
    four_piece_effect: str
    fit_agents: list[str]
    fit_scenes: list[str]
    source_url: str
    updated_at: str

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


CatalogRecord = AgentRecord | WeaponRecord | DriveDiscRecord


@dataclass(slots=True)
class TaskRunResult:
    log_id: str
    task_name: str
    source_name: str
    status: str
    started_at: str
    finished_at: str
    message: str
    raw_records: list[RawCatalogRecord]
    records: list[CatalogRecord]
    incremental_summary: IncrementalSyncSummary | None = None

    @property
    def record_count(self) -> int:
        if self.incremental_summary is not None:
            return self.incremental_summary.written_count

        return len(self.records)

    def to_payload(self) -> dict[str, Any]:
        return {
            "task_name": self.task_name,
            "source_name": self.source_name,
            "status": self.status,
            "started_at": self.started_at,
            "finished_at": self.finished_at,
            "message": self.message,
            "record_count": self.record_count,
            "incremental_summary": self.incremental_summary.to_dict()
            if self.incremental_summary is not None
            else None,
            "records": [record.to_dict() for record in self.records],
        }
