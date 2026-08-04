# @pipeworx/spdx-license

SPDX License List MCP — canonical list of open-source software licenses with metadata and full license text. Keyless.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

- `list_licenses(osiApproved?, fsfLibre?, deprecated?)` — list SPDX licenses with optional filters
- `get_license(id)` — metadata for a single license by SPDX identifier (e.g. `MIT`, `Apache-2.0`)
- `get_license_text(id)` — full license text (Markdown when available, plain text otherwise)
- `search(query)` — substring search across SPDX id and full name

## Data source

`https://raw.githubusercontent.com/spdx/license-list-data/main/json/licenses.json` and the per-license `json/details/<id>.json` files.

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "spdx-license": {
      "url": "https://gateway.pipeworx.io/spdx-license/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Spdx License data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
