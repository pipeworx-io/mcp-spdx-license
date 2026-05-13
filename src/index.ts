interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * SPDX License List MCP
 *
 * Auth: none.
 * Source: https://github.com/spdx/license-list-data (raw.githubusercontent.com mirror).
 */


const BASE = 'https://raw.githubusercontent.com/spdx/license-list-data/main/json';
const UA = 'pipeworx-mcp-spdx-license/1.0 (+https://pipeworx.io)';

type LicenseEntry = {
  reference: string;
  isDeprecatedLicenseId: boolean;
  detailsUrl: string;
  referenceNumber: number;
  name: string;
  licenseId: string;
  seeAlso: string[];
  isOsiApproved: boolean;
  isFsfLibre?: boolean;
};

let LIST_CACHE: { at: number; licenses: LicenseEntry[]; releaseDate: string; licenseListVersion: string } | null = null;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const tools: McpToolExport['tools'] = [
  {
    name: 'list_licenses',
    description: 'List SPDX licenses with optional filters (OSI-approved, FSF Free/Libre, deprecated).',
    inputSchema: {
      type: 'object',
      properties: {
        osiApproved: { type: 'boolean' },
        fsfLibre: { type: 'boolean' },
        deprecated: { type: 'boolean', description: 'Include deprecated. Default false.' },
      },
    },
  },
  {
    name: 'get_license',
    description: 'Get metadata + descriptors for one SPDX license id (e.g. "MIT", "Apache-2.0", "GPL-3.0-or-later").',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id'],
    },
  },
  {
    name: 'get_license_text',
    description: 'Get the full license text for a single SPDX license id (returns standard text + cross-references).',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id'],
    },
  },
  {
    name: 'search',
    description: 'Substring search across SPDX id and full license name (case-insensitive).',
    inputSchema: {
      type: 'object',
      properties: { query: { type: 'string' } },
      required: ['query'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'list_licenses': {
      const data = await loadList();
      const includeDeprecated = args.deprecated === true;
      const osiFilter = args.osiApproved as boolean | undefined;
      const fsfFilter = args.fsfLibre as boolean | undefined;
      const filtered = data.licenses.filter((l) => {
        if (!includeDeprecated && l.isDeprecatedLicenseId) return false;
        if (osiFilter !== undefined && l.isOsiApproved !== osiFilter) return false;
        if (fsfFilter !== undefined && (l.isFsfLibre ?? false) !== fsfFilter) return false;
        return true;
      });
      return {
        licenseListVersion: data.licenseListVersion,
        releaseDate: data.releaseDate,
        count: filtered.length,
        licenses: filtered.map((l) => ({
          licenseId: l.licenseId,
          name: l.name,
          isOsiApproved: l.isOsiApproved,
          isFsfLibre: l.isFsfLibre ?? false,
          isDeprecatedLicenseId: l.isDeprecatedLicenseId,
          reference: l.reference,
        })),
      };
    }
    case 'get_license': {
      const id = reqStr(args, 'id', '"MIT"');
      return fetchDetails(id);
    }
    case 'get_license_text': {
      const id = reqStr(args, 'id', '"MIT"');
      const details = (await fetchDetails(id)) as Record<string, unknown>;
      return {
        licenseId: details.licenseId,
        name: details.name,
        licenseText: details.licenseText,
        standardLicenseHeader: details.standardLicenseHeader ?? null,
        seeAlso: details.seeAlso ?? [],
      };
    }
    case 'search': {
      const q = reqStr(args, 'query', '"apache"').toLowerCase();
      const data = await loadList();
      const matches = data.licenses.filter(
        (l) => l.licenseId.toLowerCase().includes(q) || l.name.toLowerCase().includes(q),
      );
      return { query: q, count: matches.length, results: matches };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function loadList() {
  const now = Date.now();
  if (LIST_CACHE && now - LIST_CACHE.at < CACHE_TTL_MS) return LIST_CACHE;
  const res = await fetch(`${BASE}/licenses.json`, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  if (!res.ok) throw new Error(`SPDX list: ${res.status}`);
  const json = (await res.json()) as { licenses: LicenseEntry[]; releaseDate: string; licenseListVersion: string };
  LIST_CACHE = { at: now, ...json };
  return LIST_CACHE;
}

async function fetchDetails(id: string): Promise<unknown> {
  const res = await fetch(`${BASE}/details/${encodeURIComponent(id)}.json`, {
    headers: { Accept: 'application/json', 'User-Agent': UA },
  });
  if (res.status === 404) throw new Error(`SPDX: license id "${id}" not found. Try /search first.`);
  if (!res.ok) throw new Error(`SPDX: ${res.status} ${await res.text().then((t) => t.slice(0, 200))}`);
  return res.json();
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) {
    throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  }
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
