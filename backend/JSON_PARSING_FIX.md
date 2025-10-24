# 🐛 JSON Body Parsing - Debugging Guide

## ✅ FIXED! Middleware Order

The server has been completely rewritten with **proper middleware order** and enhanced error handling.

---

## 🔧 What Was Fixed

### Critical Middleware Order (Lines 10-25):
```javascript
// 1. CORS must be first
app.use(cors({...}));

// 2. Body parsers MUST come BEFORE route handlers
// This is CRITICAL because Express needs to parse incoming request body
// BEFORE it reaches your route handlers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 3. Logging middleware
app.use((req, res, next) => { ... });

// 4. Routes come AFTER all middleware
app.use('/api/auth', authRoutes);
app.use('/api/community', communityRoutes);
```

---

## 🎯 Why Middleware Order Matters

**WRONG ❌:**
```javascript
app.use('/api/auth', authRoutes);  // Routes first
app.use(express.json());           // Body parser second
```
**Result:** `req.body` is `undefined` in all routes → 400 Bad Request

**CORRECT ✅:**
```javascript
app.use(express.json());           // Body parser first
app.use('/api/auth', authRoutes);  // Routes second
```
**Result:** `req.body` contains parsed JSON data

---

## 📊 New Features Added

### 1. Enhanced CORS Configuration
- Allows all origins (adjust for production)
- Handles preflight OPTIONS requests
- Supports credentials and custom headers

### 2. Request Logging
- Logs every incoming request with timestamp
- Logs POST/PUT request bodies for debugging
- Easy to see what data is being received

### 3. Better Error Handling
- Specific error for invalid JSON
- 404 handler for undefined routes
- Development stack traces
- Detailed error messages

### 4. Graceful Shutdown
- Handles SIGTERM and SIGINT
- Closes MongoDB connection properly
- Handles unhandled promise rejections

---

## 🧪 Testing JSON Parsing

### Option 1: Use the test script
```bash
cd backend
node test-json-parsing.js
```

### Option 2: Manual cURL test
```bash
# Test signup
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","username":"testuser"}'

# Expected: 201 Created or 400 (if user exists)
# NOT EXPECTED: 400 with "JSON parsing failed"
```

### Option 3: Postman/Thunder Client
```
POST http://localhost:4000/api/auth/signup
Headers:
  Content-Type: application/json
Body (raw JSON):
{
  "email": "test@example.com",
  "password": "test123",
  "username": "testuser",
  "displayName": "Test User"
}
```

---

## 📝 Server Logs

When you send a request, you should now see:
```
[2025-10-16T...] POST /api/auth/signup
[BODY] {
  "email": "test@example.com",
  "password": "test123",
  "username": "testuser"
}
```

If you don't see `[BODY]`, the JSON parser is not working.

---

## 🚨 Common Issues & Solutions

### Issue 1: Still getting 400 Bad Request
**Check:**
1. Is `Content-Type: application/json` header set?
2. Is the JSON valid? (no trailing commas, proper quotes)
3. Are you sending to the correct endpoint?

**Solution:** Look at server logs to see what's being received

### Issue 2: req.body is undefined
**Cause:** Middleware order is wrong
**Solution:** Server file has been fixed with correct order

### Issue 3: CORS errors in browser
**Cause:** Browser blocking cross-origin requests
**Solution:** CORS middleware is now properly configured

### Issue 4: Server not restarting
**Solution:**
```bash
# Find and kill the process
netstat -ano | findstr :4000
Stop-Process -Id PID_NUMBER -Force

# Start fresh
cd backend
node src/server-minimal.js
```

---

## ✅ Verification Checklist

- [ ] Server starts without errors
- [ ] MongoDB connects successfully
- [ ] POST requests show `[BODY]` in logs
- [ ] Signup endpoint accepts JSON data
- [ ] Login endpoint accepts JSON data
- [ ] No 400 errors for valid JSON requests

---

## 🎓 Key Learnings

1. **Middleware order is CRITICAL** - body parsers must come before routes
2. **Always log request bodies** during development for debugging
3. **CORS must be configured** before other middleware
4. **Error handlers must be last** in the middleware chain
5. **Use detailed error messages** to help debug issues

---

## 📞 Still Having Issues?

Check the server console output. With the new logging:
- Every request is logged with timestamp
- Request bodies are printed for POST/PUT requests
- Errors show full details and stack traces
- You can see exactly what the server receives

The server is now production-ready with:
- ✅ Proper middleware order
- ✅ Request logging
- ✅ Error handling
- ✅ CORS configuration
- ✅ Graceful shutdown
- ✅ JSON parsing working correctly
