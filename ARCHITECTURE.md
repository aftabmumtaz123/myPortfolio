# DevStak production architecture

## Applications

### Public website
`apps/web`

- React + TypeScript + Vite
- Premium DevStak marketing/case-study UI
- Project inquiry form posts to the API
- Can consume published projects/services/technologies from the API

### Admin
`apps/admin`

- Separate React + TypeScript + Vite application
- Private login screen
- Dashboard
- Leads
- Projects / case studies
- Services
- Technology stack
- Testimonials
- Blog/content
- Media
- Settings

### API
`server`

- Node.js + Express
- Helmet + CORS + cookie parser
- Zod request validation
- JWT in an HttpOnly cookie for admin sessions
- Public endpoints for website content and lead submission
- Protected admin endpoints for content/CRM operations

### Database
`prisma/schema.prisma`

- PostgreSQL on Supabase
- Prisma ORM
- Relational models for projects, technologies, leads, notes, testimonials, blog content, media and settings

## Recommended production domains

- `devstak.com` → public website
- `admin.devstak.com` → admin app
- `api.devstak.com` → Express API
- Supabase → PostgreSQL
- Cloudinary → images/media

## Production hardening checklist

- Replace seed password immediately.
- Use a long random `JWT_SECRET`.
- Restrict CORS to the exact website/admin domains.
- Use HTTPS everywhere.
- Add rate limiting to login and lead submission endpoints.
- Add email notification when a new lead arrives.
- Add Cloudinary signed upload endpoint for admin media.
- Add audit logs for admin mutations.
- Add role checks when more team members are added.
- Add backups and database monitoring in Supabase.
