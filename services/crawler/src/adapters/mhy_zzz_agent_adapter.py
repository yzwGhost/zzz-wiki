from __future__ import annotations

import json
import re
import socket
import time
from dataclasses import dataclass
from datetime import UTC, datetime
from html import unescape
from html.parser import HTMLParser
from typing import Any
from urllib.parse import urlencode
from urllib.error import URLError
from urllib.request import Request, urlopen

from src.adapters.base import SourceAdapter
from src.utils.errors import CrawlerError


MHY_WIKI_HOME_URL = (
    "https://baike.mihoyo.com/zzz/wiki/"
    "?mhy_presentation_style=fullscreen&utm_source=bbs&utm_medium=zzz&utm_campaign=icon"
)
MHY_AGENT_CHANNEL_URL = (
    "https://baike.mihoyo.com/zzz/wiki/channel/map/2/43?mhy_presentation_style=fullscreen"
)
MHY_LIST_API_URL = (
    "https://act-api-takumi-static.mihoyo.com/common/blackboard/zzz_wiki/v1/home/content/list"
)
MHY_ENTRY_API_URL = "https://act-api-takumi-static.mihoyo.com/hoyowiki/zzz/wapi/entry_page"
MHY_SOURCE_DETAIL_URL = "https://baike.mihoyo.com/zzz/wiki/content/{entry_page_id}/detail"

LIST_HEADERS = {
    "Accept": "application/json, text/plain, */*",
    "Referer": MHY_AGENT_CHANNEL_URL,
    "User-Agent": "Mozilla/5.0",
}

DETAIL_HEADERS = {
    "Accept": "application/json, text/plain, */*",
    "Referer": MHY_WIKI_HOME_URL,
    "User-Agent": "Mozilla/5.0",
    "x-rpc-wiki_app": "zzz",
}

VERSION_PATTERN = re.compile(r"\b\d+\.\d+\b")

ELEMENT_MAP = {
    "physical": "Physical",
    "fire": "Fire",
    "ice": "Ice",
    "electric": "Electric",
    "ether": "Ether",
    "wind": "Wind",
}

ROLE_MAP = {
    "attack": "Attack",
    "anomaly": "Anomaly",
    "stun": "Stun",
    "support": "Support",
    "defense": "Defense",
    "rupture": "Rupture",
}


class RichTextStripper(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self._chunks: list[str] = []

    def handle_data(self, data: str) -> None:
        self._chunks.append(data)

    def get_text(self) -> str:
        text = unescape("".join(self._chunks))
        text = re.sub(r"\s+", " ", text)
        return text.strip()


def strip_html(value: str) -> str:
    parser = RichTextStripper()
    parser.feed(value)
    parser.close()
    return parser.get_text()


def split_paragraphs(value: str) -> list[str]:
    return [paragraph for paragraph in re.split(r"</p>|<br\s*/?>", value) if paragraph.strip()]


def parse_json_response(
    url: str,
    headers: dict[str, str],
    *,
    timeout: int = 45,
    retries: int = 3,
    retry_delay: float = 1.0,
) -> dict[str, Any]:
    last_error: Exception | None = None

    for attempt in range(1, retries + 1):
        request = Request(url, headers=headers, method="GET")

        try:
            with urlopen(request, timeout=timeout) as response:
                payload = json.loads(response.read().decode("utf-8"))
            break
        except (TimeoutError, socket.timeout, URLError) as error:
            last_error = error
            if attempt == retries:
                raise CrawlerError(
                    f"miHoYo wiki request timed out after {retries} attempts: {url}"
                ) from error
            time.sleep(retry_delay * attempt)
    else:  # pragma: no cover - defensive loop guard
        raise CrawlerError(f"miHoYo wiki request failed without a response: {url}") from last_error

    retcode = payload.get("retcode")
    if retcode not in (0, None):
        raise CrawlerError(
            f"miHoYo wiki request failed: url={url} retcode={retcode} message={payload.get('message')}"
        )

    data = payload.get("data")
    if not isinstance(data, dict):
        raise CrawlerError(f"miHoYo wiki response missing data object: {url}")

    return data


def normalize_slug(entry_page_id: int) -> str:
    return f"mhy-{entry_page_id}"


def parse_version(desc: str) -> str:
    match = VERSION_PATTERN.search(desc)
    return match.group(0) if match else "unknown"


def unix_to_iso_date(value: int | str) -> str:
    timestamp = int(value)
    return datetime.fromtimestamp(timestamp, UTC).date().isoformat()


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


def extract_skill_titles(role_talent_data: dict[str, Any], limit: int = 3) -> list[str]:
    titles: list[str] = []
    for group in role_talent_data.get("list", []):
        for child in group.get("children", []):
            title = str(child.get("title") or "").strip()
            if title:
                titles.append(title)
            if len(titles) >= limit:
                return titles
    return titles


@dataclass(slots=True)
class AgentSample:
    entry_page_id: int
    list_item: dict[str, Any]
    page: dict[str, Any]


class MhyZzzAgentAdapter(SourceAdapter):
    source_name = "mihoyo.zzz.wiki"

    def __init__(self, sample_size: int = 5) -> None:
        self.sample_size = sample_size

    def fetch(self) -> list[dict[str, Any]]:
        list_items = self._fetch_agent_list_items()
        fetched_at = datetime.now(UTC).isoformat()
        records: list[dict[str, Any]] = []

        for list_item in list_items:
            sample = self._fetch_agent_sample(list_item)
            record = self._to_raw_record(sample, fetched_at)
            if self._is_usable_agent_record(record):
                records.append(record)
            if len(records) >= self.sample_size:
                break

        if not records:
            raise CrawlerError("miHoYo wiki agent adapter did not produce any usable samples.")

        return records

    @staticmethod
    def _is_usable_agent_record(record: dict[str, Any]) -> bool:
        required_fields = ("rarity", "faction", "skill_intro")
        return all(str(record.get(field) or "").strip() for field in required_fields)

    def _fetch_agent_list_items(self) -> list[dict[str, Any]]:
        query = urlencode({"app_sn": "zzz_wiki", "channel_id": 2})
        data = parse_json_response(f"{MHY_LIST_API_URL}?{query}", LIST_HEADERS)

        sections = data.get("list", [])
        game_illustration = next(
            (section for section in sections if int(section.get("id", 0)) == 2),
            None,
        )
        if not game_illustration:
            raise CrawlerError("Unable to find 游戏图鉴 section in miHoYo wiki list response.")

        agent_section = next(
            (
                child
                for child in game_illustration.get("children", [])
                if int(child.get("id", 0)) == 43
            ),
            None,
        )
        if not agent_section:
            raise CrawlerError("Unable to find 代理人 section in miHoYo wiki list response.")

        records = agent_section.get("list", [])
        if not records:
            raise CrawlerError("miHoYo wiki returned an empty 代理人 list.")

        return records

    def _fetch_agent_sample(self, list_item: dict[str, Any]) -> AgentSample:
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

        return AgentSample(
            entry_page_id=entry_page_id,
            list_item=list_item,
            page=page,
        )

    def _to_raw_record(self, sample: AgentSample, fetched_at: str) -> dict[str, Any]:
        page = sample.page
        modules = page.get("modules", [])
        role_base_info = extract_module_data(modules, "role_base_info")
        role_intro = extract_module_data(modules, "rich_row_base_info")
        role_talent = extract_module_data(modules, "role_talent")

        paragraphs = [
            strip_html(paragraph)
            for paragraph in split_paragraphs(str(role_intro.get("rich_text") or ""))
        ]
        intro_paragraphs = [paragraph for paragraph in paragraphs if paragraph]
        skill_titles = extract_skill_titles(role_talent)

        updated_at = unix_to_iso_date(page.get("version") or datetime.now(UTC).timestamp())
        summary = intro_paragraphs[0] if intro_paragraphs else str(page.get("name") or "").strip()
        skill_intro_parts = intro_paragraphs[1:2]
        if skill_titles:
            skill_intro_parts.append("技能条目：" + " / ".join(skill_titles))

        return {
            "entry_page_id": sample.entry_page_id,
            "slug": normalize_slug(sample.entry_page_id),
            "name": str(page.get("name") or sample.list_item.get("title") or "").strip(),
            "name_en": str(page.get("alias_name") or page.get("name") or "").strip(),
            "rarity": str(role_base_info.get("grade") or "").strip(),
            "element": ELEMENT_MAP.get(
                str(role_base_info.get("role_attribute") or "").strip().lower(),
                "Physical",
            ),
            "role": ROLE_MAP.get(
                str(role_base_info.get("role_profession") or "").strip().lower(),
                "Attack",
            ),
            "faction": str(role_base_info.get("addition_text") or "").strip(),
            "avatar": str(page.get("icon_url") or sample.list_item.get("icon") or "").strip(),
            "cover": str(
                role_base_info.get("bg_pc")
                or role_base_info.get("tachie_pc")
                or page.get("header_img_url")
                or page.get("icon_url")
                or ""
            ).strip(),
            "summary": summary,
            "skill_intro": " ".join(part for part in skill_intro_parts if part).strip(),
            "game_version": parse_version(str(page.get("desc") or sample.list_item.get("summary") or "")),
            "released_at": updated_at,
            "updated_at": updated_at,
            "source_url": MHY_SOURCE_DETAIL_URL.format(entry_page_id=sample.entry_page_id),
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
