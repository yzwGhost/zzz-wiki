from __future__ import annotations

from src.adapters.base import SourceAdapter


class MockAgentAdapter(SourceAdapter):
    source_name = "mock.bootstrap"

    def fetch(self) -> list[dict[str, str]]:
        return [
            {
                "slug": "ellen-joe",
                "name": "艾莲",
                "name_en": "Ellen Joe",
                "rarity": "S",
                "element": "Ice",
                "role": "Attack",
                "faction": "维多利亚家政",
                "summary": "冰属性站场主 C，擅长通过高速切入和连段打出持续爆发。",
                "skill_intro": "依靠冲刺派生与强化普攻叠加节奏，在冰队中承担主要输出。",
                "game_version": "1.0",
                "released_at": "2024-07-04",
                "source_url": "https://example.com/agents/ellen-joe",
            },
            {
                "slug": "zhu-yuan",
                "name": "朱鸢",
                "name_en": "Zhu Yuan",
                "rarity": "S",
                "element": "Ether",
                "role": "Attack",
                "faction": "新艾利都治安局",
                "summary": "以远程爆发和失衡追击见长的以太主 C。",
                "skill_intro": "围绕强化霰弹与终结技打 burst，适合快速压血。",
                "game_version": "1.0",
                "released_at": "2024-08-14",
                "source_url": "https://example.com/agents/zhu-yuan",
            },
        ]
