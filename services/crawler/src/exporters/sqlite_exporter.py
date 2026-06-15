from __future__ import annotations

import json
import sqlite3
from contextlib import closing

from src.exporters.base import Exporter
from src.models.records import TaskRunResult
from src.utils.paths import get_storage_db_path


CREATE_AGENTS_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_en TEXT NOT NULL,
  rarity TEXT NOT NULL,
  element TEXT NOT NULL,
  role TEXT NOT NULL,
  faction TEXT NOT NULL,
  avatar TEXT NOT NULL,
  cover TEXT NOT NULL,
  summary TEXT NOT NULL,
  skill_intro TEXT NOT NULL,
  game_version TEXT NOT NULL,
  released_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  source_url TEXT NOT NULL
);
"""

UPSERT_AGENT_SQL = """
INSERT INTO agents (
  id, slug, name, name_en, rarity, element, role, faction, avatar, cover,
  summary, skill_intro, game_version, released_at, updated_at, source_url
) VALUES (
  :id, :slug, :name, :name_en, :rarity, :element, :role, :faction, :avatar, :cover,
  :summary, :skill_intro, :game_version, :released_at, :updated_at, :source_url
)
ON CONFLICT(slug) DO UPDATE SET
  id=excluded.id,
  name=excluded.name,
  name_en=excluded.name_en,
  rarity=excluded.rarity,
  element=excluded.element,
  role=excluded.role,
  faction=excluded.faction,
  avatar=excluded.avatar,
  cover=excluded.cover,
  summary=excluded.summary,
  skill_intro=excluded.skill_intro,
  game_version=excluded.game_version,
  released_at=excluded.released_at,
  updated_at=excluded.updated_at,
  source_url=excluded.source_url;
"""

CREATE_SYNC_LOGS_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS sync_logs (
  id TEXT PRIMARY KEY,
  task_name TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  message TEXT NOT NULL,
  payload_json TEXT NOT NULL
);
"""

INSERT_SYNC_LOG_SQL = """
INSERT INTO sync_logs (
  id, task_name, status, started_at, finished_at, message, payload_json
) VALUES (?, ?, ?, ?, ?, ?, ?);
"""


class SqliteExporter(Exporter):
    target_name = "sqlite"

    def export(self, result: TaskRunResult) -> str:
        database_path = get_storage_db_path()
        database_path.parent.mkdir(parents=True, exist_ok=True)

        with closing(sqlite3.connect(database_path)) as connection:
            connection.execute(CREATE_AGENTS_TABLE_SQL)
            connection.execute(CREATE_SYNC_LOGS_TABLE_SQL)

            for record in result.records:
                connection.execute(UPSERT_AGENT_SQL, record.to_dict())

            connection.execute(
                INSERT_SYNC_LOG_SQL,
                (
                    result.log_id,
                    result.task_name,
                    result.status,
                    result.started_at,
                    result.finished_at,
                    result.message,
                    json.dumps(result.to_payload(), ensure_ascii=False),
                ),
            )
            connection.commit()

        return str(database_path)
