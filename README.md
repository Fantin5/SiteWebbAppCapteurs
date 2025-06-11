# SiteWebCapteursAPP

## Project Structure
```
SiteWebCapteursAPP/
├── backend/           # PHP Backend API
│   ├── config.php     # Database configuration
│   ├── login.php      # Login endpoint
│   ├── register.php   # Registration endpoint
│   └── index.html     # Backend info page
├── front/             # React Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── App.js
│   ├── public/
│   └── package.json
└── README.md
```

## Setup Instructions

### Backend Setup:
1. Start XAMPP (Apache + MySQL)
2. Create database `site_db` in phpMyAdmin
3. Backend available at: `http://localhost/SiteWebCapteursAPP/backend/`

### Frontend Setup:
```bash
cd front
npm install
npm start
```
Frontend available at: `http://localhost:3000`

## Git Commands
```bash
git checkout <ID_du_commit>
git checkout main
git reset --hard <ID_du_commit>
```