# 📥 PlantVillage Dataset Download Guide

## ✅ Step 1: Install Kaggle CLI (COMPLETED)
The Kaggle package has been installed successfully!

---

## 🔑 Step 2: Get Your Kaggle API Token

### **Do This Now:**

1. **Go to Kaggle website:**
   - Open browser: https://www.kaggle.com/
   - Sign in (or create free account if you don't have one)

2. **Get your API token:**
   - Go to: https://www.kaggle.com/settings/account
   - Scroll down to "API" section
   - Click **"Create New API Token"** button
   - This downloads `kaggle.json` file to your Downloads folder

3. **Place kaggle.json in the correct location:**
   - **Option A (Recommended):** Run this PowerShell command:
     ```powershell
     # Create .kaggle directory if it doesn't exist
     New-Item -Path "$env:USERPROFILE\.kaggle" -ItemType Directory -Force
     
     # Move kaggle.json from Downloads to .kaggle folder
     Move-Item -Path "$env:USERPROFILE\Downloads\kaggle.json" -Destination "$env:USERPROFILE\.kaggle\kaggle.json" -Force
     ```
   
   - **Option B (Manual):**
     1. Open File Explorer
     2. Navigate to: `C:\Users\kusha\.kaggle\` (create folder if doesn't exist)
     3. Move `kaggle.json` from Downloads to this folder

4. **Verify kaggle.json is in the right place:**
   - File should be at: `C:\Users\kusha\.kaggle\kaggle.json`
   - The file contains your username and API key (keep it secret!)

---

## 📦 Step 3: Download PlantVillage Dataset

### **After Step 2 is done, run these commands:**

```powershell
# Navigate to model-service directory
cd C:\Users\kusha\OneDrive\Desktop\FarmHelp\model-service

# Create data directory if it doesn't exist
New-Item -Path "data" -ItemType Directory -Force

# Download dataset (this will take 5-10 minutes - it's ~500MB)
kaggle datasets download -d emmarex/plantdisease

# Extract the downloaded zip file
Expand-Archive -Path plantdisease.zip -DestinationPath data\PlantVillage -Force

# Optional: Remove the zip file to save space
Remove-Item plantdisease.zip
```

---

## ✅ Step 4: Verify Dataset Downloaded

### **Check if dataset is ready:**

```powershell
# List disease folders
Get-ChildItem -Path "data\PlantVillage" -Directory | Measure-Object

# You should see 38 folders (one for each disease class)
# Examples: Tomato___Late_blight, Potato___Early_blight, etc.
```

### **Expected folder structure:**
```
model-service/
├── data/
│   └── PlantVillage/
│       ├── Apple___Apple_scab/
│       ├── Apple___Black_rot/
│       ├── Apple___Cedar_apple_rust/
│       ├── Apple___healthy/
│       ├── Cherry_(including_sour)___Powdery_mildew/
│       ├── Cherry_(including_sour)___healthy/
│       ├── Corn_(maize)___Cercospora_leaf_spot_Gray_leaf_spot/
│       ├── Corn_(maize)___Common_rust_/
│       ├── Corn_(maize)___Northern_Leaf_Blight/
│       ├── Corn_(maize)___healthy/
│       ├── Grape___Black_rot/
│       ├── Grape___Esca_(Black_Measles)/
│       ├── Grape___Leaf_blight_(Isariopsis_Leaf_Spot)/
│       ├── Grape___healthy/
│       ├── Peach___Bacterial_spot/
│       ├── Peach___healthy/
│       ├── Pepper,_bell___Bacterial_spot/
│       ├── Pepper,_bell___healthy/
│       ├── Potato___Early_blight/
│       ├── Potato___Late_blight/
│       ├── Potato___healthy/
│       ├── Strawberry___Leaf_scorch/
│       ├── Strawberry___healthy/
│       ├── Tomato___Bacterial_spot/
│       ├── Tomato___Early_blight/
│       ├── Tomato___Late_blight/
│       ├── Tomato___Leaf_Mold/
│       ├── Tomato___Septoria_leaf_spot/
│       ├── Tomato___Spider_mites_Two-spotted_spider_mite/
│       ├── Tomato___Target_Spot/
│       ├── Tomato___Tomato_Yellow_Leaf_Curl_Virus/
│       ├── Tomato___Tomato_mosaic_virus/
│       └── Tomato___healthy/
```

---

## 🚨 Troubleshooting

### **Error: "Unauthorized: you must accept this dataset's terms to use it"**
**Solution:**
1. Go to: https://www.kaggle.com/datasets/emmarex/plantdisease
2. Click "Download" button on the page (this accepts the terms)
3. Then run the kaggle command again

### **Error: "Could not find kaggle.json"**
**Solution:**
- Make sure `kaggle.json` is at: `C:\Users\kusha\.kaggle\kaggle.json`
- Check the file is not named `kaggle.json.txt` (remove .txt if present)

### **Error: "403 Forbidden"**
**Solution:**
- Your API token might be invalid
- Go back to Kaggle settings and create a new API token
- Replace the old `kaggle.json` file

### **Download is very slow**
**Solution:**
- Dataset is ~500MB, it can take 5-15 minutes depending on internet speed
- Be patient and let it complete

---

## 📊 Dataset Information

- **Total Images:** 54,305 images
- **Classes:** 38 disease classes (including healthy plants)
- **Crops:** Apple, Cherry, Corn, Grape, Peach, Pepper, Potato, Strawberry, Tomato
- **Image Size:** Varies (will be resized to 224×224 during training)
- **Split:** You'll split 80% train / 20% validation during training

---

## ▶️ Next Step After Download

Once dataset is downloaded and extracted, you can train the model:

```powershell
cd C:\Users\kusha\OneDrive\Desktop\FarmHelp\model-service

# Activate virtual environment
.venv\Scripts\activate

# Train the model (takes 2-4 hours)
python train_model.py --dataset data/PlantVillage --epochs 20 --batch-size 32

# Or for faster testing (lower accuracy)
python train_model.py --dataset data/PlantVillage --epochs 5 --batch-size 32
```

---

## 📞 Need Help?

If you get stuck:
1. Check the error message carefully
2. Verify `kaggle.json` is in the right location
3. Make sure you accepted the dataset terms on Kaggle website
4. Try downloading manually from: https://www.kaggle.com/datasets/emmarex/plantdisease

---

**Good luck! 🌾**
