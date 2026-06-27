# Spec: Vendor SSE Online Risk

## Objective
Fix the remaining online SSE risk for the vendor portal. After login, the browser must be able to connect to `/vendor/prod-api/resource/sse` without console 502 errors or MIME mismatch errors.

## Tech Stack
- Frontend: Vue 3, Vite, `@vueuse/core` `useEventSource`
- Backend: Spring Boot `SseEmitter` at `/resource/sse`
- Deployment: GitHub Actions CD writes Nginx proxy config for `/vendor/prod-api/`

## Commands
- Vendor UI unit tests: `npm run test:unit`
- Vendor UI build: `npm run build:prod`
- Vendor backend package, if backend changes: `mvn -Pprod -pl ruoyi-admin -am package -DskipTests`
- Online probe: browser `EventSource('/vendor/prod-api/resource/sse?...')` must open without MIME or 502 errors

## Project Structure
- `vendor-ui/src/utils/sse.ts`: browser SSE client
- `vendor-ui/src/layout/index.vue`: initializes SSE after login layout mounts
- `vendor-ui/.github/workflows/cd.yml`: writes online Nginx proxy locations
- `vendor-backend/ruoyi-common/ruoyi-common-sse`: Spring SSE endpoint and emitter manager

## Code Style
Nginx proxy blocks should keep general API behavior unchanged and apply SSE-specific behavior only to `/resource/sse`:

```nginx
location /vendor/prod-api/resource/sse {
    proxy_pass http://127.0.0.1:18000/resource/sse;
    proxy_buffering off;
    proxy_read_timeout 1d;
}
```

## Testing Strategy
- Unit/build tests protect the vendor UI package after deployment script changes.
- Deployment health check must verify the dedicated Nginx SSE proxy configuration in addition to `/auth/code`.
- Browser verification must inspect response headers and console messages, confirming no `EventSource` MIME mismatch or SSE 502 remains.

## Boundaries
- Always: preserve existing `/vendor/prod-api/` proxy behavior for normal REST APIs.
- Always: keep SSE authentication compatible with the existing query-string token flow.
- Ask first: adding a new runtime dependency or changing auth/session policy.
- Never: disable SSE silently without documenting it as a product decision.
- Never: mask browser errors by suppressing console logs while the connection still fails.

## Success Criteria
- Online `/vendor/prod-api/resource/sse` returns `Content-Type` containing `text/event-stream` for a valid logged-in token.
- Nginx does not buffer or prematurely close the SSE stream.
- Browser console has no new `EventSource's response has a MIME type ("text/plain")` errors after a fresh vendor login.
- Browser console has no new `/vendor/prod-api/resource/sse` 502 errors after a fresh vendor login.
- Existing vendor pages and normal `/vendor/prod-api/` API proxy checks still pass.

## Open Questions
- None. The remaining risk is bounded to the SSE online proxy/runtime behavior observed during vendor portal verification.
