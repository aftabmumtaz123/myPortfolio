# Team Directory Update

- Added `TeamMember` Prisma model with Cloudinary photo URL, social links, sort order and featured visibility.
- Added authenticated admin CRUD endpoints at `/api/admin/team`.
- Added public endpoint `/api/team` returning featured members only.
- Added Admin > Team section with Cloudinary upload and custom delete confirmation.
- Added public `/team` page and Team navigation link.
- Project deletion now uses a custom confirmation modal instead of `window.confirm`.

Run `npm install`, `npm run db:generate`, and `npm run db:push` after extracting.
