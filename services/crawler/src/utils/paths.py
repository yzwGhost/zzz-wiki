from __future__ import annotations

import os
from pathlib import Path


CRAWLER_ROOT = Path(
    os.environ.get("ZZZ_CRAWLER_ROOT", Path(__file__).resolve().parents[2])
)
DATA_ROOT = Path(os.environ.get("ZZZ_CRAWLER_DATA_ROOT", CRAWLER_ROOT / "data"))
RAW_ROOT = Path(os.environ.get("ZZZ_CRAWLER_RAW_ROOT", DATA_ROOT / "raw"))
PROCESSED_ROOT = Path(
    os.environ.get("ZZZ_CRAWLER_PROCESSED_ROOT", DATA_ROOT / "processed")
)
STORAGE_ROOT = Path(
    os.environ.get("ZZZ_STORAGE_ROOT", CRAWLER_ROOT.parents[1] / "storage")
)


def get_raw_path(file_name: str) -> Path:
    RAW_ROOT.mkdir(parents=True, exist_ok=True)
    return RAW_ROOT / file_name


def get_processed_path(file_name: str) -> Path:
    PROCESSED_ROOT.mkdir(parents=True, exist_ok=True)
    return PROCESSED_ROOT / file_name


def get_storage_db_path() -> Path:
    override_path = os.environ.get("ZZZ_STORAGE_DB_PATH")
    if override_path:
        return Path(override_path)

    return STORAGE_ROOT / "app.db"
