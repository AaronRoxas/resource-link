# Resource Link

**Resource Link** is a full-stack web application designed to streamline the sharing and management of resources. Built with React for the frontend and Node.js for the backend.

## 🌐 Live Demo

Experience the application live: [resource-link.vercel.app](https://resource-link.vercel.app)

## 🚀 Features

- **User Authentication**: Secure login and registration system.
- **Resource Management**: Add, edit, and delete resources.
- **Categorization**: Organize resources by subjects and tags.
- **QR Scanning**: Scan items easily using the uniqure QR codes for each item.
- **Search Functionality**: Quickly find resources using keywords.
- **Responsive Design**: Optimized for both desktop and mobile devices.

## 🛠️ Tech Stack

- **Frontend**: React, HTML5, CSS3, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Deployment**: Vercel, Heroku

## 📁 Project Structure

```
resource-link/
├── backend/             # Backend API and server configuration
├── frontend/            # React frontend application
├── .gitignore
├── package.json
├── Procfile             # For deployment configurations
└── README.md
```

##  Getting Started

### Prerequisites

- Node.js and npm installed
- MongoDB instance (local or hosted)

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/AaronRoxas/resource-link.git
   cd resource-link
   ```

2. **Install dependencies for both frontend and backend**:

   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Configure environment variables**:

   Create a `.env` file in the `backend` directory and add your MongoDB URI:

   ```env
   MONGODB_URI=your_mongodb_connection_string
   ```

4. **Run the application**:

   ```bash
   # Start the backend server
   cd backend
   nodemon

   # In a new terminal, start the frontend application
   cd ../frontend
   npm start
   ```

   The frontend will be available at `http://localhost:3000` and the backend API at `http://localhost:5000`.
