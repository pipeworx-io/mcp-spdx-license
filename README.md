# mcp-spdx-license

SPDX License List MCP

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 673+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `list_licenses` | List SPDX licenses with optional filters (OSI-approved, FSF Free/Libre, deprecated). |
| `get_license` | Get metadata + descriptors for one SPDX license id (e.g. "MIT", "Apache-2.0", "GPL-3.0-or-later"). |
| `get_license_text` | Get the full license text for a single SPDX license id (returns standard text + cross-references). |
| `search` | Substring search across SPDX id and full license name (case-insensitive). |

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

Or connect to the full Pipeworx gateway for access to all 673+ data sources:

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

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
