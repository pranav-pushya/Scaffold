# Scaffold — Standing Instructions for AI Coding Agents

These are persistent project rules. Follow them on every task in this repo, automatically — the user should not need to repeat them in each prompt.

## Rule 1: Always update `report.md` after any code change

After completing ANY task that changes code, behavior, architecture, or fixes a bug in this project, you MUST also update `report.md` in the project root, in the same response:

1. Identify which section the change belongs to:
   - A bug found and fixed → **Section 6: Bug Log** (add a new numbered entry, following the existing format: What happened / Fix, or Symptom / Diagnosis / Fix for anything non-trivial)
   - A new feature or page added → **Section 8: Feature Log**
   - A change to routing, state management, or the React migration itself → **Section 9: React Migration Log**
   - A deployment → **Section 7: Deployment History**
   - A newly discovered limitation or tradeoff → **Section 10: Known Limitations**

2. Write the entry in the same voice and level of detail as the existing entries — specific enough that someone reading it later (including the user in a viva) understands what broke, why, and how it was actually fixed. Do not write vague entries like "fixed a bug" — name the actual symptom and root cause.

3. If a task is still incomplete, partially working, or has a known caveat, say so explicitly in the entry (e.g. "UI only, not yet wired to Firestore" or "untested on mobile"). Do not mark something as done/working/complete unless you have actually verified it — this project has a documented history (see Section 6.2, 6.3) of a prior agent falsely marking mocked/broken features as "DONE," which caused real problems. Do not repeat that mistake.

4. Keep `report.md` accurate to the CURRENT state of the code, not aspirational. If a change makes an existing report entry outdated or wrong, correct that entry rather than leaving stale/contradictory information.

5. Update **Section 11: Open Items** — check off anything just completed, and add any new follow-up work the change surfaced.

## Rule 2: Do not overclaim status labels

Before writing or leaving any UI text or report entry that claims something is "real-time," "synced," "secure," "verified," "complete," or similar — confirm it against the actual code (e.g. don't say "Realtime Active" unless `onSnapshot` is genuinely used; don't say a feature is "DONE" without tracing the code path). This project has been burned by this exact failure mode before.

## Rule 3: Branch and ownership awareness

- Tiksha owns UI/styling files, Tammana owns routing/forms/page-logic files, Pranav owns firebase/state/AI/deployment files (see `report.md` Section 3 for the current file-ownership map). Before editing a file outside your current task's obvious scope, note it in your response so the user can flag it to the right teammate.
- Never commit `.env` or any real API key/credential.

---

*This file is read automatically by supported coding agents. If your current tool does not auto-load project rule files, paste this file's contents into your first message of a session as a standing instruction.*
