# ArcHoops Web App

The frontend React application for ArcHoops, built with Vite, React 18, TypeScript, and Tailwind CSS.

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Make sure the API server is running (see ../api/README.md)

3. Start the development server:
```bash
pnpm dev
```

The web app will be available at http://localhost:5173

## Features

### Authentication
- User signup with role selection (Teacher/Student)
- Login/logout with JWT cookies
- Password strength validation
- Protected routes

### Class Management
- **Teachers can:**
  - Create classes with auto-generated join codes
  - View and manage their classes
  - Rotate join codes
  - Delete classes
  - View class rosters

- **Students can:**
  - Join classes using 6-character codes
  - View their enrolled classes
  - Join multiple classes

### UI Components
- Responsive design with Tailwind CSS
- Form validation with React Hook Form + Zod
- Loading states and error handling
- Accessible components with proper ARIA labels
- Password strength indicator

## Demo Usage

1. Visit http://localhost:5173
2. Click "Sign up here" to create an account
3. Choose Teacher or Student role
4. For students, optionally enter a class join code during signup

**Teacher Flow:**
1. Sign up as teacher
2. Create a class from the dashboard
3. Share the generated join code with students

**Student Flow:**
1. Sign up as student (with or without class code)
2. Join additional classes using the "Join Class" button
3. Enter 6-character codes (e.g., ABC123)

## Architecture

- **State Management:** React Query for server state, React Context for auth
- **Routing:** React Router v6 with protected routes
- **Forms:** React Hook Form with Zod validation
- **Styling:** Tailwind CSS with custom components
- **HTTP:** Native fetch with cookie-based authentication
