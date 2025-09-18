# Tahoe Night Nurse v2.0

A professional lead-capture website for Lake Tahoe & Truckee families seeking overnight newborn care and for caregivers to apply.

## Features

- Clean, luxury-minimal design with excellent UX
- Parent interest form with validation
- Caregiver application form
- SQLite database for lead storage
- Admin CSV export with basic auth
- Email notifications (optional)
- Rate limiting and security headers
- Mobile-responsive design

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
- Update SMTP settings if you want email notifications
- Change BASIC_AUTH_PASS for production
- Set NODE_ENV=production for production

3. Build CSS:
```bash
npm run build:css
```

4. Start the server:
```bash
npm start
```

The server will run on http://localhost:3000

## Development

Watch CSS changes:
```bash
npm run watch:css
```

## Admin Access

Export data as CSV:
- Parents: http://localhost:3000/admin/export.csv?type=parents
- Caregivers: http://localhost:3000/admin/export.csv?type=caregivers
- Default credentials: admin / secure-password-here (change in .env)

## Database

SQLite database is stored in `data/db.sqlite`

## Production Notes

1. Use HTTPS (enforce at edge/proxy)
2. Update BASIC_AUTH_PASS in .env
3. Configure real SMTP credentials
4. Set NODE_ENV=production
5. Add Plausible analytics script tag