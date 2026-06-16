from __future__ import annotations

from datetime import UTC, datetime

from src.models.records import AgentRecord, RawCatalogRecord
from src.utils.errors import CrawlerValidationError


REQUIRED_FIELDS = (
    "slug",
    "name",
    "name_en",
    "rarity",
    "element",
    "role",
    "faction",
    "summary",
    "skill_intro",
    "game_version",
    "released_at",
    "source_url",
)


def clean_agent_record(raw_record: RawCatalogRecord) -> AgentRecord:
    missing_fields = [field for field in REQUIRED_FIELDS if not raw_record.get(field)]
    if missing_fields:
        raise CrawlerValidationError(
            f"Agent record missing required fields: {', '.join(missing_fields)}"
        )

    slug = str(raw_record["slug"]).strip()
    updated_at = str(raw_record.get("updated_at") or datetime.now(UTC).date().isoformat())

    return AgentRecord(
        id=f"agent-{slug}",
        slug=slug,
        name=str(raw_record["name"]).strip(),
        name_en=str(raw_record["name_en"]).strip(),
        rarity=str(raw_record["rarity"]).strip(),
        element=str(raw_record["element"]).strip(),
        role=str(raw_record["role"]).strip(),
        faction=str(raw_record["faction"]).strip(),
        avatar=str(
            raw_record.get("avatar")
            or f"https://placehold.co/96x96/1f2937/f8fafc?text={slug}"
        ),
        cover=str(
            raw_record.get("cover")
            or f"https://placehold.co/480x240/0f172a/f8fafc?text={slug}"
        ),
        summary=str(raw_record["summary"]).strip(),
        skill_intro=str(raw_record["skill_intro"]).strip(),
        game_version=str(raw_record["game_version"]).strip(),
        released_at=str(raw_record["released_at"]).strip(),
        updated_at=updated_at.strip(),
        source_url=str(raw_record["source_url"]).strip(),
    )
