# Copilot Instructions for sprintDos

## Project Overview
- This is an Angular 20+ application with a modular structure under `src/app/`.
- The app features user authentication, registration, a real-time chat, a toast notification system, and a game (Ahorcado).
- Supabase is used for authentication, user management, and real-time chat (see `supabase.service.ts`, `auth.service.ts`, `chat.service.ts`).
- Country data is managed via `paises.json` and surfaced in registration and chat features.

## Key Architectural Patterns
- **Standalone Components**: Most components use Angular's standalone API (see `@Component({ standalone: true })`).
- **Services**: All cross-cutting logic (auth, chat, toast, data) is in Angular services, provided in root.
- **Reactive State**: User state is managed with RxJS `BehaviorSubject`/`Observable` (`auth.service.ts`).
- **Real-Time Chat**: Chat uses Supabase's real-time channels and RxJS for message streaming (`chat.service.ts`).
- **Toast Notifications**: Use `ToastService` to trigger UI toasts from anywhere.
- **Country Selection**: Registration and chat display country flags/names using `PaisService` and `paises.json`.

## Developer Workflows
- **Start Dev Server**: `npm start` or `ng serve` (see `package.json`, `.vscode/launch.json`).
- **Run Tests**: `npm test` or `ng test` (Karma/Jasmine, see `src/app/**/*.spec.ts`).
- **Build**: `npm run build` or `ng build` (see `angular.json`).
- **Debug**: Use VS Code launch configs for Chrome (`.vscode/launch.json`).
- **Firebase Hosting**: `firebase.json` configures SPA rewrites for deployment.

## Project-Specific Conventions
- **Component Imports**: Use `imports: [...]` in `@Component` for standalone modules.
- **User State**: Always access user via `authService.user$` observable.
- **Chat**: Use `ChatService` for all chat logic; do not access Supabase directly.
- **Country Data**: Use `PaisService.getPaises()` for country lists; never hardcode country codes/names.
- **Toast**: Use `ToastService.show()` for notifications; do not manipulate toast UI directly.
- **Supabase**: All DB/auth logic goes through `SupabaseService`.

## Integration Points
- **Supabase**: Credentials in `environment.ts`/`environment.prod.ts`. All DB/auth/channel logic is abstracted in services.
- **Firebase Hosting**: SPA routing handled by rewrite to `/index.html`.

## Examples
- To show a toast: `this.toastService.show('Message', 'success')`
- To send a chat message: `this.chatService.sendMessage('text', user.email)`
- To get countries: `this.paisService.getPaises()`

## Key Files
- `src/app/services/` — All core services (auth, chat, toast, supabase, pais)
- `src/app/` — Main components (login, registro, home, ahorcado, chat)
- `src/paises.json` — Country code/name mapping
- `src/app/environments/` — Environment configs (Supabase keys)
- `.vscode/` — Editor/launch config
- `angular.json`, `package.json` — Build/test scripts and config

---
If you add new features, follow the patterns above. For new integrations, create a service and expose observables for state. For UI, prefer standalone components and keep logic in services.
