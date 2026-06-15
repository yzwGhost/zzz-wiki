from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any


class SourceAdapter(ABC):
    """Base adapter interface for one upstream source."""

    source_name: str

    @abstractmethod
    def fetch(self) -> list[dict[str, Any]]:
        """Return raw records from an upstream source."""
