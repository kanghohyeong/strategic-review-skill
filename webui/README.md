# strategic-review-webui

Web UI server for reviewing strategic reports stored in `.strategic/` directory.

## Installation

```bash
npm install -g strategic-review-webui
```

## Usage

Run the server in any directory that contains a `.strategic/` folder:

```bash
strategic-review-webui
```

Or with a custom port:

```bash
strategic-review-webui --port 8080
```

Then open `http://localhost:3000` in your browser.

## npx (no installation)

```bash
npx strategic-review-webui
```

## Requirements

- Node.js >= 18
- `.strategic/` directory with `.md` report files
