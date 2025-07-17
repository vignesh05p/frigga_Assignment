# Frigga Backend

This is the backend service for the Frigga project, built with Node.js and Express. It provides RESTful APIs for authentication, document management, sharing, versioning, and more. The backend integrates with Supabase for database and authentication services.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [License](#license)

## Features

- User authentication (JWT)
- Document CRUD operations
- Document sharing and mentions
- Version control for documents
- Supabase integration

## Tech Stack

- Node.js
- Express.js
- Supabase
- JWT for authentication

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd frigga-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (see below).

4. Start the server:
   ```bash
   npm start
   ```

## Environment Variables

Create a `.env` file in the root of `frigga-backend` with the following variables:

```env
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
JWT_SECRET=your_jwt_secret
```

## Available Scripts

- `npm start` — Start the server
- `npm run dev` — Start the server with nodemon (if configured)

## Project Structure

```
frigga-backend/
│
├── controllers/      # Route controllers for handling requests
├── middlewares/      # Express middlewares (auth, error handling, RBAC)
├── models/           # Data models (e.g., document)
├── routes/           # API route definitions
├── services/         # Business logic and service layer
├── supabase/         # Supabase client setup
├── utils/            # Utility functions (JWT, email, formatting)
├── server.js         # Entry point of the application
├── package.json
└── README.md
```

## API Endpoints

- `/api/auth` — Authentication routes (login, register, etc.)
- `/api/documents` — Document management
- `/api/share` — Document sharing
- `/api/version` — Document versioning
- `/api/mention` — Mentions in documents
- `/api/search` — Search functionality
- `/api/user` — User-related endpoints

> For detailed API documentation, see the route files in the `routes/` directory.

## License

This project is licensed under the MIT License.
