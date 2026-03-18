# Plan: Dashboard Charts & Data Table

## Context
Implement the dashboard feature from `_specs/dashboard-charts-data-table.md`: a paginated data table + 4 charts (line, bar, combo, venn) in a 2x2 grid, all powered by a single Flask API returning 20 hard-coded rows. All UI uses shadcn-ui. Charts reflect current page data only.

## Data Shape
```
{ id, data_field1 (number), data_field2 (number), data_field3 (number), data_field4 (string) }
```

## Parallel Execution Plan

### Phase 1 — Three parallel tracks

**Track A: Backend** — Add `GET /api/GetChartData` to `server/app.py` with 20 hard-coded rows

**Track B: Frontend Setup** — Install and configure shadcn-ui:
1. Install Tailwind CSS v4 + `@tailwindcss/vite` plugin
2. `npx shadcn@latest init` (neutral theme, white background)
3. Add shadcn components: `table`, `card`, `button`, `pagination`, `chart`
4. Update `vite.config.ts` (tailwind plugin) and `tsconfig.app.json` (`@/` path alias)

**Track C: Test Setup** — Install `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`; create `vitest.config.ts`

### Phase 2 — Data layer + UI components (after Phase 1)

**Track D: Data Layer**
- `src/lib/types.ts` — `ChartRow` type
- `src/lib/api.ts` — fetch wrapper for `/api/GetChartData`

**Track E: UI Components** (parallel with each other, after D completes)
- `src/components/DataTable.tsx` — shadcn table, receives page data as prop
- `src/components/LineChart.tsx` — data_field1 line chart (shadcn chart + recharts)
- `src/components/BarChart.tsx` — data_field2 bar chart
- `src/components/ComboChart.tsx` — data_field3 line+bar chart
- `src/components/VennDiagram.tsx` — custom SVG venn (data_field1 & data_field2 overlap by median threshold)
- `src/components/ChartGrid.tsx` — 2x2 grid importing the 4 chart components

### Phase 3 — Integration (after Phase 2)

- `src/components/Dashboard.tsx` — fetches data, manages pagination state, slices `currentPageData`, passes to DataTable + ChartGrid
- Update `src/App.tsx` to render `<Dashboard />`
- Update `src/index.css` for white theme overrides

### Phase 4 — Tests (after Phase 3)

- `test/Dashboard.test.tsx` — API called once on load, error/empty states
- `test/DataTable.test.tsx` — renders 10 rows, pagination works
- `test/ChartGrid.test.tsx` — all 4 charts render with valid data

## Key Decisions
- **Pagination state** lives in Dashboard.tsx: `allData.slice((page-1)*10, page*10)`
- **Venn diagram**: simple SVG (2 circles), overlap = rows where both field1 and field2 exceed their page median — no extra library
- **shadcn chart** wraps Recharts with consistent theming via `<ChartContainer>`
- **White theme**: shadcn neutral base + `--background: 0 0% 100%`

## Files Modified/Created
| File | Action |
|---|---|
| `server/app.py` | Add `/api/GetChartData` endpoint |
| `vite.config.ts` | Add Tailwind plugin |
| `tsconfig.app.json` | Add `@/*` path alias |
| `src/index.css` | White theme CSS variables |
| `src/App.tsx` | Replace with `<Dashboard />` |
| `src/lib/types.ts` | New — ChartRow type |
| `src/lib/api.ts` | New — fetch wrapper |
| `src/components/ui/*` | New — shadcn generated components |
| `src/components/Dashboard.tsx` | New — main page |
| `src/components/DataTable.tsx` | New — paginated table |
| `src/components/LineChart.tsx` | New — line chart |
| `src/components/BarChart.tsx` | New — bar chart |
| `src/components/ComboChart.tsx` | New — combo chart |
| `src/components/VennDiagram.tsx` | New — SVG venn |
| `src/components/ChartGrid.tsx` | New — 2x2 grid |
| `test/Dashboard.test.tsx` | New |
| `test/DataTable.test.tsx` | New |
| `test/ChartGrid.test.tsx` | New |

## Verification
1. `npm run dev` — both servers start
2. Open `http://localhost:5173` — white page, table with 10 rows, 4 charts below
3. Click pagination — table and charts update to show page 2 data
4. `npx vitest run` — all tests pass
