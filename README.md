# 🏀 ArcHoops

**Empowering the next generation of diverse STEM leaders through sports analytics**

A comprehensive web application that transforms kids' enthusiasm for sports into a powerful tool for learning about data science, featuring NBA game predictions, educational content, and gamified learning experiences.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### One-Command Development Setup

**Option 1: PowerShell (Recommended for Windows)**
```powershell
.\start-dev.ps1
```

**Option 2: Batch File (Double-click to run)**
```cmd
start-dev.bat
```

**Option 3: Direct npm command**
```bash
npm run dev
```

All options will:
- ✅ Set required environment variables
- ✅ Start the API server (http://localhost:3001)
- ✅ Start the web frontend (http://localhost:5173)
- ✅ Show you exactly what's running and where

### First Time Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ArcHoops
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   npm run prisma:migrate
   ```

4. **Start development**
   ```bash
   .\start-dev.ps1
   ```

5. **Open your browser**
   - Frontend: http://localhost:5173
   - API Health Check: http://localhost:3001/api/health

## 🏗️ Project Structure

```
ArcHoops/
├── apps/
│   ├── api/          # Backend API (Fastify + Prisma)
│   └── web/          # Frontend React App (Vite + Tailwind)
├── packages/
│   └── types/        # Shared TypeScript types
├── start-dev.ps1     # Development startup script (PowerShell)
├── start-dev.bat     # Development startup script (Batch)
└── package.json      # Root package with dev scripts
```

## 🎯 Features

### 👩‍🏫 For Teachers
- Create and manage classes
- Generate join codes for students
- View class rosters and student progress
- Manage educational content

### 👨‍🎓 For Students  
- Join classes with join codes
- Make NBA game predictions
- Compete on leaderboards
- Learn data science through sports

### 🔧 Technical Features
- **Authentication**: JWT-based with role-based access
- **Database**: SQLite (dev) → PostgreSQL (prod)
- **UI/UX**: Modern design with Tailwind CSS
- **Type Safety**: Full TypeScript coverage
- **Real-time**: Live updates and notifications

## 📚 Documentation

- **API Documentation**: See `apps/api/README.md`
- **Frontend Documentation**: See `apps/web/README.md`
- **Development Rules**: See project rules in codebase

## 🛠️ Development Commands

```bash
# Start everything (recommended)
npm run dev

# Individual services
npm run dev:api    # API server only
npm run dev:web    # Frontend only

# Database operations
npm run prisma:migrate    # Run migrations
npm run prisma:generate   # Generate Prisma client

# Code quality
npm run lint      # ESLint
npm run format    # Prettier
npm run test      # Run tests
```

## 🚨 Troubleshooting

### "Login not working"
1. Make sure both API and frontend are running
2. Check that you're using the correct email/password
3. Verify the API server is accessible at http://localhost:3001/api/health

### "Database errors"
```bash
npm run prisma:migrate
```

### "Port already in use"
- API: Change `PORT` in environment variables
- Frontend: Vite will automatically find next available port

## 📧 Support

If you encounter issues:
1. Check that both services are running with `npm run dev`
2. Verify database is set up with `npm run prisma:migrate`
3. Check browser console and terminal for error messages

---

**Ready to transform sports enthusiasm into STEM learning? Let's go!** 🏀🚀
