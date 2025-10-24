import { Router } from 'express';
import Joi from 'joi';
import admin from 'firebase-admin';
import User from '../models/User';

const router = Router();

// Initialize Firebase Admin if not already and credentials are provided
if (!admin.apps.length && process.env.FIREBASE_PROJECT_ID) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // private key needs newlines handled
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      } as any)
    });
    console.log('✅ Firebase Admin initialized');
  } catch (err) {
    console.warn('⚠️  Firebase Admin initialization failed:', err);
  }
} else if (!process.env.FIREBASE_PROJECT_ID) {
  console.warn('⚠️  Firebase credentials not configured - auth endpoints will not work');
}

const signupSchema = Joi.object({ email: Joi.string().email().required(), password: Joi.string().min(6).required(), displayName: Joi.string().optional() });

router.post('/signup', async (req, res) => {
  try {
    const { error, value } = signupSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const { email, password, displayName } = value;
    const userRecord = await admin.auth().createUser({ email, password, displayName });
    await User.create({ uid: userRecord.uid, email, displayName });
    res.json({ uid: userRecord.uid, email });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

const loginSchema = Joi.object({ idToken: Joi.string().required() });

router.post('/login', async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const { idToken } = value;
    const decoded = await admin.auth().verifyIdToken(idToken);
    const user = await User.findOne({ uid: decoded.uid });
    if (!user) {
      const userRecord = await admin.auth().getUser(decoded.uid);
      await User.create({ uid: decoded.uid, email: userRecord.email });
    }
    res.json({ uid: decoded.uid, email: decoded.email });
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
});

export default router;
