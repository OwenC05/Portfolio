# F: foundation and shared contract
Target: establish the /studio implementation foundation. Read .omx/specs/studio-v1/common.md, approved PRD/test spec and latest dependency evidence in context.
Ownership ONLY: package.json, package-lock.json, lib/studio-contract.ts, necessary absent noninteractive ESLint config (.eslintrc.json only if no existing config), design/studio-v1/foundation-report.md. You are not alone; don't revert others. No app/scene/content edits.
1. Inspect baseline. Install EXACT three@0.187.0 and dev @types/three@0.187.0 with npm --save-exact, no force/legacy-peer-deps. Locked React18.3.1/Next14.0.4/TS5.9.2 satisfy known requirements. Preserve unrelated versions as possible and report any unavoidable lock churn.
2. Implement the frozen exports/interfaces/helpers EXACTLY as the PRD. projectIdFromHash accepts only the three known '#project-*' anchors, safely returns null otherwise. Contract has no Three runtime import.
3. Architect confirmed existing ESLint configuration: inspect and reuse it, do not create another. npm ls versions, targeted contract typecheck and baseline npm run lint / npm run build (no broad repairs). Record files present during checks; C may be writing concurrently, so do not call this a pristine baseline without evidence.
4. Record dependency audit output without blanket upgrades. Pre-existing homepage/typecheck/build issues may be captured and classified as baseline rather than requiring wide repairs; installation or new contract errors are blocking and must not be reported succeeded.
5. Write report with exact commands/results and notify coordinator contract frozen. Content worker runs independently and may add a data file concurrently; don't mistake it for your edits or revert it. Follow Orca completion protocol.

