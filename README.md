This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Authentication

Better Auth handles authentication, backed by Drizzle ORM and PostgreSQL.

1. Copy `.env.example` to `.env` and fill in `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (usually `http://localhost:3000` during development), and `DATABASE_URL`.
2. Make sure your database is reachable, then generate the Better Auth schema:

   ```bash
   npm run auth:generate
   ```

3. Apply the generated schema to the database with Drizzle:

   ```bash
   npm run db:push
   ```

4. Start the dev server with `npm run dev`. The Better Auth router is mounted at `/api/auth/[...all]`, and the React client is available via `authClient` in `lib/auth-client.ts`.

### Hidden admin route

The admin login page still lives at `/admin/login`, but it's now powered by Better Auth email/password flows. Anyone who knows the route can either create an account or sign in, and on success they are redirected to `/admin`. Use your database to manage accounts and revoke access when needed.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
