# 🎨 DevCanvas — Student Project Showcase Portal (Assessment 2 Enhanced)

![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge)
![Vite](https://img.shields.io/badge/Bundler-Vite-purple?style=for-the-badge)
![OIDC](https://img.shields.io/badge/Auth-Asgardeo_OIDC-green?style=for-the-badge)
![Security](https://img.shields.io/badge/Security-OWASP_Top_10_Hardened-red?style=for-the-badge)

**DevCanvas** is a modern, secure web portal designed to bridge the gap between computing students and tech recruiters. Students build rich project portfolios to showcase their innovations, while recruiters and faculty discover and interact with talent.

---

## 🔒 Assessment 2 Security & OIDC Enhancements

This project has been enhanced according to the **Assessment 2: Secure Web Application Development** guidelines:

1. **OIDC Authentication with Asgardeo**: Full OpenID Connect integration using Asgardeo as the primary Identity Provider (IdP).
2. **Access Token Validation**: Cryptographic signature verification using Asgardeo's JWKS (`RS256`), verifying issuer (`iss`), audience (`aud`), and expiration (`exp`).
3. **Role-Based Access Control (RBAC)**: Strict role enforcement (`STUDENT`, `RECRUITER`, `ADMIN`) via `roleMiddleware`.
4. **Ownership & IDOR Protection**: Server-derived identity enforcement. Project creation, editing, and deletion verify ownership (`project.studentId === req.user.id`).
5. **NoSQL Injection & Input Validation**: Validation of MongoDB ObjectIds (`mongoose.Types.ObjectId.isValid`) across all route parameters.
6. **File Upload Security**: Multer storage restricted strictly to valid image MIME types (`image/jpeg`, `image/png`, `image/webp`) with 5MB size limits.
7. **OWASP Top 10 Hardening**: Production error message sanitization, Helmet security headers, CORS origin restrictions, and secret isolation.

---

## 📋 Assessment Functionality Mapping

| Official Assessment Requirement | DevCanvas Domain Mapping | Technical Implementation |
| :--- | :--- | :--- |
| **Stall Vendor** | **Student / Project Creator** | User with role `STUDENT` |
| **Vendor Profile** | **Student Profile** | `User` model (`name`, `email`, `profilePic`, `bio`, `technologies`, `location`, `institute`) |
| **Stall Reservation Request** | **Student Project Submission** | `Project` model (`title`, `description`, `githubUrl`, `demoUrl`, `tags`, `coverImage`, `images`) |
| **View Vendor's Own Reservations** | **Student's Own Projects** | `GET /api/projects?owner=me` (filtered server-side by authenticated `req.user.id`) |
| **Exhibition Organizer** | **Admin / Portal Organizer** | User with role `ADMIN` |
| **Organizer Management** | **Admin Project & User Management** | `/api/admin/projects` (view/delete submissions), `/api/admin/users` (manage/disable users) |

---

## 🛠️ Local Setup & Deployment

### Prerequisites
- Node.js (v18 or v20+)
- MongoDB database (Local or MongoDB Atlas)
- Asgardeo Account & OIDC Application (See [docs/ASGARDEO_SETUP.md](docs/ASGARDEO_SETUP.md))
- Cloudinary Account (for project image CDN)

### 1. Installation
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

### 2. Environment Configuration

Create `.env` in the **backend** folder:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/devcanvas
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:3000
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development

# Asgardeo OIDC Credentials
ASGARDEO_CLIENT_ID=your_asgardeo_client_id
ASGARDEO_CLIENT_SECRET=your_asgardeo_client_secret
ASGARDEO_TENANT=your_tenant_name
ASGARDEO_BASE_URL=https://api.asgardeo.io/t/your_tenant_name
ASGARDEO_ISSUER=https://api.asgardeo.io/t/your_tenant_name/oauth2/token
ASGARDEO_REDIRECT_URI=http://localhost:3000/api/auth/asgardeo/callback
ASGARDEO_SCOPES=openid profile email

# Cloudinary CDN Credentials
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Create `.env` in the **frontend** folder:
```env
VITE_API_URL=http://localhost:3000/api
```

---

## 🗄️ Database Creation & Initialization Script

To initialize MongoDB database indexes and collections locally:

```bash
cd backend
node -e "
import mongoose from 'mongoose';
import User from './src/models/User.js';
import Project from './src/models/Project.js';

async function initDB() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/devcanvas');
  console.log('MongoDB Connected!');
  await User.createIndexes();
  await Project.createIndexes();
  console.log('Database Indexes Created Successfully!');
  process.exit(0);
}
initDB();
"
```

---

## 🔒 Running with HTTPS Configuration

### Development Mode (Local HTTPS)
To run the Vite frontend and Express backend over HTTPS during development:
1. Generate dev TLS certificates (e.g., using `mkcert`):
   ```bash
   mkcert -install
   mkcert localhost
   ```
2. Place `localhost.pem` and `localhost-key.pem` in `backend/certs/`.
3. Set `SERVER_URL=https://localhost:3000` and `CLIENT_URL=https://localhost:5173` in `.env`.

### Production TLS Architecture
In production, deploy the Express API behind an NGINX reverse proxy configured with Let's Encrypt TLS certificates:
```nginx
server {
    listen 443 ssl http2;
    server_name devcanvas.example.com;

    ssl_certificate /etc/letsencrypt/live/devcanvas.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/devcanvas.example.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}
```

---

## 🧪 Security & API Verification Testing

Run the automated test suite to verify OWASP controls and endpoints:

```bash
cd backend
node scripts/verify-security.js
```

### Test Evidence Output
```text
====================================================
   DEVCANVAS ASSESSMENT 2 — SECURITY & API TESTS    
====================================================

[PASS] Backend Health Check (/api/health)
[PASS] Unauthenticated POST /api/projects returns HTTP 401
[PASS] Forged Bearer Token on /api/auth/me returns HTTP 401
[PASS] Invalid ObjectId in URL parameter returns HTTP 400
[PASS] Public GET /api/projects returns HTTP 200
[PASS] Asgardeo OIDC Endpoint Configuration Validated
[PASS] Database Schema: User.asgardeoId field present & indexed

====================================================
 SUMMARY: 7 PASSED, 0 FAILED
====================================================
```

---

## 📁 Additional Documentation Links

- **Asgardeo Setup Guide**: [docs/ASGARDEO_SETUP.md](docs/ASGARDEO_SETUP.md)
- **OWASP Top 10 Report**: [docs/SECURITY.md](docs/SECURITY.md)

---

## 👥 Authors
Developed for Assessment 2: Secure Web Application Development.
