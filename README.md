# 🎓 EduManage — Student Management System

A full-stack Student Management System built with **HTML/CSS/JS** (Frontend) and **Node.js + MySQL** (Backend).

---

## 📦 Tech Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Auth**: JWT (JSON Web Tokens)

---

## 🚀 Setup Instructions

### 1. Database Setup
1. Open MySQL Workbench or your MySQL client
2. Run the SQL file to create the database:
   ```bash
   mysql -u root -p < backend/config/schema.sql
   ```
   Or copy-paste the contents of `backend/config/schema.sql` into MySQL Workbench and execute.

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env and set your MySQL password
npm install
npm start
```
The server will run at **http://localhost:5000**

### 3. Frontend
The frontend is served automatically by the backend.
Open **http://localhost:5000** in your browser.

---

## 🔑 Default Login Credentials

### Principal Login
- **Username**: `admin`
- **Password**: `admin123`

### Sample Student Logins
| Username | Password | Name |
|----------|----------|------|
| arjun | pass123 | Arjun Sharma |
| priya | pass123 | Priya Nair |
| rohan | pass123 | Rohan Verma |
| sneha | pass123 | Sneha Patel |
| vikram | pass123 | Vikram Singh |

---

## ✨ Features

### Principal Dashboard
- **Dashboard**: Overview stats (total students, courses, added this year, messages)
- **Course Enrollment Chart**: Visual bar chart showing students per course
- **Recently Added Students**: Quick view of latest enrollments
- **Students Page**: Full CRUD — add, edit, delete students
  - Fields: Name, Email, Phone, Age, Course, Semester, Username, Password
  - Set login credentials for each student
  - Filter/search students
- **Messages Page**: Send broadcast or direct messages to students
  - Delete messages

### Student Dashboard
- **My Profile**: View personal info, academic details, enrollment progress
- **College Info**: College description, contact info, courses list, academic calendar
- **Messages**: View all notices/messages sent by the principal

---

## 📁 Project Structure
```
sms/
├── backend/
│   ├── config/
│   │   ├── db.js          # MySQL connection
│   │   └── schema.sql     # Database setup
│   ├── middleware/
│   │   └── auth.js        # JWT middleware
│   ├── routes/
│   │   ├── auth.js        # Login endpoints
│   │   ├── dashboard.js   # Stats endpoint
│   │   ├── students.js    # Student CRUD
│   │   ├── courses.js     # Courses list
│   │   └── messages.js    # Messages CRUD
│   ├── .env.example
│   ├── package.json
│   └── server.js          # Main server
└── frontend/
    ├── css/
    │   ├── login.css
    │   └── dashboard.css
    ├── js/
    │   ├── login.js
    │   ├── principal.js
    │   └── student.js
    ├── pages/
    │   ├── principal-dashboard.html
    │   └── student-dashboard.html
    └── index.html         # Login page
```

---

## 🛠️ API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/principal/login | Principal login |
| POST | /api/auth/student/login | Student login |
| GET | /api/dashboard/stats | Dashboard stats (principal) |
| GET | /api/students | All students (principal) |
| POST | /api/students | Add student (principal) |
| PUT | /api/students/:id | Update student (principal) |
| DELETE | /api/students/:id | Delete student (principal) |
| POST | /api/students/:id/credentials | Set login (principal) |
| GET | /api/students/self/profile | Own profile (student) |
| GET | /api/courses | List all courses |
| GET | /api/messages | All messages (principal) |
| POST | /api/messages | Send message (principal) |
| GET | /api/messages/student | Student's messages |

---

## 💡 Notes
- Default passwords in the demo are plain text. For production, use bcrypt hashing.
- The backend serves the frontend at the root URL — no separate server needed.
- CORS is enabled for development; restrict origins in production.
