# zzz-wiki crawler

Python crawler subproject for the local-first Zenless Zone Zero guide app.

## Run

```bash
python -m src.cli bootstrap_agents
python -m src.cli bootstrap_agents --target sqlite
python -m src.cli fetch_mhy_agents --target json
python -m src.cli fetch_mhy_weapons --target sqlite
```

## Output

- `json`: writes raw and processed snapshots under `services/crawler/data/`
- `sqlite`: writes normalized agents / weapons and a sync log into `storage/app.db`
