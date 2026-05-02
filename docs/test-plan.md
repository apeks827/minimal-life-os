# Test Plan

- Unit: shared schemas, language detection, classifier fallback, planner heuristics.
- Integration: inbox classify/create flow and AI failure handling.
- E2E: signup/login, onboarding, Russian inbox submit, Today Plan visibility, language switch, AI settings.
- Manual: `/api/health` returns OK and the app remains usable without AI credentials.

## Added coverage
Playwright now covers home classification, suggestion cloud visibility, language switch, onboarding save, Advanced Settings update, and structured health response. Unit tests cover expanded schemas, RU/EN classifier examples, planner, suggestions, and fallback behavior.
