# Natours 🌍 — Adventure Tours Web Application

Natours is a modern, full-stack web application that allows users to browse, explore, and book adventure and nature tours around the world. The application combines a clean, responsive user interface with a powerful backend, offering secure authentication, tour management, and booking functionality.

Live demo: https://www.natours.dev/

---

## 🚀 Project Overview

Natours is designed to simulate a real-world travel booking platform. Users can explore available tours, view detailed tour information, manage their accounts, and book tours securely. The project focuses on scalability, security, and maintainable architecture using industry best practices.

---

## 🌟 Key Features

### 🧭 Tours & Exploration
- Browse available adventure and nature tours
- View detailed tour pages with descriptions, pricing, duration, and difficulty
- Interactive maps displaying tour locations and routes

### 👤 User Authentication & Accounts
- User signup and login
- Secure authentication using JSON Web Tokens (JWT)
- Update profile information and upload profile photos
- Change password functionality

### 💳 Bookings & Payments
- Book tours through a secure checkout process
- Integration with payment services (e.g., Stripe)
- View booked tours in the user dashboard

### 🛠️ Backend & API
- RESTful API for tours, users, reviews, and bookings
- Role-based access control (Admin, Guide, User)
- Advanced API features:
  - Filtering
  - Sorting
  - Pagination
  - Field limiting
- Centralized error handling and data validation

---

## 🧱 Tech Stack

### Frontend
- HTML5
- CSS3 / SASS
- JavaScript (ES6+)
- Pug templates
- Leaflet (interactive maps)

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication

### Tools & Services
- Stripe (payments)
- Multer (file uploads)
- dotenv (environment variables)
- Postman (API testing)

---

## 🛠️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/your-username/natours.git
cd natours
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `config.env` or `.env` file:
```env
NODE_ENV=development
PORT=3000
DATABASE=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
JWT_EXPIRES_IN=90d
STRIPE_SECRET_KEY=<your_stripe_key>
```

### 4. Run the application
```bash
npm run dev
```

Open your browser and visit:
```
http://localhost:3000
```

---

## 📁 Project Structure

```
natours/
├── controllers/
├── models/
├── routes/
├── utils/
├── views/          # Pug templates
├── public/         # Static assets (CSS, JS, images)
├── app.js
├── server.js
├── package.json
└── README.md
```

---

## 🧠 Learning Outcomes

This project demonstrates:
- Full-stack web application development
- REST API design with Express and MongoDB
- Secure authentication and authorization
- File uploads and image handling
- Payment processing integration
- MVC architecture and clean code practices

---

## 🤝 Contributing

Contributions are welcome.
To contribute:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request

---

## 📜 License

This project is for educational and portfolio purposes.

---

## ❤️ Acknowledgements

Inspired by modern travel platforms and full-stack application best practices.
