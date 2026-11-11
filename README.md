
# 🎉 Event Hub - Server Side

A RESTful API for Event Hub, an event management platform where users can create events, manage their events, join events, and explore upcoming events.

## 🚀 Technologies Used

- Node.js
- Express.js
- MongoDB
- MongoDB Driver
- Jose (JWT Authentication)
- CORS
- Dotenv

## ✨ Features

- Secure JWT authentication using JWKS.
- Create new events.
- Get all upcoming events.
- Get single event details.
- Update existing events.
- Delete events.
- Get events created by a specific user.
- Join events.
- Prevent duplicate event joining.
- Leave joined events.
- View events joined by a user.
- Get event participants.
- Search users by username.
- Get user profile information.

## 📦 Dependencies

```bash
npm install express mongodb dotenv cors jose
```

## ⚙️ Environment Variables

Create a `.env` file in the root directory.

```env
PORT=8000
MONGODB_URL=your_mongodb_connection_string
CLIENT_URL=your_client_url
```

## 🛠️ Installation & Setup

**1. Clone the repository**

```bash
git clone your-repository-url
```

**2. Navigate to the project folder**

```bash
cd your-project-folder
```

**3. Install dependencies**

```bash
npm install
```

**4. Start the server**

```bash
npm run dev
```

The server will run at:

```text
http://localhost:8000
```

## 🌐 API Endpoints

### Event Routes

| Method | Endpoint | Description |
|---|---|---|
| GET | `/events` | Get all upcoming events |
| GET | `/events/:id` | Get single event |
| POST | `/events` | Create new event |
| PATCH | `/events/:id` | Update event |
| DELETE | `/events/:id` | Delete event |
| GET | `/events/users/:userId` | Get user's created events |

### User Routes

| Method | Endpoint | Description |
|---|---|---|
| GET | `/user/:userId` | Get user profile |
| GET | `/users/:username` | Find user by username |

### Joined Event Routes

| Method | Endpoint | Description |
|---|---|---|
| POST | `/joined-events` | Join an event |
| DELETE | `/joined-events/:id` | Leave an event |
| GET | `/joined-events/:userId` | Get joined events |
| GET | `/joined-event/events/:id` | Get event participants |

## 🔐 Authentication

Protected API routes require a valid JWT token.

Add the following header to your requests:

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

JWT verification is handled using the remote JWKS endpoint:

```text
${CLIENT_URL}/api/auth/jwks
```

## 🗄️ Database Collections

This project uses MongoDB with three collections:

- `events` - Stores all event information.
- `user` - Stores user information.
- `joined-event` - Stores joined event information.

## 📂 Project Structure

```text
server/
├── node_modules/
├── .env
├── package.json
├── package-lock.json
└── index.js
```

## 👨‍💻 Author

Developed for the Event Hub event management application.

---

⭐ If you like this project, don't forget to give it a star!
