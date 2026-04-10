# FarmHelp Services Marketplace & Matching Engine

The FarmHelp Services Marketplace serves as a two-sided platform allowing local farmers to request equipment & services from nearby operators. This system is designed around a real-time WebSocket matching engine coupled with state persistence via MongoDB.

## 1. Matching Engine Architecture

The matching engine works by querying MongoDB for the closest operators whose equipment matches the requested type and who are currently marked `isOnline`.

### The Workflow:
1. **Farmer Requests Service:** Emits `farmer:requestService` pointing to coordinates and needs.
2. **Backend Engine Searches:** 
   - A `$geoNear` query runs against `Operator` models.
   - Filters on `isOnline: true`, `equipmentType`, and sets a max radius (e.g. 10km).
   - If matched, the request goes into `SEARCHING` status and stores the matching list.
3. **Pinging Operators:**
   - The server traverses operators one by one (or in small batches).
   - It emits `request:incoming` to the first available operator.
   - If the operator accepts (`operator:acceptRequest`), the request transitions to `ACCEPTED`.
   - If no one answers or all reject, a `request:noOperators` event is pushed down to the farmer.

## 2. Socket Events & Payloads

### Emitted from Server -> Client

- `request:incoming` -> `{ request, farmer }`
- `operator:jobConfirmed` -> `ServiceRequest`
- `request:accepted` -> `{ request, operator, otp }`
- `request:otpVerified` -> `{ request }`
- `request:completed` -> `{ request }`
- `request:noOperators` -> `{ message: '...' }`
- `operator:locationUpdate` -> `{ operatorId, coordinates: [lng, lat] }`

### Emitted from Client -> Server

- `operator:goOnline` -> `{ operatorId, location: { coordinates: [lng, lat] } }`
- `operator:goOffline` -> `{ operatorId }`
- `operator:updateLocation` -> `{ operatorId, location: { coordinates: [lng, lat] }, activeRequestId }`
- `operator:acceptRequest` -> `{ requestId, operatorId }`
- `operator:rejectRequest` -> `{ requestId }`
- `operator:verifyOTP` -> `{ requestId, enteredOtp }`
- `operator:markComplete` -> `{ requestId }`
- `farmer:requestService` -> `{ farmerId, equipmentType, coordinates: [lng, lat] }`
- `farmer:cancelRequest` -> `{ requestId }`

## 3. How to Run & Test Locally

1. **Running services:**
   - Start the backend server (`npm run dev` or `node server-working.js`).
   - Start the React frontend or React Native app (`npm start` inside `frontend/`).
2. **Environment Variables:**
   - Set `.env` at your frontend: 
     - Web: `REACT_APP_SOCKET_URL` / `REACT_APP_API_URL`
     - Mobile: `SOCKET_URL` / `API_URL` defaults to your PC's IP if missing.
   - At your backend (`backend/.env`):
     - `MONGO_URI`
     - `PORT=4000`
     - `JWT_SECRET`
3. **Testing E2E Execution:**
   - Run the frontend on two devices/browser windows.
   - Login User A -> Register as an Operator, toggle Online.
   - Login User B -> Go to Services, select equipment, trigger "Request".
   - User A should get an Incoming Request Modal.
   - Accept -> provide OTP -> enter OTP -> Mark Complete -> Rate Provider.

## 4. How to Add a New Equipment Type

If you need to support a new vehicle type (e.g. Combine Harvester):

1. **Update the Enum:** Look for `equipmentType` in `backend/src/models/Operator.js` and `ServiceRequest.js`.
2. **Update the UI Categories:** Inside `frontend/src/screens/services/web/CustomerHome.jsx` and `mobile/CustomerHome.native.jsx`, add the new object to the `CATEGORIES` array containing `id`, `name`, `icon`, and `price`.
3. Optionally add custom markers inside `MapComponent` logic on both platforms for visual distinctness.
