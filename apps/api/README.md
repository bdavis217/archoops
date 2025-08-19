# ArcHoops API

The backend API server for the ArcHoops application, built with Fastify and Prisma.

## Quick Start (Windows)

**Easy way:** Run the PowerShell script:
```powershell
.\start-dev.ps1
```

This script automatically sets up environment variables and starts the server.

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
Create a `.env` file in this directory with:
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
ENABLE_EMAIL_VERIFICATION=false
DATA_RETENTION_DAYS=365
JWT_EXPIRY_DAYS=7
PORT=3001
NODE_ENV="development"
```

3. Generate Prisma client and run migrations:
```bash
pnpm prisma:generate
pnpm prisma:migrate
```

4. Seed the database with demo data:
```bash
pnpm prisma:seed
```

5. Start the development server:
```bash
pnpm dev
```

The API will be available at http://localhost:3001

## Demo Accounts

After seeding, you can use these accounts:

**Teacher Account:**
- Email: teacher@archoops.com
- Password: teacher123

**Student Account:**
- Email: student@archoops.com  
- Password: student123

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/logout` - Sign out
- `GET /api/me` - Get current user
- `POST /api/auth/request-password-reset` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Classes (Teacher)
- `GET /api/teacher/classes` - List teacher's classes
- `POST /api/classes` - Create new class
- `DELETE /api/classes/:id` - Delete class
- `POST /api/classes/:id/rotate-code` - Generate new join code
- `GET /api/classes/:id/roster` - View class roster

### Classes (Student)
- `POST /api/classes/join` - Join class with code

### Health Check
- `GET /api/health` - API health status
