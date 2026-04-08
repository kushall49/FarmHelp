# Plant Disease Test Images - Download Guide

## 🎯 Quick Start

Run the batch file to download test images:
```bash
.\DOWNLOAD_TEST_IMAGES.bat
```

This will create a `test-images` folder with 6 plant disease photos ready for testing!

---

## 📸 Images Included

### 1. **Tomato Late Blight** 🍅
- **File:** `tomato_late_blight.jpg`
- **Expected Result:** 
  - Disease: Late Blight
  - Severity: CRITICAL 🚨
  - Cure: Copper fungicides, Mancozeb
  - Recovery: 2-3 weeks

### 2. **Tomato Early Blight** 🍅
- **File:** `tomato_early_blight.jpg`
- **Expected Result:**
  - Disease: Early Blight
  - Severity: MEDIUM 🟡
  - Cure: Organic treatments, crop rotation
  - Recovery: 3-4 weeks

### 3. **Powdery Mildew** 🥒
- **File:** `powdery_mildew.jpg`
- **Expected Result:**
  - Disease: Powdery Mildew
  - Severity: MEDIUM 🟡
  - Cure: Sulfur spray, milk solution
  - Recovery: 2-3 weeks

### 4. **Leaf Spot** 🌿
- **File:** `leaf_spot.jpg`
- **Expected Result:**
  - Disease: Leaf Spot
  - Severity: LOW 🟢
  - Cure: Copper spray, remove leaves
  - Recovery: 2-3 weeks

### 5. **Rust Disease** 🌾
- **File:** `rust_disease.jpg`
- **Expected Result:**
  - Disease: Rust
  - Severity: MEDIUM 🟡
  - Cure: Fungicides, resistant varieties
  - Recovery: 3-4 weeks

### 6. **Healthy Tomato Leaf** ✅
- **File:** `healthy_leaf.jpg`
- **Expected Result:**
  - Disease: Healthy Plant
  - Severity: LOW 🟢
  - Message: Continue good practices
  - No treatment needed

---

## 🧪 Testing Procedure

### Step 1: Download Images
```bash
.\DOWNLOAD_TEST_IMAGES.bat
```

### Step 2: Start Your App
```bash
.\start-all.ps1
```

### Step 3: Test Each Image
1. Open app → Plant Analyzer
2. Upload `tomato_late_blight.jpg`
3. Check results:
   - ✅ Disease name appears
   - ✅ Scientific name shown
   - ✅ Severity level displayed
   - ✅ Organic cures listed
   - ✅ Chemical cures with dosages
   - ✅ Prevention tips provided
   - ✅ Recovery time estimated

### Step 4: Try Other Images
Repeat with all 6 images to see different:
- Severity levels
- Cure recommendations
- Recovery times

---

## 🌐 Alternative: Manual Download

If the batch script doesn't work, download manually from:

**Wikimedia Commons:**
- https://commons.wikimedia.org/wiki/Category:Plant_diseases

**Search Terms:**
- "tomato late blight"
- "tomato early blight"
- "powdery mildew leaves"
- "plant bacterial spot"
- "wheat rust disease"

---

## 🎨 Best Testing Tips

1. **Start with Late Blight** - Most dramatic results
2. **Compare with Healthy Leaf** - See the difference
3. **Test Powdery Mildew** - Common disease
4. **Take your own photos** - Use real plants!

---

## 📊 What to Verify

For each test image, check that you get:
- [ ] Disease name
- [ ] Scientific name (e.g., "Phytophthora infestans")
- [ ] Confidence score
- [ ] Severity level (Low/Medium/High/Critical)
- [ ] Symptoms list
- [ ] Organic cure options
- [ ] Chemical cure options (with dosages!)
- [ ] Prevention measures
- [ ] Recovery time estimate
- [ ] Affected crops list

---

## 🚀 Ready to Test!

Your images will be in: `test-images\`

Happy Testing! 🌱✨
