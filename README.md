# PelliGallery - Wedding Photography Portfolio & Booking Website
Developed for **Pellipusthakam Photography, Hyderabad**.

PelliGallery is a full-stack, responsive, premium photography portfolio and client booking application. It provides couples with an elegant portfolio grid, customizable services catalog, shopping cart, and checkout flow. Administrators are equipped with a secured analytics dashboard, package editor builders, bookings inquiries trackers, and live uploader channels.

---

## 🛠️ Technology Stack
- **Frontend**: React.js, Vite, Tailwind CSS, Lucide Icons, React Router DOM
- **Backend**: Node.js, Express.js, Multer (memory buffering)
- **Database**: PostgreSQL (relational storage) with automatic local JSON fallback for testing
- **Authentication**: JSON Web Tokens (JWT), Bcrypt password hashing
- **Image CDN**: Cloudinary integrations (with high-res Unsplash placeholders fallback)
- **Notifications**: Nodemailer SMTP dispatcher (with terminal console logger fallback)

---

## 📂 Project Structure
```text
new_project/
├── backend/
│   ├── config/          # db, cloudinary, nodemailer setups
│   ├── controllers/     # Route logic handlers
│   ├── db/              # SQL schemas and DB seed files
│   ├── middleware/      # auth, file uploader, error helpers
│   ├── routes/          # Express route paths
│   ├── .env.example     # configuration templates
│   ├── package.json     # backend dependencies list
│   └── server.js        # API app entry runner
└── frontend/
    ├── src/
    │   ├── components/  # Layout navbar, footer, lightbox, toast
    │   ├── context/     # AuthContext, CartContext hooks
    │   ├── pages/       # Home, Portfolio, Services, Checkout, Admin pages
    │   ├── App.jsx      # Router routing maps
    │   ├── index.css    # Tailwind styling configuration
    │   └── main.jsx     # client virtual DOM mount
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── vite.config.js
    └── package.json     # frontend dependencies list
```

---

## ⚙️ Environment Configurations (.env)

Create a `.env` file inside the `backend/` directory based on the template:

```env
# Server details
PORT=5000
NODE_ENV=development

# JWT security keys
JWT_SECRET=pellipusthakam_super_secret_key_2026
JWT_EXPIRY=24h

# PostgreSQL details (Or use DATABASE_URL)
# DATABASE_URL=postgresql://postgres:password@localhost:5432/pelligallery
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=pelligallery

# Cloudinary credentials (Required for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# SMTP configuration (Required for booking email notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=your_email@gmail.com

# Studio receipt inbox
STUDIO_EMAIL=pellipusthakamphotography@gmail.com
```

> [!TIP]
> **Resiliency Fallbacks**: If database settings are omitted, the backend server automatically initiates a JSON-based database (`backend/db/local_db.json`) and redirects Cloudinary & SMTP routes to mock console streams. This guarantees that the entire application runs, compiles, and behaves exactly as expected out-of-the-box!

---

## 🚀 Step-by-Step Running Guide

### 1. Database Initialization
If you have PostgreSQL installed and configured in `.env`, run the seeding command from the backend folder to create tables and insert default values (Admin credentials, initial categories, packages, and portfolio content):
```bash
cd backend
npm run seed
```

### 2. Launching the Backend Server
Launch the Express API server:
```bash
cd backend
npm run dev
```
The server will start listening at `http://localhost:5000`. You can inspect the health status at `http://localhost:5000/api/health`.

### 3. Launching the Frontend Client
Install dependencies and run the client dev compiler:
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```
Open your browser at the displayed local URL (typically `http://localhost:5173`).

---

## 🔒 Administrator Authentication
- **Default Username**: `admin`
- **Default Password**: `Pellipusthakam@2026`

Use these credentials at `http://localhost:5173/admin/login` to access the statistics dashboard, edit packages, reorder portfolio images, and review booking inquiries.
