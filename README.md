# Week 11: CommunityHub API — Database & Authentication

## Author
- **Name:** ESTHER WANJIRU NJOROGE
- **GitHub:** [@essyken](https://github.com/essyken)
- **Date:** May 12, 2026

## Project Description
An extended version of the CommunityHub API that connects to a real MongoDB database and adds full user authentication. This week's work replaces the in-memory data store with persistent MongoDB collections via Mongoose, and introduces user registration, login, and JWT-based route protection — completing the backend foundation of the CommunityHub platform.

## Technologies Used
- Node.js
- Express.js
- MongoDB Atlas (cloud database)
- Mongoose (ODM)
- bcryptjs (password hashing)
- JSON Web Tokens / jsonwebtoken (authentication)
- dotenv (environment variables)
- JavaScript (ES6+)
- Postman / Thunder Client (API testing)

## Features
- Persistent data storage with MongoDB Atlas
- Mongoose schemas with built-in validation for Posts, Comments, and Users
- Full-text search on posts using MongoDB text indexes
- Pagination and filtering on the posts endpoint
- User registration with email validation and password hashing
- User login returning a signed JWT token
- Auth middleware (`protect`) that verifies JWT on protected routes
- Optional auth middleware for routes that work for both guests and logged-in users
- Role-based access control (`restrictTo`) for admin-only actions
- Posts linked to their author — only the author can edit or delete their own posts
- Comments linked to their parent post via ObjectId references
- Centralised error handling for Mongoose `ValidationError` and `CastError`

## Project Structure

```
iyf-s10-week-11-essyken/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   ├── Post.js
│   │   ├── Comment.js
│   │   └── User.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── auth.js
│   │   ├── posts.js
│   │   └── users.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── logger.js
│   │   ├── errorHandler.js
│   │   └── validate.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── postsController.js
│   │   ├── commentsController.js
│   │   └── usersController.js
│   └── app.js
├── server.js
├── .env
├── .env.example
├── .gitignore
└── package.json
```

## How to Run

1. Clone this repository
   ```bash
   git clone https://github.com/essyken/iyf-s10-week-11-essyken.git
   ```
2. Navigate into the project folder
   ```bash
   cd iyf-s10-week-11-essyken
   ```
3. Install dependencies
   ```bash
   npm install
   ```
4. Set up environment variables
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and fill in your MongoDB Atlas URI and JWT secret:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/community-hub
   JWT_SECRET=your-super-secret-key
   JWT_EXPIRES_IN=7d
   PORT=3000
   ```
5. Start the server
   ```bash
   node server.js
   ```
6. The API will be running at `http://localhost:3000`

## API Endpoints

### Auth (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register a new user |
| POST | /api/auth/login | Login and receive JWT token |
| GET | /api/auth/me | Get current logged-in user (protected) |

### Posts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/posts | Get all posts (supports ?author=, ?sort=, ?search=, ?page=, ?limit=) |
| GET | /api/posts/:id | Get a single post |
| POST | /api/posts | Create a new post (protected) |
| PUT | /api/posts/:id | Update a post — author only (protected) |
| DELETE | /api/posts/:id | Delete a post — author only (protected) |
| PATCH | /api/posts/:id/like | Like a post |

### Comments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/posts/:id/comments | Get comments on a post |
| POST | /api/posts/:id/comments | Add a comment (protected) |
| DELETE | /api/posts/:id/comments/:commentId | Delete a comment (protected) |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users/me | Get current user profile (protected) |
| PUT | /api/users/me | Update profile (protected) |
| GET | /api/users/:id/posts | Get all posts by a user |

> **Protected routes** require an `Authorization: Bearer <token>` header.

## Lessons Learned
- How to connect an Express app to MongoDB Atlas using Mongoose and handle connection errors gracefully
- How to define Mongoose schemas with built-in validators, instance methods, and static methods
- How to hash passwords with `bcryptjs` using a `pre('save')` hook so plain-text passwords never reach the database
- How JWT authentication works — signing a token on login and verifying it on every protected request
- How to implement role-based access control using middleware that checks `req.user.role`
- How to handle Mongoose-specific errors (`ValidationError`, `CastError`) and return meaningful HTTP responses
- How to link documents across collections using `ObjectId` references and `populate()`

## Challenges Faced
- **CastError on invalid IDs:** Passing a non-ObjectId string to `findById` threw an unhandled error; fixed by checking `error.name === 'CastError'` in the controller and returning a 400 response.
- **Password exposed in responses:** Mongoose's `select: false` on the password field was bypassed when chaining `.select('+password')` for login; had to be careful to never send the user object directly without stripping the password field first.
- **Token expiry handling:** Initially the frontend received a 500 error on expired tokens; solved by catching `TokenExpiredError` separately in the auth middleware and returning a clear 401 message.
- **Author-only editing:** Comparing `post.author` (an ObjectId) to `req.user._id` always returned false until `.toString()` was called on both sides, since ObjectIds are objects not strings.
