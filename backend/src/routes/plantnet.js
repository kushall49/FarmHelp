const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const PLANTNET_API_URL = process.env.PLANTNET_API_URL || 'https://my-api.plantnet.org/v2/identify/all';

router.post('/identify', upload.single('image'), async (req, res) => {
  try {
    const apiKey = process.env.PLANTNET_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'PLANTNET_API_KEY is not set on the server'
      });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file provided' });
    }

    const organsRaw = req.body?.organs;
    const organs = Array.isArray(organsRaw)
      ? organsRaw
      : (typeof organsRaw === 'string' && organsRaw.trim().length > 0 ? [organsRaw] : ['leaf']);

    const formData = new FormData();
    formData.append('images', req.file.buffer, {
      filename: req.file.originalname || 'plant.jpg',
      contentType: req.file.mimetype || 'image/jpeg'
    });
    organs.forEach((o) => formData.append('organs', o));

    const url = `${PLANTNET_API_URL}?api-key=${encodeURIComponent(apiKey)}`;
    const response = await axios.post(url, formData, {
      headers: { ...formData.getHeaders() },
      timeout: 30000,
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    return res.status(200).json({
      success: true,
      source: 'plantnet',
      data: response.data
    });
  } catch (err) {
    const message = err?.response?.data?.message || err?.message || 'PlantNet request failed';
    return res.status(502).json({
      success: false,
      error: message,
      details: process.env.NODE_ENV === 'development' ? err?.response?.data : undefined
    });
  }
});

module.exports = router;

