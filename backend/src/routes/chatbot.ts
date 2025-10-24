import { Router } from 'express';
import AIService from '../services/ai';

const router = Router();

router.post('/', async (req: any, res: any) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'message required' });
    const reply = await AIService.chat(message);
    res.json({ reply });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
