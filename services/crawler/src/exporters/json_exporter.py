from __future__ import annotations

import json

from src.exporters.base import Exporter
from src.models.records import TaskRunResult
from src.utils.paths import get_processed_path, get_raw_path


class JsonExporter(Exporter):
    target_name = "json"

    def export(self, result: TaskRunResult) -> str:
        raw_path = get_raw_path(f"{result.task_name}.json")
        processed_path = get_processed_path(f"{result.task_name}.json")

        raw_path.write_text(
            json.dumps(result.raw_records, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        processed_path.write_text(
            json.dumps(result.to_payload(), ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

        return str(processed_path)
