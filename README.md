# Team Task Manager (Full-Stack)

A full-stack web application for creating projects, assigning tasks, and tracking progress with role-based access control.

## Tech Stack
- **Framework:** Next.js (App Router)
- **Database:** MongoDB (Native Driver)
- **Authentication:** Custom JWT-based Auth
- **Styling:** Vanilla CSS (CSS Modules with a sleek dark-mode glassmorphism design)

## Key Features
- **Authentication:** Signup and Login with JWT session cookies.
- **Role-Based Access Control:** Admin vs Member roles.
- **Projects:** Admins can create projects and view all projects.
- **Tasks:** Add tasks to a project, assign them, and track status (TODO, IN_PROGRESS, DONE) using a Kanban-style board.
- **Dashboard:** Overview of your assigned tasks and project statistics.

## Local Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env.local` file in the root of the project with your MongoDB connection string and a JWT secret:
   ```env
   MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/task-manager?retryWrites=true&w=majority"
   JWT_SECRET="your-super-secret-key"
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open the app:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Railway Deployment Instructions

Deploying this app to Railway is completely straightforward as Railway natively supports Next.js.

1. Initialize a Git repository and push this project to GitHub.
2. Go to your [Railway Dashboard](https://railway.app/) and click **New Project** -> **Deploy from GitHub repo**.
3. Select your repository.
4. Go to the **Variables** tab for the newly created service in Railway and add:
   - `MONGODB_URI` -> Your actual MongoDB Atlas connection string.
   - `JWT_SECRET` -> A strong random string for security.
5. Railway will automatically build and deploy the app.
6. Once deployed, click on the **Settings** tab and click **Generate Domain** to get your Live URL.
