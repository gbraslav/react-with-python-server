# Tech Spec

## Frontend

| Technology | Version | Role |
|---|---|---|
| React | ^19.2.4 | UI framework |
| TypeScript | ~5.9.3 | Type-safe JavaScript |
| Vite | ^8.0.0 | Dev server and bundler |
| @vitejs/plugin-react | ^6.0.0 | React JSX transform (via Oxc) |

IMPORTANT: All UI will used shadcn-ui. no custom components

## Backend

| Technology | Version | Role |
|---|---|---|
| Python | 3.13 | Runtime |
| Flask | >=3.0.0 | REST API server |
| flask-cors | >=4.0.0 | Cross-origin request support |

## Dev Tooling

| Tool | Version | Role |
|---|---|---|
| concurrently | ^9.2.1 | Run frontend and backend together via `npm run dev` |
| ESLint | ^9.39.4 | Linting (flat config format) |
| typescript-eslint | ^8.56.1 | TypeScript-aware lint rules |
| eslint-plugin-react-hooks | ^7.0.1 | Enforce React hooks rules |
| eslint-plugin-react-refresh | ^0.5.2 | Vite HMR compatibility checks |

## Project Structure

```
react-with-python-server/
├── src/                  # React frontend source
│   ├── App.tsx           # Main component
│   ├── main.tsx          # Entry point
│   ├── App.css           # Component styles
│   └── index.css         # Global styles
├── server/
│   ├── app.py            # Flask application
│   ├── requirements.txt  # Python dependencies
│   └── .venv/            # Python virtual environment
├── public/               # Static assets
├── _specs/               # Feature and tech specs
├── vite.config.ts        # Vite configuration
├── package.json          # Node dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## Dev Ports

| Service | Port |
|---|---|
| Vite (frontend) | 5173 |
| Flask (backend) | 5001 |

Vite proxies all `/api/*` requests to `http://localhost:5001`.

## npm Scripts

| Script | Command |
|---|---|
| `npm run dev` | Start both Vite and Flask via concurrently |
| `npm run dev:frontend` | Start Vite only |
| `npm run dev:server` | Start Flask only (`server/.venv/bin/python server/app.py`) |
| `npm run build` | Type-check and build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build locally |

## Python Environment Setup (one-time)

```bash
python -m venv server/.venv
source server/.venv/bin/activate
pip install -r server/requirements.txt
```
