# zzz-wiki crawler

Python crawler subproject for the local-first Zenless Zone Zero guide app.

## Run

```bash
python -m src.cli bootstrap_agents
python -m src.cli bootstrap_agents --target sqlite
```

## Output

- `json`: writes raw and processed snapshots under `services/crawler/data/`
- `sqlite`: writes normalized agents and a sync log into `storage/app.db`
