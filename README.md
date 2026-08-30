# 🎨 DevCanvas

![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge)
![Vite](https://img.shields.io/badge/Bundler-Vite-purple?style=for-the-badge)
![Tailwind](https://img.shields.io/badge/Styling-TailwindCSS-06B6D4?style=for-the-badge)
![Zustand](https://img.shields.io/badge/State-Zustand-orange?style=for-the-badge)

**DevCanvas** is a premium, modern platform designed to bridge the gap between talented university students and tech recruiters. Students can build sleek portfolios to showcase their projects, while recruiters can easily search, discover, and connect with fresh talent.

---

## ✨ Features

- **Google OAuth 2.0:** Secure, seamless, password-less login.
- **Role-Based Access:** Distinct experiences for `STUDENTS` (upload portfolios), `RECRUITERS` (search and like), and `ADMINS` (system moderation).
- **Project Portfolios:** Students can upload projects with cover images, screenshot galleries, GitHub/Demo links, and technology tags.
- **Advanced Real-Time Search:** Client-side dynamic search to instantly filter projects by tags, title, or student name.
- **Cloudinary Integration:** Robust image uploading system backed by Multer with 5MB memory constraints.
- **Event-Driven Notifications:** Real-time background event listeners generate notifications when projects are liked.
- **Premium UI:** Built with Tailwind CSS featuring backdrop blurs, glassmorphism, responsive grids, and micro-animations.

---

## 🏗️ System Architecture

DevCanvas utilizes a decoupled, Monorepo architecture separating the Vite-powered React frontend from the Node/Express backend.

```mermaid
graph TD
    %% Styling
    classDef frontend fill:#3b82f6,stroke:#1e3a8a,stroke-width:2px,color:#fff
    classDef backend fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff
    classDef db fill:#f59e0b,stroke:#b45309,stroke-width:2px,color:#fff
    classDef external fill:#8b5cf6,stroke:#4c1d95,stroke-width:2px,color:#fff

    subgraph Client [Frontend Layer]
        UI[React UI + Tailwind]:::frontend
        State[Zustand Store]:::frontend
        API[Axios API Client]:::frontend
    end

    subgraph Server [Backend REST API]
        Router[Express Router]:::backend
        Auth[Passport Google OAuth]:::backend
        Controllers[Controllers & Services]:::backend
        Events[EventEmitter Bus]:::backend
    end

    subgraph Database
        Mongo[(MongoDB Atlas)]:::db
    end

    subgraph Cloud Services
        Cloudinary[Cloudinary Image CDN]:::external
        Google[Google Auth Server]:::external
    end

    %% Flow
    UI <-->|Actions / Data| State
    State <-->|HTTP Requests| API
    API <-->|JSON over HTTP| Router
    Router --> Auth
    Auth <-->|Verify Tokens| Google
    Router --> Controllers
    Controllers --> Events
    Controllers <-->|Mongoose Queries| Mongo
    Controllers <-->|Image Buffer| Cloudinary
```

---

## 🔔 Event-Driven Notification System

To ensure a fast, non-blocking user experience, DevCanvas utilizes an asynchronous event-driven architecture for social interactions (like notifications).

```mermaid
sequenceDiagram
    autonumber
    actor Recruiter
    participant Controller as Like Controller
    participant DB as MongoDB
    participant EventBus as Node EventEmitter
    participant Listener as Notification Listener
    actor Student

    Recruiter->>Controller: POST /api/likes/:projectId
    Controller->>DB: Save Like to Database
    DB-->>Controller: Success
    
    %% The critical async part
    Note over Controller,EventBus: Controller emits event and finishes immediately
    Controller->>EventBus: Emit "project:liked" event
    Controller-->>Recruiter: 200 OK (Like Successful!)
    
    %% Background processing
    EventBus->>Listener: Catch "project:liked"
    Listener->>DB: Create Notification Document
    DB-->>Listener: Saved
    
    Note right of Student: Sees notification icon on next UI update
```

---

## 🚀 Tech Stack

### Frontend
- **Framework:** React 18 powered by Vite
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Notifications:** React Toastify
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB & Mongoose
- **Authentication:** Passport.js (Google OAuth 2.0) & JSON Web Tokens (JWT)
- **Security:** Helmet, CORS
- **File Upload:** Multer & Cloudinary

---

## 🛠️ Local Development Setup

### Prerequisites
- Node.js (v18+)
- MongoDB connection string (Local or Atlas)
- Cloudinary Account (for image uploads)
- Google Cloud Console (for OAuth credentials)

### 1. Clone & Install
```bash
git clone https://github.com/Pabodha-Wann/dev-canvas.git
cd dev-canvas

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Variables
Create a `.env` file in the **backend** directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_super_secret_key
NODE_ENV=development

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Create a `.env` file in the **frontend** directory:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run the Application
Run both servers simultaneously in separate terminals:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

The app will be running at `http://localhost:5173`.

---

## 📁 API Structure

| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/api/auth/google` | GET | Public | Initiate Google Login |
| `/api/auth/profile` | GET | Private | Get logged-in user details |
| `/api/projects` | GET | Public | Fetch all projects |
| `/api/projects` | POST | Student | Create a new project |
| `/api/projects/:id` | DELETE | Owner | Delete a project |
| `/api/likes/:projectId`| POST | Recruiter | Toggle a project like |
| `/api/notifications`| GET | Private | Fetch unread notifications|

---

## 👥 Contributors
Developed as part of the SE/2022 batch practical assignment. 
*Architected and led by the core DevCanvas Team.*
