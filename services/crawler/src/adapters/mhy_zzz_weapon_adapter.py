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
    parse_json_response,
    split_paragraphs,
    strip_html,
    unix_to_iso_date,
)
from src.utils.errors import CrawlerError


ROLE_MAP = {
    "强攻": "Attack",
    "异常": "Anomaly",
    "击破": "Stun",
    "支援": "Support",
    "防护": "Defense",
    "命破": "Rupture",
}

WEAPON_LIST_HEADERS = {
    **LIST_HEADERS,
    "Referer": "https://baike.mihoyo.com/zzz/wiki/channel/map/2/45?mhy_presentation_style=fullscreen",
}

STATS_PATTERN = re.compile(
    r"满级面板[:：]\s*([^+\s]+)\+([0-9.]+%?)\s+([^+\s]+)\+([0-9.]+%?)"
)
RECOMMENDED_AGENT_ID_PATTERN = re.compile(r'data-entry-id="(\d+)"')


def split_weapon_paragraphs(value: str) -> list[str]:
    return [
        paragraph
        for paragraph in re.split(r"</p>|<br\s*/?>|<hr\s*/?>", value)
        if paragraph.strip()
    ]


@dataclass(slots=True)
class WeaponSample:
    entry_page_id: int
    list_item: dict[str, Any]
    page: dict[str, Any]


def normalize_slug(entry_page_id: int) -> str:
    return f"mhy-{entry_page_id}"


def extract_module_data(modules: list[dict[str, Any]], component_id: str) -> dict[str, Any]:
    for module in modules:
        for component in module.get("components", []):
            if component.get("component_id") == component_id:
                raw_data = component.get("data") or "{}"
                if isinstance(raw_data, str):
                    return json.loads(raw_data)
                if isinstance(raw_data, dict):
                    return raw_data
    return {}


def parse_filter_text(raw_ext: str) -> list[str]:
    try:
        payload = json.loads(raw_ext)
    except json.JSONDecodeError:
        return []

    filter_text = (
        payload.get("c_45", {})
        .get("filter", {})
        .get("text", "[]")
    )
    try:
        parsed = json.loads(filter_text)
    except json.JSONDecodeError:
        return []

    return [str(item) for item in parsed]


def parse_fit_roles(filter_tags: list[str]) -> list[str]:
    roles: list[str] = []

    for tag in filter_tags:
        if not tag.startswith("特性/"):
            continue
        role_label = tag.split("/", 1)[1].strip()
        mapped = ROLE_MAP.get(role_label)
        if mapped and mapped not in roles:
            roles.append(mapped)

    return roles


def parse_panel_stats(effect_text: str) -> tuple[str, str]:
    match = STATS_PATTERN.search(effect_text)
    if not match:
        return ("基础攻击力 未知", "高级属性 未知")

    base_name, base_value, sub_name, sub_value = match.groups()
    return (f"{base_name} {base_value}", f"{sub_name} {sub_value}")


def build_effect_desc(
    effect_paragraphs: list[str],
    intro_paragraphs: list[str],
    fit_roles: list[str],
) -> str:
    role_prefix = f"{'/'.join(fit_roles)} 音擎。"
    non_empty_effects = [paragraph.strip() for paragraph in effect_paragraphs if paragraph.strip()]
    effect_lines = [
        paragraph
        for paragraph in non_empty_effects
        if not paragraph.startswith("初始面板")
        and not paragraph.startswith("满级面板")
        and not paragraph.startswith("获取途径")
    ]

    if len(effect_lines) >= 3 and effect_lines[0].startswith("对于"):
        title = effect_lines[1]
        body = effect_lines[2]
        return f"{role_prefix} {title}：{body}"[:240].strip()

    if len(effect_lines) >= 2 and effect_lines[0].startswith("对于"):
        return f"{role_prefix} {effect_lines[1]}"[:240].strip()

    if effect_lines:
        return f"{role_prefix} {effect_lines[0]}"[:240].strip()

    if intro_paragraphs:
        return f"{role_prefix} {intro_paragraphs[0]}"[:240].strip()

    return "暂无效果说明。"


def extract_recommended_agents(recommendation_table: dict[str, Any]) -> list[str]:
    ids: list[str] = []

    for table in recommendation_table.get("tables", []):
        for row in table.get("row", []):
            if not row:
                continue
            first_cell = str(row[0])
            for entry_id in RECOMMENDED_AGENT_ID_PATTERN.findall(first_cell):
                agent_id = f"agent-mhy-{entry_id}"
                if agent_id not in ids:
                    ids.append(agent_id)

    return ids


class MhyZzzWeaponAdapter(SourceAdapter):
    source_name = "mihoyo.zzz.wiki"

    def __init__(self, sample_size: int = 5) -> None:
        self.sample_size = sample_size

    def fetch(self) -> list[dict[str, Any]]:
        list_items = self._fetch_weapon_list_items()
        fetched_at = datetime.now(UTC).isoformat()
        records: list[dict[str, Any]] = []

        for list_item in list_items[: self.sample_size]:
            sample = self._fetch_weapon_sample(list_item)
            record = self._to_raw_record(sample, fetched_at)
            if self._is_usable_weapon_record(record):
                records.append(record)

        if len(records) < 3:
            raise CrawlerError(
                "miHoYo wiki weapon adapter produced fewer than three usable samples."
            )

        return records

    @staticmethod
    def _is_usable_weapon_record(record: dict[str, Any]) -> bool:
        required_fields = ("rarity", "base_stat", "sub_stat", "effect_desc", "fit_roles")
        return all(record.get(field) for field in required_fields)

    def _fetch_weapon_list_items(self) -> list[dict[str, Any]]:
        query = urlencode({"app_sn": "zzz_wiki", "channel_id": 2})
        data = parse_json_response(f"{MHY_LIST_API_URL}?{query}", WEAPON_LIST_HEADERS)

        sections = data.get("list", [])
        game_illustration = next(
            (section for section in sections if int(section.get("id", 0)) == 2),
            None,
        )
        if not game_illustration:
            raise CrawlerError("Unable to find 游戏图鉴 section in miHoYo wiki list response.")

        weapon_section = next(
            (
                child
                for child in game_illustration.get("children", [])
                if int(child.get("id", 0)) == 45
            ),
            None,
        )
        if not weapon_section:
            raise CrawlerError("Unable to find 音擎 section in miHoYo wiki list response.")

        records = weapon_section.get("list", [])
        if not records:
            raise CrawlerError("miHoYo wiki returned an empty 音擎 list.")

        return records

    def _fetch_weapon_sample(self, list_item: dict[str, Any]) -> WeaponSample:
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

        return WeaponSample(
            entry_page_id=entry_page_id,
            list_item=list_item,
            page=page,
        )

    def _to_raw_record(self, sample: WeaponSample, fetched_at: str) -> dict[str, Any]:
        page = sample.page
        modules = page.get("modules", [])
        base_info = extract_module_data(modules, "material_base_info")
        recommendation_table = extract_module_data(modules, "double_col_table")
        effect_table = extract_module_data(modules, "multi_table")
        intro_data = extract_module_data(modules, "rich_row_base_info")
        filter_tags = parse_filter_text(str(sample.list_item.get("ext") or ""))
        fit_roles = parse_fit_roles(filter_tags)

        effect_rows = effect_table.get("tables", [])
        stats_html = ""
        effect_html = ""
        if effect_rows and effect_rows[0].get("row") and effect_rows[0]["row"][0]:
            first_row = effect_rows[0]["row"][0]
            if first_row:
                stats_html = str(first_row[0])
            if len(first_row) > 1:
                effect_html = str(first_row[1])
            elif first_row:
                effect_html = str(first_row[0])
        effect_paragraphs = [
            strip_html(paragraph)
            for paragraph in split_weapon_paragraphs(effect_html)
            if strip_html(paragraph)
        ]
        stats_text = strip_html(stats_html)
        base_stat, sub_stat = parse_panel_stats(stats_text)

        intro_paragraphs = [
            strip_html(paragraph)
            for paragraph in split_paragraphs(str(intro_data.get("rich_text") or ""))
        ]
        intro_paragraphs = [paragraph for paragraph in intro_paragraphs if paragraph and paragraph != "暂无"]
        effect_desc = build_effect_desc(
            effect_paragraphs,
            intro_paragraphs,
            fit_roles,
        )

        return {
            "entry_page_id": sample.entry_page_id,
            "slug": normalize_slug(sample.entry_page_id),
            "name": str(page.get("name") or sample.list_item.get("title") or "").strip(),
            "rarity": str(base_info.get("grade") or "").strip(),
            "image": str(
                base_info.get("img")
                or page.get("icon_url")
                or sample.list_item.get("icon")
                or ""
            ).strip(),
            "base_stat": base_stat,
            "sub_stat": sub_stat,
            "effect_desc": effect_desc,
            "fit_roles": fit_roles,
            "fit_agents": extract_recommended_agents(recommendation_table),
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
            },
        }
