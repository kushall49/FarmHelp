@echo off
echo ========================================
echo FarmHelp Model Training
echo ========================================
echo.
cd /d "C:\Users\kusha\OneDrive\Desktop\FarmHelp\model-service"
set PYTHONIOENCODING=utf-8
"C:\Users\kusha\OneDrive\Desktop\FarmHelp\.venv\Scripts\python.exe" train_basic.py --dataset data/PlantVillage --epochs 20 --batch-size 32
echo.
echo ========================================
echo Training Complete!
echo Check models/ folder for output files
echo ========================================
pause
