# Meetech – Project Management

Enterprise project management suite for CEO, Project Managers, Team Leads, and Developers.

## Production deployment checklist

1. **Environment**
   - Copy `.env.example` and set all required variables (see below).
   - Set `NEXT_PUBLIC_APP_URL` to your production URL (e.g. `https://app.yourdomain.com`).
   - Use strong secrets: `JWT_SECRET` and `JWT_REFRESH_SECRET` (e.g. `openssl rand -hex 32`).

2. **Database**
   - Ensure `DATABASE_URL` points to your production MongoDB.
   - Run: `npx prisma generate` and `npx prisma db push` (or your migration workflow).
   - Optional: `npx prisma db seed` if you use the seed script.

3. **Build & run**
   - `npm run build` then `npm start`, or deploy to Vercel/Node with the same commands.

4. **Optional**
   - **Email (invites):** Set `RESEND_API_KEY` and `FROM_EMAIL` for invite emails.
   - **Avatars:** Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` for profile avatar uploads.

## Scripts

- `npm run dev` – development
- `npm run build` – production build
- `npm start` – run production server
- `npm run prisma:generate` – generate Prisma client
- `npm run prisma:push` – push schema to DB (MongoDB)
- `npm run prisma:studio` – open Prisma Studio
