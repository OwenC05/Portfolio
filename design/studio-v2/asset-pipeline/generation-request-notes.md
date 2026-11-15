# Generation request — tool visibility and source notes

14 November 2026. Claude art author, task `task_2db318b9a465`. Preparation only: **no job submitted, nothing uploaded, no credit spent, no site or configuration change.** The only files written are `generation-request.json` and this note.

## Request file

- `design/studio-v2/asset-pipeline/generation-request.json`
- SHA-256 `75ac529377bd0f7a3b69c03f919abc6714e9f0ee844f678e5d6b369d7cfa819c`, 15,558 bytes, parsed with `JSON.parse` in Node.
- Prompt lengths: Higgsfield 2,486 characters; Meshy 799 characters (tool limit 800).

## What I called (all read-only)

| Call | Result |
| --- | --- |
| Tool search for Higgsfield and Meshy | Both servers connected in this session; schemas for `generate_image`, `models_explore`, `balance`, `meshy_text_to_3d`, `meshy_check_balance` loaded. |
| Higgsfield `models_explore` get `gpt_image_2_6` | Model exists: GPT Image 2.6, OpenAI. Parameters quality, resolution, background, batch_size, output_format, size; reference role `image_references` (unused). Unlimited allowance reported unavailable. |
| Higgsfield `balance` | 1157.25 credits, plan `plus`. |
| Meshy `meshy_check_balance` | 75 credits (70 monthly, 5 permanent, monthly reset 1 December 2026). |

Not called: any generation tool, including `generate_image` with `get_cost`. The Higgsfield 2.75 figure is therefore still root's quote, not mine. Meshy has no cost-preflight call; its 5-credit figure comes from the tool description and server instructions.

## Things root should know before approving

1. **Image size.** The catalogue says dimensions "must divide by 16". 1440 does, 900 does not. The sentence sits next to the GIF default, so it may be GIF-only, and root's cost preflight accepted 1440×900 — but a cost preflight may not validate size. Check the requote for a rejection or `adjustments`. Prepared substitute: `1920x1200`, which needs its own quote.
2. **No negative-prompt field** on either tool. Constraints are written into the prompts.
3. **16:10 is not a listed aspect ratio**; the request sends an explicit size and omits `aspect_ratio`.
4. **Meshy Smart Topology is triangle-only** and `symmetry_mode` is deprecated. The earlier draft in `pilot-right-limit/generation-prompts.md` asked for quad-dominant topology and symmetry on; the request drops both.
5. **Model choice `meshy-t2.5`** is mine; `meshy-t2` is the same listed price.
6. Higgsfield `folder_id` is omitted so no project or folder is created.

## Limits of this check

- Open Design MCP failed to connect in this session (timeout). Not needed here.
- Blender tools are listed but I did not call them; not needed here.
- I did not open the private room photo or any capture for this task.
- Tool availability was confirmed for this session only; a fresh session can race server startup.
