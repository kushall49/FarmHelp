# 🔧 Plant Analyzer Severity Mapping Fix

## Problem
```
PlantAnalysis validation failed: prediction.disease.severity: 
'medium' is not a valid enum value for path 'prediction.disease.severity'
```

## Root Cause

**ML Service** (Python Flask) uses these severity values:
- `'low'`
- `'medium'`
- `'high'`
- `'critical'`

**MongoDB Schema** (PlantAnalysis.js) expects these values:
- `'mild'`
- `'moderate'`
- `'severe'`
- `'healthy'`

**Mismatch:** ML Service returns `'medium'` but schema expects `'moderate'`

---

## Solution

Added severity mapping function in `backend/src/routes/plant-upload.js`:

```javascript
function mapSeverity(mlSeverity) {
  const severityMap = {
    'low': 'mild',
    'medium': 'moderate',
    'high': 'severe',
    'critical': 'severe',
    'healthy': 'healthy'
  };
  return severityMap[mlSeverity] || 'moderate';
}
```

### Mapping Table:

| ML Service Value | → | MongoDB Schema Value |
|-----------------|---|---------------------|
| `'low'` | → | `'mild'` |
| `'medium'` | → | `'moderate'` |
| `'high'` | → | `'severe'` |
| `'critical'` | → | `'severe'` |
| `'healthy'` | → | `'healthy'` |
| (any other) | → | `'moderate'` (default) |

---

## Files Modified

### `backend/src/routes/plant-upload.js`

**Added** (Line 15-24):
```javascript
function mapSeverity(mlSeverity) {
  const severityMap = {
    'low': 'mild',
    'medium': 'moderate',
    'high': 'severe',
    'critical': 'severe',
    'healthy': 'healthy'
  };
  return severityMap[mlSeverity] || 'moderate';
}
```

**Updated** (Line ~163):
```javascript
severity: mapSeverity(enhancedResult.severity) || 'moderate',
```

**Updated** (Line ~228):
```javascript
severity: mapSeverity(enhancedResult.severity), // Map to MongoDB enum
severityRaw: enhancedResult.severity, // Keep original for reference
```

---

## Testing

### Before Fix:
```json
{
  "success": false,
  "error": "PlantAnalysis validation failed: prediction.disease.severity: 'medium' is not a valid enum value"
}
```

### After Fix:
```json
{
  "success": true,
  "result": {
    "crop": "Tomato",
    "disease": "Late Blight",
    "severity": "moderate",  ✅ Mapped value
    "severityRaw": "medium",  ℹ️ Original value
    "confidence": 0.85,
    "recommendations": { ... }
  }
}
```

---

## How to Apply Fix

1. **Stop backend** (if running)
2. Changes are already saved to `backend/src/routes/plant-upload.js`
3. **Restart backend:**
   ```powershell
   .\start-all.ps1
   ```
   Or just restart backend:
   ```powershell
   cd backend
   node src/server-minimal.js
   ```

---

## Verification

### Test Plant Analyzer:
1. Start all services: `.\start-all.ps1`
2. Wait for all 3 windows to show ready
3. Open app: http://localhost:19000
4. Go to Plant Analyzer
5. Upload test image from `test-images` folder
6. Should now work without validation error! ✅

### Expected Output:
- ✅ Crop detected
- ✅ Disease detected
- ✅ Severity shown (mild/moderate/severe/healthy)
- ✅ Confidence percentage
- ✅ Cure recommendations
- ✅ No validation errors!

---

## Related Files

- `backend/src/models/PlantAnalysis.js` - MongoDB schema (defines valid severity values)
- `model-service/services/recommendation_service.py` - ML Service (generates severity values)
- `backend/src/routes/plant-upload.js` - API endpoint (now maps between formats)

---

## Why Not Change MongoDB Schema?

We could have changed the schema to accept ML Service values directly, but:

1. **Schema is semantic:** `'mild', 'moderate', 'severe'` are medical/agricultural terms
2. **ML values are technical:** `'low', 'medium', 'high'` are confidence-based
3. **Mapping is flexible:** Easier to change mapping than database schema
4. **Backward compatibility:** Existing data uses current schema

---

**Status:** ✅ Fixed  
**Date:** April 8, 2026  
**Version:** 1.0
