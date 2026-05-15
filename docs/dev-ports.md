# WMS Web local development ports

| Component | Port | Purpose |
| --- | ---: | --- |
| wms-web | 5173 | Vite dev server |
| wms-api | 8000 | FastAPI / Uvicorn HTTP service |
| wms-db | 5433 | Shared local PostgreSQL host port, not used directly by the browser |

## Environment variables

| Variable | Example | Meaning |
| --- | --- | --- |
| `VITE_API_MODE` | `direct` | Direct browser calls to the configured API base URL |
| `VITE_API_BASE_URL` | `http://127.0.0.1:8000` | wms-api HTTP base URL used by wms-web |

## Rules

- The browser never connects to `5433`; that is PostgreSQL.
- wms-web calls wms-api on `8000`.
- Keep the Vite dev server on `5173`.
- wms-web must not call procurement-api directly; procurement purchase sources are read through wms-api.
