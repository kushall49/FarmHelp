# FarmAPP Community API Documentation

## 📋 Overview
Reddit-like community feature with posts, comments, and voting system.

## 🔐 Authentication
Most endpoints require authentication. Include JWT token in header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📝 POST ENDPOINTS

### 1. Get All Posts (Paginated)
**GET** `/api/community`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Posts per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [...posts],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

---

### 2. Get Single Post
**GET** `/api/community/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "Best farming practices",
    "content": "Here are some tips...",
    "author": {
      "username": "farmer123",
      "displayName": "John Doe"
    },
    "comments": [...],
    "upvotes": [...],
    "downvotes": [...],
    "netVotes": 15,
    "commentCount": 5,
    "createdAt": "2025-10-16T...",
    "updatedAt": "2025-10-16T..."
  }
}
```

---

### 3. Create Post
**POST** `/api/community`
🔒 **Auth Required**

**Body:**
```json
{
  "title": "My First Post",
  "content": "This is the content of my post..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Post created successfully",
  "data": {...post}
}
```

---

### 4. Update Post
**PUT** `/api/community/:id`
🔒 **Auth Required** (Author Only)

**Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Post updated successfully",
  "data": {...updatedPost}
}
```

---

### 5. Delete Post
**DELETE** `/api/community/:id`
🔒 **Auth Required** (Author Only)

**Response:**
```json
{
  "success": true,
  "message": "Post and associated comments deleted successfully"
}
```

---

### 6. Upvote Post
**POST** `/api/community/:id/upvote`
🔒 **Auth Required**

**Response:**
```json
{
  "success": true,
  "message": "Post upvoted",
  "data": {
    "upvotes": 10,
    "downvotes": 2,
    "netVotes": 8
  }
}
```

**Note:** Clicking upvote again removes your upvote (toggle behavior)

---

### 7. Downvote Post
**POST** `/api/community/:id/downvote`
🔒 **Auth Required**

**Response:**
```json
{
  "success": true,
  "message": "Post downvoted",
  "data": {
    "upvotes": 10,
    "downvotes": 3,
    "netVotes": 7
  }
}
```

---

## 💬 COMMENT ENDPOINTS

### 8. Get Comments for Post
**GET** `/api/community/:postId/comments`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "text": "Great post!",
      "author": {
        "username": "user1",
        "displayName": "User One"
      },
      "post": "...",
      "upvotes": [...],
      "downvotes": [...],
      "netVotes": 3,
      "createdAt": "2025-10-16T...",
      "updatedAt": "2025-10-16T..."
    }
  ],
  "count": 5
}
```

---

### 9. Create Comment
**POST** `/api/community/:postId/comments`
🔒 **Auth Required**

**Body:**
```json
{
  "text": "This is my comment!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Comment created successfully",
  "data": {...comment}
}
```

---

## 🚀 Quick Setup

### 1. Add to server-minimal.js:
```javascript
const communityRoutes = require('./routes/community-routes');
app.use('/api/community', communityRoutes);
```

### 2. Test with Postman/Thunder Client:

**Create a Post:**
```
POST http://localhost:4000/api/community
Headers:
  Authorization: Bearer YOUR_TOKEN
  Content-Type: application/json
Body:
  {
    "title": "My First Post",
    "content": "Hello community!"
  }
```

**Upvote a Post:**
```
POST http://localhost:4000/api/community/POST_ID/upvote
Headers:
  Authorization: Bearer YOUR_TOKEN
```

**Get All Posts:**
```
GET http://localhost:4000/api/community?page=1&limit=10
```

---

## 📊 Data Models

### Post Model:
- `title` (String, required, max 300 chars)
- `content` (String, required)
- `author` (ObjectId → User)
- `comments` (Array of ObjectId → Comment)
- `upvotes` (Array of ObjectId → User)
- `downvotes` (Array of ObjectId → User)
- Virtuals: `netVotes`, `commentCount`

### Comment Model:
- `text` (String, required)
- `author` (ObjectId → User)
- `post` (ObjectId → Post)
- `upvotes` (Array of ObjectId → User)
- `downvotes` (Array of ObjectId → User)
- Virtual: `netVotes`

---

## ✅ Features Implemented:
- ✅ Create, Read, Update, Delete posts
- ✅ Add comments to posts
- ✅ Upvote/Downvote posts and comments
- ✅ Pagination for posts
- ✅ Author-only edit/delete
- ✅ JWT authentication
- ✅ Virtual fields (netVotes, commentCount)
- ✅ Database indexes for performance
- ✅ Populated author details

---

## 🎯 Error Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (missing fields)
- `401` - Unauthorized (no token)
- `403` - Forbidden (not author)
- `404` - Not Found
- `500` - Server Error
