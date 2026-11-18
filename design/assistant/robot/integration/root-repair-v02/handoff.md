# Bounded root focus and attention repair

18 November 2026. Root repaired the two source findings from review/root-assembly-g4/review.md. The attempted Orca repair worker never started; this is coordinator-authored work, not a worker delivery. No G2/asset/UI/CSS/transport/navigation helper was changed. Independent recheck and a fresh integrated build/browser route test remain required.

## Changes

- The optional robot attention hint is false while a project is modal, regardless of stale Ask focus/hover feedback.
- When opening a new assistant modal, root blurs the currently focused HTML element before showModal records its native return target. Root focuses the substantive heading in the same commit and remains the sole owner of ordinary Ask return. Source/history close therefore does not receive an unwanted native return to the previous invoker. Project-only modal opening is unchanged; assistant-to-project takeover keeps the same dialog open. No temporary disabled/inert attributes, alternate modal mechanism or delayed callbacks were introduced.

## Regression evidence

Original source `d65b4aeb2f00af40700ebb90e42087a267d6135c520c37582a12f4ffc39f3403` and test `f40a7789d001f43b52e7eaee9a58a94a9c4912a537ab22dd73adb88d09d68ecd` are preserved here as before.txt copies. before-checks.json records the independent suite failing its two findings. The test DOM port was then extended with HTMLElement/blur and a nonfocusable body fallback; port-checks.json records that the SAME two original scenarios still fail before any application change. The port expansion did not waive either assertion.

After the root fix, all18 integration cases pass, including two added native-restoration-model cases: history close leaves Ask reusable without returning it, and ordinary close from another focused room control goes directly to Ask without an intermediate restoration. The original ordinary Close, project takeover, route clearing and epoch/race cases remain. Direct nonincremental full TypeScript and scoped ESLint also pass. Commands/exits and exact hashes are in after-checks.json and corresponding logs.

Current root SHA256: `1c1af8cc3bd9a77a108d9ff21cd9cad09056c0c31755db61db887bf6b97923ca`.

Current durable test SHA256: `4678443279847c541c63a163461b106a58cf524f73c5f71561f1ccda79c70812`.

## Native browser primitive and limits

native-dialog-probe.mjs was executed on the owned Chromium150 preview page; its JSON records the actual native positive control returning the invoker on close, the blur-before-show policy producing zero intermediate focusin events and no invoker return, and an explicit ordinary return successfully focusing the button. Probe elements/listener were removed and prior focus restored. This is a real native primitive observation, separate from the CPU hook/DOM port.

The closed probe's activeElement remains its H2 until another focus/navigation action; no claim is made that this isolated probe establishes destination focus. The current4193 app build still contains the pre-repair root. Native React commit/default-action ordering, source-route/history destination focus and full app keyboard behavior must be checked against a NEW build after the parallel UI repair settles. No final browser acceptance, screen-reader or device claim is implied.
