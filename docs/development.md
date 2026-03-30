# Development & Contribution

## Local Development

- Use `pnpm dev` to start the server with hot reload
- Edit `.env` for local DB credentials and secrets
- Code is written in TypeScript (see `src/`)

## Project Structure

- `src/` — Main source code
- `migrations/` — DB migration scripts
- `dist/` — Compiled output (ignored in VCS)
- `docs/` — Documentation

## Coding Guidelines

- Use TypeScript strict mode
- Follow existing code style and naming
- Write clear, concise comments
- Validate all user input
- Use async/await for async code

## Testing

- Add tests for new features (if test framework is set up)
- Manual testing via Postman or similar is recommended

## Contributing

- Fork and branch from `main`
- Open a pull request with a clear description
- Ensure code passes lint and builds
