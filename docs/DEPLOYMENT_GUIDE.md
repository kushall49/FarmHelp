# FarmHelp Deployment (10 Minutes)

This is the fastest reliable setup for your current architecture:

- Frontend: Vercel
- Backend (Node + Mongo + Socket): Render or Railway

Vercel alone is not ideal for your Express + Socket server.

## 1) Clean only non-essential local files

These are safe to remove locally (not needed for deployment):

- `frontend/.expo/`
- `frontend/web-build/`
- `frontend/dist/`
- any `*.log` files

Keep `start-all.ps1` as requested.

## 2) Deploy backend first (Render/Railway)

Use backend root: `backend/`

Set env vars:

- `MONGODB_URI`
- `JWT_SECRET`
- `NODE_ENV=production`

Start command:

- `node src/server-minimal.js`

After deploy, copy backend URL, for example:

- `https://farmhelp-backend.onrender.com`

## 3) Deploy ML service (Render Web Service)

Use model root: `model-service/`

Build command:

- `pip install -r requirements.txt`

Start command:

- `python app.py`

Set env vars:

- `FLASK_ENV=production`
- `PORT=10000` (Render usually injects this automatically)

Note: Use Python 3.10/3.11 for TensorFlow compatibility.

After deploy, copy ML URL and set backend env:

- `FLASK_ML_SERVICE_URL=https://<your-ml-service>.onrender.com`

## 4) Deploy frontend to Vercel

In Vercel Project Settings:

- Root Directory: `frontend`
- Build Command: `npx expo export:web`
- Output Directory: `web-build`

Set frontend env vars in Vercel:

- `REACT_APP_API_ORIGIN=https://farmhelp-backend.onrender.com`
- `REACT_APP_API_URL=https://farmhelp-backend.onrender.com/api`
- `REACT_APP_SOCKET_URL=https://farmhelp-backend.onrender.com`

Then deploy.

## 5) Verify after deploy

- Open Vercel URL
- Test email login/signup
- Test Google login
- Test one API screen (community/profile)

## Notes

- Login and Signup screens now read `REACT_APP_API_ORIGIN`.
- `serviceConfig.ts` already reads `REACT_APP_API_URL` and `REACT_APP_SOCKET_URL`.
- `.vercelignore` is added in `frontend/` to keep deployment clean.
