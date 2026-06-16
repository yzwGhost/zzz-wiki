from __future__ import annotations

from datetime import UTC, datetime

from src.models.records import DriveDiscRecord, RawCatalogRecord
from src.utils.errors import CrawlerValidationError


REQUIRED_FIELDS = (
    "slug",
    "name",
    "image",
    "two_piece_effect",
    "four_piece_effect",
    "fit_scenes",
    "source_url",
)


def clean_drive_disc_record(raw_record: RawCatalogRecord) -> DriveDiscRecord:
    missing_fields = [field for field in REQUIRED_FIELDS if not raw_record.get(field)]
    if missing_fields:
        raise CrawlerValidationError(
            f"Drive disc record missing required fields: {', '.join(missing_fields)}"
        )

    slug = str(raw_record["slug"]).strip()
    updated_at = str(raw_record.get("updated_at") or datetime.now(UTC).date().isoformat())
    fit_agents = [
        str(agent_id).strip()
        for agent_id in raw_record.get("fit_agents", [])
        if str(agent_id).strip()
    ]
    fit_scenes = [
        str(scene).strip()
        for scene in raw_record.get("fit_scenes", [])
        if str(scene).strip()
    ]

    if not fit_scenes:
        raise CrawlerValidationError("Drive disc record missing fit_scenes after cleaning.")

    return DriveDiscRecord(
        id=f"drive-disc-{slug}",
        slug=slug,
        name=str(raw_record["name"]).strip(),
        image=str(raw_record["image"]).strip(),
        two_piece_effect=str(raw_record["two_piece_effect"]).strip(),
        four_piece_effect=str(raw_record["four_piece_effect"]).strip(),
        fit_agents=fit_agents,
        fit_scenes=fit_scenes,
        source_url=str(raw_record["source_url"]).strip(),
        updated_at=updated_at.strip(),
    )
