from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any


RawAgentRecord = dict[str, Any]


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
class TaskRunResult:
    log_id: str
    task_name: str
    source_name: str
    status: str
    started_at: str
    finished_at: str
    message: str
    raw_records: list[RawAgentRecord]
    records: list[AgentRecord]

    def to_payload(self) -> dict[str, Any]:
        return {
            "task_name": self.task_name,
            "source_name": self.source_name,
            "status": self.status,
            "started_at": self.started_at,
            "finished_at": self.finished_at,
            "message": self.message,
            "record_count": len(self.records),
            "records": [record.to_dict() for record in self.records],
        }
