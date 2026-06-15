from __future__ import annotations

import argparse
import json
import sys

from src.exporters.json_exporter import JsonExporter
from src.exporters.sqlite_exporter import SqliteExporter
from src.tasks.bootstrap_agents import TASK_NAME, run_bootstrap_agents_task
from src.utils.errors import CrawlerError, UnsupportedExportTargetError
from src.utils.logging import configure_logging, get_logger


TASK_REGISTRY = {
    TASK_NAME: run_bootstrap_agents_task,
}

EXPORTERS = {
    "json": JsonExporter(),
    "sqlite": SqliteExporter(),
}


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="zzz-crawler",
        description="Task runner for the zzz-wiki crawler project.",
    )
    parser.add_argument("task", choices=sorted(TASK_REGISTRY))
    parser.add_argument(
        "--target",
        choices=sorted(EXPORTERS),
        default="json",
        help="Export target for processed task results.",
    )
    return parser


def resolve_exporter(target: str):
    exporter = EXPORTERS.get(target)
    if exporter is None:
        raise UnsupportedExportTargetError(f"Unsupported export target: {target}")
    return exporter


def main() -> int:
    configure_logging()
    logger = get_logger("crawler.cli")
    parser = build_parser()
    args = parser.parse_args()

    try:
        task_runner = TASK_REGISTRY[args.task]
        result = task_runner()
        exporter = resolve_exporter(args.target)
        output_path = exporter.export(result)
    except CrawlerError as error:
        logger.exception("Crawler task failed")
        sys.stderr.write(f"{error}\n")
        return 1
    except Exception as error:  # pragma: no cover - defensive top-level guard
        logger.exception("Unexpected crawler failure")
        sys.stderr.write(f"{error}\n")
        return 1

    logger.info("Task %s finished, output=%s", args.task, output_path)
    sys.stdout.write(
        json.dumps(
            {
                "task": args.task,
                "target": args.target,
                "output": output_path,
                "status": result.status,
                "record_count": len(result.records),
            },
            ensure_ascii=False,
        )
        + "\n"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
