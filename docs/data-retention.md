# Data Retention

Current MVP state: user data persists until manually deleted in local storage or Supabase tables. This is acceptable for preview, not production.

Production policy to implement:

- Account deletion removes Supabase Auth user and all user-owned rows.
- AI memory reset removes `ai_memories` rows and any vector metadata.
- Export includes profile, settings, onboarding, inbox, entities, suggestions, and memories when enabled.
- Backups/PITR follow Supabase project policy and are disclosed in privacy docs.
- Staging refreshes must anonymize production data.
