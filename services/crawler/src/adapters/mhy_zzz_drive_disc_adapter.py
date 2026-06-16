from __future__ import annotations

import json
import re
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Any
from urllib.parse import urlencode

from src.adapters.base import SourceAdapter
from src.adapters.mhy_zzz_agent_adapter import (
    DETAIL_HEADERS,
    LIST_HEADERS,
    MHY_ENTRY_API_URL,
    MHY_LIST_API_URL,
    MHY_SOURCE_DETAIL_URL,
    MHY_WIKI_HOME_URL,
    normalize_slug,
    parse_json_response,
    strip_html,
    unix_to_iso_date,
)
from src.utils.errors import CrawlerError


MHY_DRIVE_DISC_CHANNEL_URL = (
    "https://baike.mihoyo.com/zzz/wiki/channel/map/2/46?mhy_presentation_style=fullscreen"
)
DRIVE_DISC_LIST_HEADERS = {
    **LIST_HEADERS,
    "Referer": MHY_DRIVE_DISC_CHANNEL_URL,
}
RECOMMENDED_AGENT_ID_PATTERN = re.compile(r'data-entry-id="(\d+)"')
MULTI_SPACE_PATTERN = re.compile(r"\s+")
KEYWORD_SCENE_TAGS = (
    ("异常", "异常输出"),
    ("强攻", "强攻输出"),
    ("击破", "失衡辅助"),
    ("支援", "支援增益"),
    ("防护", "防护生存"),
    ("暴击", "暴击输出"),
    ("终结技", "终结爆发"),
    ("追击", "追击输出"),
    ("穿透", "穿透输出"),
)


@dataclass(slots=True)
class DriveDiscSample:
    entry_page_id: int
    list_item: dict[str, Any]
    page: dict[str, Any]


def parse_filter_effects(raw_ext: str) -> tuple[str, str]:
    try:
        payload = json.loads(raw_ext)
    except json.JSONDecodeError:
        return ("", "")

    rows = payload.get("c_46", {}).get("table", {}).get("list", [])
    mapping = {str(row.get("key")): str(row.get("value") or "").strip() for row in rows}
    return (mapping.get("2", ""), mapping.get("4", ""))


def parse_component_data(component: dict[str, Any]) -> dict[str, Any]:
    raw_data = component.get("data") or "{}"
    if isinstance(raw_data, str):
        return json.loads(raw_data)
    if isinstance(raw_data, dict):
        return raw_data
    return {}


def extract_drive_disc_image(page: dict[str, Any], modules: list[dict[str, Any]]) -> str:
    icon_url = str(page.get("icon_url") or "").strip()
    if icon_url:
        return icon_url

    for module in modules:
        for component in module.get("components", []):
            if component.get("component_id") != "material_base_info":
                continue
            data = parse_component_data(component)
            image = str(data.get("img") or "").strip()
            if image:
                return image

    return ""


def extract_table_by_headers(
    modules: list[dict[str, Any]],
    expected_headers: tuple[str, ...],
) -> dict[str, Any]:
    for module in modules:
        for component in module.get("components", []):
            if component.get("component_id") != "double_col_table":
                continue
            data = parse_component_data(component)
            for table in data.get("tables", []):
                headers = tuple(
                    strip_html(str(header or "")).strip() for header in table.get("header", [])
                )
                if headers == expected_headers:
                    return table
    return {}


def first_row_text(table: dict[str, Any]) -> tuple[str, str]:
    for row in table.get("row", []):
        if len(row) >= 2:
            return (strip_html(str(row[0])).strip(), strip_html(str(row[1])).strip())
    return ("", "")


def extract_recommended_agents(recommendation_table: dict[str, Any]) -> list[str]:
    ids: list[str] = []

    for row in recommendation_table.get("row", []):
        if not row:
            continue
        first_cell = str(row[0])
        for entry_id in RECOMMENDED_AGENT_ID_PATTERN.findall(first_cell):
            agent_id = f"agent-mhy-{entry_id}"
            if agent_id not in ids:
                ids.append(agent_id)

    return ids


def extract_recommendation_reasons(recommendation_table: dict[str, Any]) -> list[str]:
    reasons: list[str] = []

    for row in recommendation_table.get("row", []):
        if len(row) < 2:
            continue
        reason = strip_html(str(row[1])).strip()
        if reason:
            reasons.append(reason)

    return reasons


def normalize_scene_label(value: str) -> str:
    value = MULTI_SPACE_PATTERN.sub(" ", value).strip("。；;，, ")
    value = value.replace("装备者", "").replace("该套驱动盘可", "").strip()

    if "属性伤害" in value:
        value = value.split("+", 1)[0].strip()

    if len(value) > 14:
        value = value[:14].rstrip()

    return value or "套装效果"


def infer_fit_scenes(two_piece_effect: str, recommendation_reasons: list[str]) -> list[str]:
    tags: list[str] = []

    primary_tag = normalize_scene_label(two_piece_effect)
    if primary_tag not in tags:
        tags.append(primary_tag)

    combined_text = " ".join(recommendation_reasons)
    for keyword, label in KEYWORD_SCENE_TAGS:
        if keyword in combined_text and label not in tags:
            tags.append(label)
        if len(tags) >= 3:
            return tags

    if recommendation_reasons and len(tags) < 2:
        fallback_tag = normalize_scene_label(recommendation_reasons[0])
        if fallback_tag not in tags:
            tags.append(fallback_tag)

    return tags or ["套装效果"]


class MhyZzzDriveDiscAdapter(SourceAdapter):
    source_name = "mihoyo.zzz.wiki"

    def __init__(self, sample_size: int = 5) -> None:
        self.sample_size = sample_size

    def fetch(self) -> list[dict[str, Any]]:
        list_items = self._fetch_drive_disc_list_items()
        fetched_at = datetime.now(UTC).isoformat()
        records: list[dict[str, Any]] = []

        for list_item in list_items[: self.sample_size]:
            sample = self._fetch_drive_disc_sample(list_item)
            record = self._to_raw_record(sample, fetched_at)
            if self._is_usable_drive_disc_record(record):
                records.append(record)

        if len(records) < 3:
            raise CrawlerError(
                "miHoYo wiki drive disc adapter produced fewer than three usable samples."
            )

        return records

    @staticmethod
    def _is_usable_drive_disc_record(record: dict[str, Any]) -> bool:
        required_fields = ("two_piece_effect", "four_piece_effect", "fit_scenes", "source_url")
        return all(record.get(field) for field in required_fields)

    def _fetch_drive_disc_list_items(self) -> list[dict[str, Any]]:
        query = urlencode({"app_sn": "zzz_wiki", "channel_id": 2})
        data = parse_json_response(f"{MHY_LIST_API_URL}?{query}", DRIVE_DISC_LIST_HEADERS)

        sections = data.get("list", [])
        game_illustration = next(
            (section for section in sections if int(section.get("id", 0)) == 2),
            None,
        )
        if not game_illustration:
            raise CrawlerError("Unable to find 游戏图鉴 section in miHoYo wiki list response.")

        drive_disc_section = next(
            (
                child
                for child in game_illustration.get("children", [])
                if int(child.get("id", 0)) == 46
            ),
            None,
        )
        if not drive_disc_section:
            raise CrawlerError("Unable to find 驱动盘 section in miHoYo wiki list response.")

        records = drive_disc_section.get("list", [])
        if not records:
            raise CrawlerError("miHoYo wiki returned an empty 驱动盘 list.")

        return records

    def _fetch_drive_disc_sample(self, list_item: dict[str, Any]) -> DriveDiscSample:
        entry_page_id = int(list_item["content_id"])
        query = urlencode(
            {
                "entry_page_id": entry_page_id,
                "lang": "zh-cn",
                "app_sn": "zzz_wiki",
            }
        )
        data = parse_json_response(f"{MHY_ENTRY_API_URL}?{query}", DETAIL_HEADERS)
        page = data.get("page")
        if not isinstance(page, dict):
            raise CrawlerError(f"Entry page payload missing page field: {entry_page_id}")

        return DriveDiscSample(
            entry_page_id=entry_page_id,
            list_item=list_item,
            page=page,
        )

    def _to_raw_record(self, sample: DriveDiscSample, fetched_at: str) -> dict[str, Any]:
        page = sample.page
        modules = page.get("modules", [])
        list_two_piece_effect, list_four_piece_effect = parse_filter_effects(
            str(sample.list_item.get("ext") or "")
        )
        effect_table = extract_table_by_headers(modules, ("二件套", "四件套"))
        recommendation_table = extract_table_by_headers(modules, ("推荐角色", "推荐理由"))
        detail_two_piece_effect, detail_four_piece_effect = first_row_text(effect_table)
        two_piece_effect = detail_two_piece_effect or list_two_piece_effect
        four_piece_effect = detail_four_piece_effect or list_four_piece_effect
        recommendation_reasons = extract_recommendation_reasons(recommendation_table)

        return {
            "entry_page_id": sample.entry_page_id,
            "slug": normalize_slug(sample.entry_page_id),
            "name": str(page.get("name") or sample.list_item.get("title") or "").strip(),
            "image": extract_drive_disc_image(page, modules)
            or str(sample.list_item.get("icon") or "").strip(),
            "two_piece_effect": two_piece_effect,
            "four_piece_effect": four_piece_effect,
            "fit_agents": extract_recommended_agents(recommendation_table),
            "fit_scenes": infer_fit_scenes(two_piece_effect, recommendation_reasons),
            "source_url": MHY_SOURCE_DETAIL_URL.format(entry_page_id=sample.entry_page_id),
            "updated_at": unix_to_iso_date(page.get("version") or datetime.now(UTC).timestamp()),
            "fetched_at": fetched_at,
            "source_site": MHY_WIKI_HOME_URL,
            "source_kind": "json_api",
            "source_endpoints": {
                "list": MHY_LIST_API_URL,
                "detail": MHY_ENTRY_API_URL,
            },
            "source_payload": {
                "list_item": sample.list_item,
                "page": sample.page,
                "recommendation_reasons": recommendation_reasons,
            },
        }
