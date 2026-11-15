# Claude creative tooling setup

Verified 2026-11-14; updated 2026-11-15 in `C:/Users/Owenc/orca/Portfolio`, using Claude Code 2.1.325 and Node 24.21.0.

| Capability | Result |
| --- | --- |
| Local Blender MCP | Installed `fnf-blender-mcp@0.2.2`; Claude connection and actual health call succeeded on Blender 5.2.3 LTS in background mode. |
| Meshy MCP | Registered the existing same-user Meshy service connection; Claude connection and read-only balance call succeeded. No generation or credits spent. |
| Higgsfield remote MCP | Authenticated after explicit public client-ID repair. Fresh Claude connected and catalog tool call succeeded; no generation. |
| Open Design MCP | Installed application identified; current daemon-generated registration connected and 22 tools discovered. Fresh Claude read-only skills/plugin catalog calls passed; catalogs exceed its inline result limit. |
| Orca orchestration | Already installed as a Claude skill junction. Fresh Claude initialization lists `orchestration`; `orca skills get orchestration` succeeds. |

## Changes and rollback

- Added four **local-scope** MCP entries under the Portfolio project in `C:/Users/Owenc/.claude.json`: `higgsfield-use-blender`, `meshy-mcp-server`, `higgsfield`, `open-design`.
- Backed up the original configuration to `C:/Users/Owenc/.claude/backups/claude-before-portfolio-tooling-20261114.json`. It contains private account configuration; do not commit or share it.
- Installed the Blender server under `C:/Users/Owenc/AppData/Local/Higgsfield/blender-mcp`. Its registered entry runs the absolute Node executable and `node_modules/fnf-blender-mcp/dist/index.js`, with `BLENDER_EXECUTABLE=C:/Program Files/Blender Foundation/Blender 5.2/blender.exe`.
- Meshy uses its existing Windows `cmd.exe /d /s /c npx -y @meshy-ai/meshy-mcp-server` configuration and existing Meshy-only environment credential. No credentials are included in this report. No Codex configuration changed.
- No extra Claude plugin installation was required. Existing Orca agent-view, design and Figma plugins were preserved. Unrelated design-plugin connectors requiring authentication were not changed.
- To roll back the registration, run `claude mcp remove <name> -s local` for each of the four names from this project. Prefer this to replacing the full backup, which could discard later concurrent configuration changes. The unused Blender installation can remain on disk.

## Verification evidence

- Official installed CLI help: `claude mcp add --help`, `add-json --help`, `login --help`; all returned successfully.
- Official Higgsfield setup references: `/use-blender/references/installation` and `/use-blender/references/verification`. npm registry latest was 0.2.2; install exited 0. Meshy package README documents Claude `add-json` and Windows stdio setup.
- Blender `doctor` exited 0: `ok: true`, version `5.2.3 LTS`, `background: true`.
- All three registration commands exited 0. `claude mcp list` exited 0 and reported Blender and Meshy connected, Higgsfield needing authentication.
- Fresh non-persistent Claude diagnostic exited 0, with hooks disabled, no built-in execution/edit tools, and only read-only diagnostic MCP calls allowed. It discovered all 21 Blender tools and successfully called `bl_health` and Meshy `meshy_check_balance`. Claude initialization also explicitly included the orchestration skill, despite its prose incorrectly claiming the skill absent.
- That diagnostic incorrectly called scene summary in parallel with health, producing the expected `Blender is busy` response. A second fresh Claude invocation had no Blender tools ready when it answered; therefore fresh-session discovery can race startup and should be confirmed in `/mcp` before work.
- A direct MCP protocol test then initialized the exact registered Blender server, enumerated all 21 tools and called health followed by scene summary **sequentially**. Both returned `ok: true`; summary contained the factory Cube, Light and Camera. The diagnostic MCP process exited 0. This confirms sequential server operation, separately from the successful Claude health call.
- No user scene was opened or edited, no asset generated, no uploads performed, no existing workers restarted, and no production code changed.

## Remaining connection and session steps

`claude mcp login higgsfield --no-browser` is supported by this installed CLI. A non-interactive attempt exited 1 because stdin was not a terminal. The initial worker-owned interactive flow is no longer the handoff target. The coordinator owns all further authentication and final verification.

The coordinator's subsequent consent attempt failed at code exchange with `Existing OAuth client information is required when exchanging an authorization code`. Inspection of field names found no persisted `clientId` for this service; no token values were displayed. The installed 2.1.325 implementation explicitly reads `serverConfig.oauth.clientId` as a supported fallback. The project entry was therefore re-registered using `--client-id https://claude.ai/oauth/claude-code-client-metadata`, the same public client ID already used in its authorization URL, with no secret. Both CLI remove/add commands exited 0; `claude mcp get higgsfield` exited 0 and reports `OAuth: client_id configured`, still `Needs authentication`. Configuration backup: `C:/Users/Owenc/.claude/backups/claude-before-higgsfield-clientid-20261114.json`. The SDK emitted an issuer-stamp diagnostic on this pre-token read; no credential store was manually edited.

The coordinator completed the repaired OAuth flow (exit 0), and `claude mcp get higgsfield` confirmed Connected. A fresh non-persistent Claude CLI with only this MCP configured then returned exit 0, reported connected, discovered `get_preset_instructions`, and called it once with no arguments. Raw tool result had `is_error: false` and returned the preset catalog. No jobs, uploads or generation occurred. Authentication is complete; no further user consent is pending. The [official Claude MCP documentation](https://code.claude.com/docs/en/mcp#use-pre-configured-oauth-credentials) supports explicit public client IDs without a secret.

Existing workers were not interrupted. In their Claude `/mcp` menu, refresh/reconnect the newly registered servers if offered; otherwise save their current work and start a fresh Claude conversation in this exact project. Verify tools are actually available before assigning MCP work. A new Blender connection owns a separate factory scene, not the desktop GUI or another worker's scene. Save outputs explicitly before disconnecting and serialize calls within each Blender session. Blender workflow skills are provided by `bl_list_skills` / `bl_get_skill`; load `blender-scene` before scene edits.


## Design tooling inventory (read-only follow-up)

- `claude plugin list` and `claude plugin details` exited 0: `design@synced` 1.2.0 and `figma@synced` 2.2.157 are loaded, alongside Orca agent-view 0.2.0.
- Design provides seven skills: accessibility-review, design-critique, design-handoff, design-system, research-synthesis, user-research and ux-copy. Figma reports sixteen skills, including design generation, design-to-code, specifications, libraries, motion, shaders and FigJam.
- Existing user skills include web-design-guidelines, writing-guidelines, vercel-react-best-practices, vercel-composition-patterns and vercel-react-view-transitions. Synced user skills include web-artifacts-builder, built-in-browser, chrome-browser and computer-use. Inventory proves presence, not a working browser/native host.
- The claude.ai Figma connector is connected. Duplicate plugin Figma and unrelated design connectors needing authentication were left untouched; they are not prerequisites for local Blender or Meshy work.
- Open Design identity was supplied by the user: `C:/Users/Owenc/AppData/Local/Programs/Open Design/Open Design.exe`, running its installed `resources/app/prebundled/daemon/daemon-cli.mjs mcp` with `ELECTRON_RUN_AS_NODE=1`. Its application data remains in the existing release-stable-win namespace. Initial absence from Claude was a missing registration, not an unknown product.
- The inherited Codex sidecar pipe was stale. An initial copied entry timed out after 30 seconds; direct protocol probe timed out too. A hidden standalone launch disappeared. A supported official `--headless` process kept attached to an execution session then stayed alive (PID 16468, worker execution session 53040); it is intentionally left running. No existing runtime was killed.
- Current `/api/health` reports `ok: true`, version 0.24.1. `/api/mcp/install-info` on the discovered daemon at `http://127.0.0.1:64426` generated the exact current command/environment, using pipe `open-design-sidecar-bb2ddfd9cbfc5db0a4c4333369f71995`. That generated spec replaced the stale project-local Claude entry. No Codex configuration changed.
- `claude mcp get open-design` now reports Connected (exit 0); direct MCP initialize and tools/list passed, enumerating 22 tools. Fresh non-persistent Claude CLI exited 0, reported connected, discovered all 22 tools, and called `list_skills` followed by `list_plugins` once each. Both raw tool results had `is_error: false`. Catalog contents exceeded Claude's inline result limit; item counts were not independently verified, and reported temporary result files were not retained after the non-persistent session. No designs, projects or generation runs were created.
- Pre-change backup: `C:/Users/Owenc/.claude/backups/claude-before-open-design-20261114.json`. Rollback registration with `claude mcp remove open-design -s local`. The headless helper is a live runtime dependency; after a future app/runtime restart, refresh registration from its live `/api/mcp/install-info` rather than copying an old pipe. Do not stop the helper while a worker is using its MCP.
