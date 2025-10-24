@echo off
cd /d "C:\Users\kusha\OneDrive\Desktop\FarmHelp\model-service"
"C:\Users\kusha\OneDrive\Desktop\FarmHelp\.venv\Scripts\python.exe" train_model.py --dataset data/PlantVillage --epochs 20 --batch-size 32
pause
