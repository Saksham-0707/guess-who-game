# Guess Who Hub

Real-time multiplayer Guess Who built with React, TypeScript, Vite, Tailwind CSS, and Socket.IO.

## Scripts

- `npm run dev`: start the frontend dev server
- `npm run server`: start the local Socket.IO backend from `server-reference/server.cjs`
- `npm run build`: create a production build
- `npm run preview`: preview the production build locally
- `npm run test`: run tests

## Environment

Create a `.env` file with:

```env
VITE_SOCKET_URL=https://your-server-url.example.com
```

For local multiplayer development, run the local backend and point `VITE_SOCKET_URL` at `http://localhost:3001` if needed.

## Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Socket.IO

## Notes

- The frontend expects a compatible Socket.IO backend.
- The reference backend lives at `server-reference/server.cjs`.
- If frontend and backend features seem out of sync, verify both are running the same game protocol.
