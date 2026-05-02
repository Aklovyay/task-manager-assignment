# TaskFlow - Team Task Manager

## About the Project

This is a full-stack web app I built for managing team projects and tasks. Basically the idea is that an Admin can create projects, add team members to those projects, and assign tasks to them. Members can see what tasks they have, update the status, and also create their own personal tasks.

I named it **TaskFlow** because the whole point is to make task management flow smoothly between admins and team members.

## Tech Stack I Used

- **Next.js** — This is the main framework. I used it for both frontend and backend (API routes). It uses React in its base for the UI.
- **MongoDB** — For the database. I'm using MongoDB Atlas (cloud hosted) so I don't need to install anything locally. Connected it using the native `mongodb` npm package.
- **JWT (JSON Web Tokens)** — For authentication. When a user logs in or signs up, a JWT token is created and stored in an HTTP-only cookie. This keeps the session secure.
- **bcryptjs** — For hashing passwords before storing them in the database. Plain text passwords are never saved.
- **CSS Modules** — For styling. I used regular CSS with CSS modules so styles don't clash between components.

## Features

### Authentication
- Users can sign up and login
- Passwords are hashed using bcrypt
- Sessions are managed using JWT tokens stored in cookies
- There's a role selection during signup — you can register as either Admin or Member

### Admin Role
- Can create new projects
- Can assign team members to projects while creating them
- Can create tasks inside projects and **assign them to any member
- Gets a **progress tracking dashboard** — shows how many tasks are done, in progress, to do
- Has a progress bar on each project board
- Can see overdue tasks
- Can delete tasks

### Member Role
- Can only see projects they are assigned to (not all projects)
- Can see tasks that the admin assigned to them
- Can create personal tasks for themselves
- Can update the status of their own tasks (To Do → In Progress → Done)
- Cannot assign tasks to other people
- Cannot create projects
- Dashboard only shows their own tasks

#Dashboard
- Admin dashboard shows overall stats across all their projects — total tasks, progress percentage, overdue tasks list
- Member dashboard just shows their personal task list and basic counts

# Project Board
- Each project has a Kanban-style board with 3 columns: To Do, In Progress, Done
- You can change task status using a dropdown and it moves between columns
- Admin can see who each task is assigned to

#Project Structure

```
src/
├── app/
│   ├── (app)/              # Protected pages (need login)
│   │   ├── dashboard/      # Dashboard page
│   │   └── projects/       # Projects list + individual project board
│   ├── api/                # Backend API routes
│   │   ├── auth/           # Login, Signup, Logout, Me
│   │   ├── members/        # Get all members (admin only)
│   │   ├── projects/       # Create and list projects
│   │   └── tasks/          # Create, list, update, delete tasks
│   ├── login/              # Login page
│   ├── signup/             # Signup page
│   └── page.tsx            # Landing page
├── components/
│   └── Sidebar.tsx         # Sidebar navigation
├── lib/
│   ├── auth.ts             # JWT helper functions
│   └── mongodb.ts          # MongoDB connection
└── proxy.ts                # Route protection (redirects if not logged in)
```

#Database Collections

I used 4 collections in MongoDB:

1. user — stores name, email, hashed password, role (ADMIN/MEMBER)
2. projects — stores project name, description, who created it
3. project_members — links users to projects (which member belongs to which project)
4. tasks — stores task title, description, status, due date, which project it belongs to, and who it's assigned to

## How to Run Locally

1. Clone this repo
2. Run `npm install`
3. Create a `.env.local` file in the root folder with:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=any_random_string
   ```
4. Run `npm run dev`
5. Open `http://localhost:3000`

## How I Deployed It

I deployed this on Railway. Steps I followed:
- Pushed the code to GitHub
- Connected the GitHub repo to Railway
- Added the environment variables (MONGODB_URI, JWT_SECRET, PORT) in Railway's Variables section
- Railway auto-built and deployed it
- Generated a public domain from Railway settings

# Live URL

task-manager-assignment-production-0169.up.railway.app

# Demo

To test the app:
1. First sign up as an Admin
2. Create a project and add members (members need to sign up first)
3. Go inside the project and create tasks, assign them to members
4. Open an incognito window, sign up as a Member
5. As member you'll only see projects you're added to and tasks assigned to you
6. Try changing task statuses and check if the admin dashboard updates
