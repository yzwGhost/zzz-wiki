from __future__ import annotations

from abc import ABC, abstractmethod

from src.models.records import TaskRunResult


class Exporter(ABC):
    """Base exporter for processed crawler output."""

    target_name: str

    @abstractmethod
    def export(self, result: TaskRunResult) -> str:
        """Persist processed records and return the final target path."""
