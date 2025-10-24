import { Router } from 'express';
import multer from 'multer';
import PlantAnalysis from '../models/PlantAnalysis';
import AIService from '../services/ai';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Upload plant image and analyze
router.post('/upload-plant', upload.single('image'), async (req: any, res: any) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
    const buffer = req.file.buffer;
    // send to AI service
    const result = await AIService.analyzePlant(buffer);

    // In production you'd store the file in S3/GCS and save the URL
    const imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const record = await PlantAnalysis.create({ userId: req.body.userId || 'anonymous', imageUrl, result });
    res.json({ id: record._id, result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
