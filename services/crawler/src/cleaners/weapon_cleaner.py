from __future__ import annotations

from datetime import UTC, datetime

from src.models.records import RawCatalogRecord, WeaponRecord
from src.utils.errors import CrawlerValidationError


REQUIRED_FIELDS = (
    "slug",
    "name",
    "rarity",
    "image",
    "base_stat",
    "sub_stat",
    "effect_desc",
    "fit_roles",
    "source_url",
)


def clean_weapon_record(raw_record: RawCatalogRecord) -> WeaponRecord:
    missing_fields = [field for field in REQUIRED_FIELDS if not raw_record.get(field)]
    if missing_fields:
        raise CrawlerValidationError(
            f"Weapon record missing required fields: {', '.join(missing_fields)}"
        )

    slug = str(raw_record["slug"]).strip()
    updated_at = str(raw_record.get("updated_at") or datetime.now(UTC).date().isoformat())
    fit_roles = [str(role).strip() for role in raw_record.get("fit_roles", []) if str(role).strip()]
    fit_agents = [
        str(agent_id).strip()
        for agent_id in raw_record.get("fit_agents", [])
        if str(agent_id).strip()
    ]

    if not fit_roles:
        raise CrawlerValidationError("Weapon record missing fit_roles after cleaning.")

    return WeaponRecord(
        id=f"weapon-{slug}",
        slug=slug,
        name=str(raw_record["name"]).strip(),
        rarity=str(raw_record["rarity"]).strip(),
        image=str(raw_record["image"]).strip(),
        base_stat=str(raw_record["base_stat"]).strip(),
        sub_stat=str(raw_record["sub_stat"]).strip(),
        effect_desc=str(raw_record["effect_desc"]).strip(),
        fit_roles=fit_roles,
        fit_agents=fit_agents,
        source_url=str(raw_record["source_url"]).strip(),
        updated_at=updated_at.strip(),
    )
