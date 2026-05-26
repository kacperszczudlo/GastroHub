# Monitoring (Prometheus + Grafana)

Ten dokument opisuje konfigurację monitoringu backendu GastroHub (Express) z użyciem **Prometheus** i **Grafana**.

## 1. Co monitorujemy

- **Metryki HTTP (prom-client)**:
  - `http_requests_total{method,route,status_code}` – liczba żądań
  - `http_request_duration_ms_bucket{...}` – histogram czasu odpowiedzi (p50/p95 w Grafanie)
  - `active_connections` – liczba aktualnie obsługiwanych połączeń
- **Metryki Node.js** (domyślne z `collectDefaultMetrics`), np.:
  - `process_resident_memory_bytes` – RAM procesu
  - `process_start_time_seconds` – czas startu procesu
- **Metryka błędów API**:
  - `api_errors_total{type}` – błędy API pogrupowane wg typu: `not_found`, `bad_request`, `server_error`

Źródła w kodzie:
- Endpoint `/metrics`: `server/src/app.js`
- Metryki: `server/src/metrics/index.js`
- Middleware HTTP: `server/src/middlewares/metricsMiddleware.js`
- Logowanie błędów + inkrementacja `api_errors_total`: `server/src/middlewares/errorHandler.js`

## 2. Uruchomienie lokalne

### 2.1 Backend

Uruchom backend (port domyślny to `5000`):

```bash
cd server
npm run dev
```

Weryfikacja endpointu metryk:

```bash
curl http://localhost:5000/metrics | head -n 20
```

### 2.2 Prometheus

Plik konfiguracyjny w repozytorium: `prometheus.yml`.

Najważniejsze ustawienia:
- `job_name: gastrohub-api`
- `targets: ["localhost:5000"]`
- `metrics_path: /metrics`
- `scrape_interval: 5s`

Uruchom Prometheus (przykład dla binarki rozpakowanej w `~/Pobrane/prometheus-3.11.3.linux-amd64/`):

```bash
mkdir -p ~/Pobrane/prometheus-3.11.3.linux-amd64/data

~/Pobrane/prometheus-3.11.3.linux-amd64/prometheus \
  --config.file="$(pwd)/prometheus.yml" \
  --storage.tsdb.path=~/Pobrane/prometheus-3.11.3.linux-amd64/data \
  --web.listen-address=127.0.0.1:9090
```

Weryfikacja:
- UI: `http://localhost:9090`
- Targets: `http://localhost:9090/targets` → `gastrohub-api` powinien mieć status **UP**

### 2.3 Grafana

Grafana (standalone) była uruchamiana z katalogu `~/Pobrane/grafana-v11.5.2/`.

Start:

```bash
~/Pobrane/grafana-v11.5.2/bin/grafana server --homepath=~/Pobrane/grafana-v11.5.2
```

Logowanie:
- `http://localhost:3000`
- login: `admin`
- hasło: `admin` (przy pierwszym logowaniu Grafana prosi o zmianę)

Datasource Prometheus:
- URL: `http://127.0.0.1:9090`
- przycisk **Save & test** powinien zwrócić zielony komunikat

Import dashboardu:
- Grafana → **Dashboards → Import**
- upload pliku `grafana-dashboard.json` (z katalogu głównego repo)
- wybór datasource: **Prometheus**

## 3. Przydatne zapytania PromQL (z labu)

```promql
sum by(status_code) (http_requests_total)
```

```promql
rate(http_requests_total[1m])
```

```promql
sum by(method) (rate(http_requests_total[1m]))
```

P95 opóźnień:

```promql
histogram_quantile(0.95, sum(rate(http_request_duration_ms_bucket[1m])) by (le))
```

RAM procesu (MB):

```promql
process_resident_memory_bytes / 1024 / 1024
```

Metryka błędów API:

```promql
sum by(type) (api_errors_total)
```

## 4. Logowanie błędów po stronie serwera

Backend loguje błędy w `server/src/middlewares/errorHandler.js`:
- **czas**: ISO timestamp
- **typ**: 4xx (warn) vs 5xx (error)
- **kontekst**: metoda, ścieżka, IP, User-Agent

Równolegle inkrementowana jest metryka `api_errors_total{type=...}`.

## 5. Test stabilności pod obciążeniem (bez zewnętrznych narzędzi)

W repo jest prosty skrypt bez dodatkowych zależności:

```bash
cd server
npm run loadtest -- --url http://localhost:5000/api/menu --duration 15 --concurrency 25
```

Żeby wygenerować błędy i nabić `api_errors_total`:

```bash
cd server
npm run loadtest -- --url http://localhost:5000/api/tables/000000000000000000000000/ --duration 10 --concurrency 10
```

Po teście sprawdź:
- Prometheus query: `sum by(type) (api_errors_total)`
- Grafana dashboard: panel `api_errors_total (wg typu)`

## 6. Materiały do zaliczenia (screenshoty)

- Grafana dashboard z danymi we wszystkich panelach
- Prometheus → Status/Targets z jobem `gastrohub-api` w statusie **UP**

