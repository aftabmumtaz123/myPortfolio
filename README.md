# DevStak Platform

## Run the complete local stack

1. Install dependencies from the project root:

```bash
npm install
```

2. Configure `server/.env` with your PostgreSQL, JWT and Cloudinary values.

3. Generate Prisma client and sync the database:

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

4. Start API + admin + public website together:

```bash
npm run dev
```

This starts:

- API: `http://localhost:4000`
- Public website: `http://localhost:5173`
- Admin: `http://localhost:5174`

If you prefer separate terminals:

```bash
npm run dev:server
npm run dev:admin
npm run dev:web
```

### Admin login

The seed creates:

- Email: `admin@devstak.local`
- Password: `ChangeMeBeforeProduction!123`

Change the password before production.

### Project slug conflicts

Project slugs are unique because they are used in public URLs. If an existing project already uses a slug, the admin form now shows a clear conflict message. New project slugs are automatically made unique when generated from the project title.

### Health check

Open `http://localhost:4000/health` to verify API, PostgreSQL and Cloudinary configuration.


## Project case study gallery
Projects now support `galleryImages` and `highlights` arrays in Prisma. After updating this version, run `npm run db:generate` and `npm run db:push` once so the new project fields exist. Project pages are full-page case studies with a sticky section navigator, Cloudinary gallery/lightbox, challenge/solution sections, technology stack, testimonials, related work, and a project CTA.
