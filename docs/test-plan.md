# Test Plan

- Unit: shared schemas, language detection, classifier fallback, planner heuristics.
- Integration: inbox classify/create flow and AI failure handling.
- E2E: signup/login, onboarding, Russian inbox submit, Today Plan visibility, language switch, AI settings.
- Manual: `/api/health` returns OK and the app remains usable without AI credentials.
