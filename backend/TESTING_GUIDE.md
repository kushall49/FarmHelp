# FarmAPP Community - Test Examples

## 🧪 Testing with Postman/Thunder Client/curl

### Prerequisites
1. Backend running on `http://localhost:4000`
2. Have a JWT token (login first to get token)

---

## 1️⃣ Create a Post

**Request:**
```http
POST http://localhost:4000/api/community
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN_HERE

{
  "title": "Best Irrigation Techniques for Rice Farming",
  "content": "After 10 years of experience, I've found that drip irrigation combined with proper scheduling can increase yield by 30%. Here's what works..."
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Post created successfully",
  "data": {
    "_id": "67123abc...",
    "title": "Best Irrigation Techniques for Rice Farming",
    "content": "After 10 years...",
    "author": {
      "username": "Kushal",
      "displayName": "Kush",
      "email": "kushal@gmail.com"
    },
    "comments": [],
    "upvotes": [],
    "downvotes": [],
    "netVotes": 0,
    "commentCount": 0
  }
}
```

---

## 2️⃣ Get All Posts

**Request:**
```http
GET http://localhost:4000/api/community?page=1&limit=10
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {...post1},
    {...post2}
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "pages": 1
  }
}
```

---

## 3️⃣ Upvote a Post

**Request:**
```http
POST http://localhost:4000/api/community/POST_ID_HERE/upvote
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Post upvoted",
  "data": {
    "upvotes": 1,
    "downvotes": 0,
    "netVotes": 1
  }
}
```

---

## 4️⃣ Add a Comment

**Request:**
```http
POST http://localhost:4000/api/community/POST_ID_HERE/comments
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN_HERE

{
  "text": "Great tips! I tried this last season and my yield increased by 25%!"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Comment created successfully",
  "data": {
    "_id": "...",
    "text": "Great tips!...",
    "author": {
      "username": "Kushal",
      "displayName": "Kush"
    },
    "post": "POST_ID",
    "upvotes": [],
    "downvotes": [],
    "netVotes": 0
  }
}
```

---

## 5️⃣ Get Post with Comments

**Request:**
```http
GET http://localhost:4000/api/community/POST_ID_HERE
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "Best Irrigation Techniques...",
    "content": "...",
    "author": {...},
    "comments": [
      {
        "_id": "...",
        "text": "Great tips!",
        "author": {...},
        "netVotes": 0
      }
    ],
    "upvotes": [...],
    "downvotes": [],
    "netVotes": 1,
    "commentCount": 1
  }
}
```

---

## 🚀 Quick Testing Script (Node.js)

Save this as `test-community.js`:

```javascript
const axios = require('axios');

const API = 'http://localhost:4000/api';
let token = '';
let postId = '';

async function test() {
  try {
    // 1. Login first
    console.log('1. Logging in...');
    const loginRes = await axios.post(`${API}/auth/login`, {
      email: 'kushal@gmail.com',
      password: 'test123'
    });
    token = loginRes.data.token;
    console.log('✅ Logged in! Token:', token.substring(0, 20) + '...');

    // 2. Create a post
    console.log('\n2. Creating post...');
    const postRes = await axios.post(
      `${API}/community`,
      {
        title: 'Test Post from Script',
        content: 'This is a test post created via API'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    postId = postRes.data.data._id;
    console.log('✅ Post created! ID:', postId);

    // 3. Upvote the post
    console.log('\n3. Upvoting post...');
    const upvoteRes = await axios.post(
      `${API}/community/${postId}/upvote`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    console.log('✅ Post upvoted! Net votes:', upvoteRes.data.data.netVotes);

    // 4. Add a comment
    console.log('\n4. Adding comment...');
    const commentRes = await axios.post(
      `${API}/community/${postId}/comments`,
      {
        text: 'Great post! Very informative.'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    console.log('✅ Comment added! ID:', commentRes.data.data._id);

    // 5. Get all posts
    console.log('\n5. Fetching all posts...');
    const allPosts = await axios.get(`${API}/community?page=1&limit=10`);
    console.log('✅ Found', allPosts.data.data.length, 'posts');

    console.log('\n🎉 All tests passed!');
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

test();
```

Run with: `node test-community.js`

---

## 📱 Frontend Integration Example (React)

```javascript
import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

// Get token from AsyncStorage
const token = await AsyncStorage.getItem('token');

// Fetch posts
const fetchPosts = async () => {
  const response = await axios.get(`${API_URL}/community?page=1&limit=10`);
  return response.data.data;
};

// Create post
const createPost = async (title, content) => {
  const response = await axios.post(
    `${API_URL}/community`,
    { title, content },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data.data;
};

// Upvote post
const upvotePost = async (postId) => {
  const response = await axios.post(
    `${API_URL}/community/${postId}/upvote`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data.data;
};

// Add comment
const addComment = async (postId, text) => {
  const response = await axios.post(
    `${API_URL}/community/${postId}/comments`,
    { text },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data.data;
};
```

---

## ✅ Test Checklist

- [ ] Create account (if not done)
- [ ] Login and get JWT token
- [ ] Create a post
- [ ] Get all posts
- [ ] Get single post
- [ ] Upvote a post
- [ ] Downvote a post
- [ ] Add a comment
- [ ] Get comments for post
- [ ] Update your own post
- [ ] Delete your own post
- [ ] Try to edit someone else's post (should fail with 403)

---

## 🐛 Common Errors

1. **401 Unauthorized** - Missing or invalid token
2. **403 Forbidden** - Trying to edit/delete someone else's post
3. **404 Not Found** - Post/Comment doesn't exist
4. **400 Bad Request** - Missing required fields (title, content, text)
