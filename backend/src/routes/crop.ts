import { Router } from 'express';
import Crop from '../models/Crop';

const router = Router();

// GET /api/crops?ssoil=loam&season=summer&temp=25
router.get('/', async (req: any, res: any) => {
  try {
    const soil = (req.query.soil || '').toString().toLowerCase();
    const season = (req.query.season || '').toString().toLowerCase();
    const temp = req.query.temp ? Number(req.query.temp) : undefined;

    const crops = await Crop.find({
      soilTypes: { $in: [soil] },
      seasons: { $in: [season] }
    }).lean();

    const filtered = crops.filter((c: any) => {
      if (temp == null) return true;
      if (c.minTemp != null && temp < c.minTemp) return false;
      if (c.maxTemp != null && temp > c.maxTemp) return false;
      return true;
    });

    res.json({ results: filtered });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
