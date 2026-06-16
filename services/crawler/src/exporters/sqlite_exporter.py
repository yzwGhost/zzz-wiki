from __future__ import annotations

import json
import sqlite3
from contextlib import closing

from src.exporters.base import Exporter
from src.models.records import AgentRecord, DriveDiscRecord, TaskRunResult, WeaponRecord
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

CREATE_WEAPONS_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS weapons (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  rarity TEXT NOT NULL,
  image TEXT NOT NULL,
  base_stat TEXT NOT NULL,
  sub_stat TEXT NOT NULL,
  effect_desc TEXT NOT NULL,
  fit_roles_json TEXT NOT NULL,
  fit_agents_json TEXT NOT NULL,
  source_url TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
"""

CREATE_DRIVE_DISCS_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS drive_discs (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  image TEXT NOT NULL DEFAULT '',
  two_piece_effect TEXT NOT NULL,
  four_piece_effect TEXT NOT NULL,
  fit_agents_json TEXT NOT NULL,
  fit_scenes_json TEXT NOT NULL,
  source_url TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
"""

UPSERT_WEAPON_SQL = """
INSERT INTO weapons (
  id, slug, name, rarity, image, base_stat, sub_stat, effect_desc,
  fit_roles_json, fit_agents_json, source_url, updated_at
) VALUES (
  :id, :slug, :name, :rarity, :image, :base_stat, :sub_stat, :effect_desc,
  :fit_roles_json, :fit_agents_json, :source_url, :updated_at
)
ON CONFLICT(slug) DO UPDATE SET
  id=excluded.id,
  name=excluded.name,
  rarity=excluded.rarity,
  image=excluded.image,
  base_stat=excluded.base_stat,
  sub_stat=excluded.sub_stat,
  effect_desc=excluded.effect_desc,
  fit_roles_json=excluded.fit_roles_json,
  fit_agents_json=excluded.fit_agents_json,
  source_url=excluded.source_url,
  updated_at=excluded.updated_at;
"""

UPSERT_DRIVE_DISC_SQL = """
INSERT INTO drive_discs (
  id, slug, name, image, two_piece_effect, four_piece_effect,
  fit_agents_json, fit_scenes_json, source_url, updated_at
) VALUES (
  :id, :slug, :name, :image, :two_piece_effect, :four_piece_effect,
  :fit_agents_json, :fit_scenes_json, :source_url, :updated_at
)
ON CONFLICT(slug) DO UPDATE SET
  id=excluded.id,
  name=excluded.name,
  image=excluded.image,
  two_piece_effect=excluded.two_piece_effect,
  four_piece_effect=excluded.four_piece_effect,
  fit_agents_json=excluded.fit_agents_json,
  fit_scenes_json=excluded.fit_scenes_json,
  source_url=excluded.source_url,
  updated_at=excluded.updated_at;
"""

INSERT_SYNC_LOG_SQL = """
INSERT INTO sync_logs (
  id, task_name, status, started_at, finished_at, message, payload_json
) VALUES (?, ?, ?, ?, ?, ?, ?);
"""

DELETE_MOCK_WEAPONS_SQL = """
DELETE FROM weapons WHERE source_url LIKE 'https://example.com/weapons/%';
"""

DELETE_MOCK_AGENTS_SQL = """
DELETE FROM agents WHERE source_url LIKE 'https://example.com/agents/%';
"""

DELETE_MOCK_DRIVE_DISCS_SQL = """
DELETE FROM drive_discs
WHERE source_url LIKE 'https://example.com/drive-discs/%' OR source_url = '';
"""


def ensure_weapon_image_column(connection: sqlite3.Connection) -> None:
    columns = connection.execute("PRAGMA table_info(weapons);").fetchall()
    has_image_column = any(column[1] == "image" for column in columns)

    if not has_image_column:
        connection.execute(
            "ALTER TABLE weapons ADD COLUMN image TEXT NOT NULL DEFAULT '';"
        )


def ensure_drive_disc_source_url_column(connection: sqlite3.Connection) -> None:
    columns = connection.execute("PRAGMA table_info(drive_discs);").fetchall()
    has_source_url_column = any(column[1] == "source_url" for column in columns)

    if not has_source_url_column:
        connection.execute(
            "ALTER TABLE drive_discs ADD COLUMN source_url TEXT NOT NULL DEFAULT '';"
        )


def ensure_drive_disc_image_column(connection: sqlite3.Connection) -> None:
    columns = connection.execute("PRAGMA table_info(drive_discs);").fetchall()
    has_image_column = any(column[1] == "image" for column in columns)

    if not has_image_column:
        connection.execute(
            "ALTER TABLE drive_discs ADD COLUMN image TEXT NOT NULL DEFAULT '';"
        )


class SqliteExporter(Exporter):
    target_name = "sqlite"

    def export(self, result: TaskRunResult) -> str:
        database_path = get_storage_db_path()
        database_path.parent.mkdir(parents=True, exist_ok=True)

        with closing(sqlite3.connect(database_path)) as connection:
            connection.execute(CREATE_AGENTS_TABLE_SQL)
            connection.execute(CREATE_WEAPONS_TABLE_SQL)
            connection.execute(CREATE_DRIVE_DISCS_TABLE_SQL)
            connection.execute(CREATE_SYNC_LOGS_TABLE_SQL)
            ensure_weapon_image_column(connection)
            ensure_drive_disc_image_column(connection)
            ensure_drive_disc_source_url_column(connection)
            if any(isinstance(record, AgentRecord) for record in result.records):
                connection.execute(DELETE_MOCK_AGENTS_SQL)
            if any(isinstance(record, WeaponRecord) for record in result.records):
                connection.execute(DELETE_MOCK_WEAPONS_SQL)
            if any(isinstance(record, DriveDiscRecord) for record in result.records):
                connection.execute(DELETE_MOCK_DRIVE_DISCS_SQL)
            for record in result.records:
                if isinstance(record, AgentRecord):
                    connection.execute(UPSERT_AGENT_SQL, record.to_dict())
                elif isinstance(record, WeaponRecord):
                    payload = record.to_dict()
                    connection.execute(
                        UPSERT_WEAPON_SQL,
                        {
                            **payload,
                            "fit_roles_json": json.dumps(payload["fit_roles"], ensure_ascii=False),
                            "fit_agents_json": json.dumps(payload["fit_agents"], ensure_ascii=False),
                        },
                    )
                elif isinstance(record, DriveDiscRecord):
                    payload = record.to_dict()
                    connection.execute(
                        UPSERT_DRIVE_DISC_SQL,
                        {
                            **payload,
                            "fit_agents_json": json.dumps(payload["fit_agents"], ensure_ascii=False),
                            "fit_scenes_json": json.dumps(payload["fit_scenes"], ensure_ascii=False),
                        },
                    )

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
