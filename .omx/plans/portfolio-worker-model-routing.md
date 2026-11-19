# Portfolio worker model routing

15 November 2026. User authorizes the coordinator to choose the model and thinking effort for every new Claude and Codex worker, prioritizing excellent results at the higher end needed for the task without wasting tokens. This supersedes the earlier no-model-override instruction for this project. Global settings and already-running workers are unchanged.

Design, Blender modeling, appearance and visual critique remain actual Claude work. Technical implementation, testing, evidence collection and integration remain actual Codex work. These are task recommendations, not measured portfolio-specific model rankings.

| Task | Model | Effort |
| --- | --- | --- |
| Art direction, coherent asset families, consequential visual critique | `claude-opus-5-5` | `high` |
| Difficult coupled composition/lighting/framing constraints or a stalled artistic approach | `claude-fable-5-2` | `high`; `xhigh` for a concrete hard unresolved problem |
| Bounded visual fixes or repeated props under an approved prescription | `claude-sonnet-5-5` | `medium`; `high` if visual judgment or interactions between constraints remain |
| General technical implementation, integration and substantive regression tests | `gpt-6.1-sol` | `high` |
| Architecture, difficult root-cause debugging, provenance/resource correctness and independent adversarial review | `gpt-6-astra` | `high`; `xhigh` for difficult cross-cutting failure analysis |
| Browser/computer-use verification and visually intensive technical inspection | `gpt-6.1-terra` | `high`; `medium` for a fully specified repeated capture |
| Focused file lookup, simple inventory and factual evidence extraction | `gpt-6.1-sol` | `medium`; a fixed-low native explore role is sufficient for mechanical read-only inventory |

Use high effort for substantive work. Use medium where inputs, output and acceptance criteria are already narrow. Max/ultra are exceptional, not defaults; a justification must name the unresolved difficulty and expected benefit. More reasoning does not replace actual render inspection, tests, or correct task decomposition. Give the worker only the relevant context and an explicit deliverable/stop condition. Do not spin up extra reviewers or repeat passing checks merely to consume a stronger model.

## Dispatch and verification

1. Record task class, exact model ID, effort, short reason, owned paths, acceptance evidence and stop condition before dispatch.
2. For a fresh Orca worker, use `worker-start --agent <claude|codex> --model <exact-id> --effort <level>` with the existing Task/Run/workspace contract. The user's explicit delegation authorizes choosing IDs, including Codex models.
3. Record the receipt and current worker ACK. Distinguish requested configuration from verified effective configuration. Check applicable environment/config caps; Claude's `CLAUDE_CODE_EFFORT_LEVEL` can override a launch flag. Never translate internal numeric effort into a percentage.
4. `--model`/`--effort` cannot combine with `--terminal` reuse. Preserve the actual inherited settings of an already-running/reused session and record them; do not claim the new task changed its model. Use a fresh supported launch when a different model is materially needed, without bypassing hook/approval gates or resetting failed-task history.
5. For native Codex helpers, use supported installed role routing. Explicit model choices require a self-contained `fork_turns=none` task. Honor fixed role model/effort constraints; use Orca if the chosen pair cannot be represented honestly by the native role.
6. Escalate capability/effort for demonstrated difficulty; do not keep retrying a weak assignment. Do not restart a working agent solely to standardize settings.

## Current next assignments

- FKT-1 provenance/stage-validation repair: actual Codex `gpt-6-astra`, `high`. This small change protects the real asset acceptance boundary and needs meaningful mutation-sensitive regressions. The original technical owner supplies context; a fresh launch uses the explicit settings above.
- Independent technical rereview: `gpt-6-astra`, `high` for a new worker; preserve the recovered live reviewer's actual inherited configuration if it continues the same review.
- M2 workstation art: actual Claude `claude-opus-5-5`, `high`, with M1 geometry conditions and a bounded stage handoff.
- Subsequent stage/review choices are selected separately using the table, not inherited blindly from the coordinator.

## Verified controls and references

Installed Orca `worker-start --help` confirms explicit model/effort launch flags and the existing-terminal restriction. Claude Code 2.1.325 advertises low/medium/high/xhigh/max. Codex 0.169.0 model catalog refreshed 2026-11-15 lists Sol6.1, Astra6 and Terra6.1 with low through ultra. Root process/user/machine Claude effort environment override was absent when checked; worker-specific effective values still need evidence.

- https://code.claude.com/docs/en/model-config
- https://platform.claude.com/docs/en/build-with-claude/effort
- https://www.anthropic.com/claude-fable-and-mythos-5-2
- https://www.anthropic.com/claude-sonnet-5-5
- https://developers.openai.com/api/docs/models
- https://learn.chatgpt.com/docs/config-file/config-reference
