# Limitations

- The current web app is an MVP shell with local heuristic classification; production Supabase writes and auth screens are prepared but not fully wired.
- Mobile is an Expo Router skeleton that shares copy/types and validates with TypeScript; native EAS builds need real project credentials.
- AI provider calls are intentionally optional; `OPENAI_API_KEY` enables future provider integration, while fallback keeps capture usable.
- RLS is enabled in migrations, but fine-grained policies should be expanded before production launch.
