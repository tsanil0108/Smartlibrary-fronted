# Smart Library frontend — premium edition

React 18 / Vite 6. Indigo, purple, orange and white theme. Existing public catalogue, authentication, circulation and administration retained; new member and admin routes added.

## Run
1. Start Spring Boot on localhost:8080.
2. Open a terminal in this frontend directory.
3. `npm install`
4. `npm run dev`
5. Open http://localhost:5173.

Vite proxies `/api` to localhost:8080. For a separate API host, set `VITE_API_URL` to its full `/api/v1` base URL before building. Authentication uses sessionStorage as in the original project.

## Structure
- `src/pages/public`: public catalogue, details, login and home
- `src/pages/member`: dashboard, account, reservations, card, payments, reviews, analytics and support
- `src/pages/admin`: existing admin tools plus reservations, fines, coupons, card verification and moderation
- `src/pages/shared`: shared circulation and original admin dashboard
- `src/components/member`: reusable feature controls and book actions
- `src/styles/member`, `src/styles/admin`: page-specific styles; common theme in `premium.css`

## Verification and limitations
JS/JSX syntax and relative imports checked using TypeScript parser. npm install was blocked by DNS/network access in the generation environment, so Vite build and live API testing remain pending. New API paths follow the backend code discussed in chat, not a live OpenAPI contract. The dashboard uses real API responses, a CSS hero illustration and CSS borrowing chart; book covers use the existing fallback if the API has no image. QR download is QR-only; print uses browser printing. Admin verification accepts a pasted/scanner-entered token, not camera scanning. No standalone notification module. Fine settlement is admin-only. Demo coupon checkout collects no real money.

## Local image assets
Banner and reading corner are cropped from the approved generated design. Logo, avatar and generic book fallback are local SVGs. Actual book covers use the API coverUrl when present. No external decorative image URLs required.
