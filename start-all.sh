#!/bin/bash
# ============================================
# FarmHelp - Start All Services (Mac/Linux)
# ============================================

echo ""
echo "========================================"
echo "  Starting FarmHelp Services"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        return 0
    else
        return 1
    fi
}

# Kill existing processes on required ports
echo "[1/4] Cleaning up existing processes..."
for port in 4000 5000 19000; do
    if check_port $port; then
        echo "   Killing process on port $port..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
    fi
done
echo "   Done!"
echo ""

# Check if Python virtual environment exists
if [ ! -d ".venv" ]; then
    echo "${YELLOW}Warning: Python virtual environment not found${NC}"
    echo "   Creating .venv..."
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r model-service/requirements.txt
else
    source .venv/bin/activate
fi

# Start Backend (Node.js Express - Port 4000)
echo "[2/4] Starting Backend Server (Port 4000)..."
cd backend
npm start > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..
sleep 2
echo "   Backend PID: $BACKEND_PID"
echo ""

# Start ML Service (Flask - Port 5000)
echo "[3/4] Starting ML Service (Port 5000)..."
cd model-service
python app.py > ../logs/flask.log 2>&1 &
ML_PID=$!
cd ..
sleep 2
echo "   ML Service PID: $ML_PID"
echo ""

# Start Frontend (Expo React Native - Port 19000)
echo "[4/4] Starting Frontend (Port 19000)..."
cd frontend
npx expo start --web > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
sleep 2
echo "   Frontend PID: $FRONTEND_PID"
echo ""

echo "========================================"
echo "  All Services Started!"
echo "========================================"
echo ""
echo "  ${GREEN}Backend:${NC}  http://localhost:4000"
echo "  ${GREEN}ML API:${NC}   http://localhost:5000"
echo "  ${GREEN}Frontend:${NC} http://localhost:19000"
echo ""
echo "  Process IDs:"
echo "    Backend:  $BACKEND_PID"
echo "    ML:       $ML_PID"
echo "    Frontend: $FRONTEND_PID"
echo ""
echo "  Logs saved in ./logs/"
echo "  MongoDB starts automatically with backend"
echo ""
echo "  To stop all services, run:"
echo "    kill $BACKEND_PID $ML_PID $FRONTEND_PID"
echo "========================================"
echo ""

# Wait and check service status
sleep 10
echo "Checking service status..."
echo ""

for port in 4000 5000 19000; do
    if check_port $port; then
        echo "  ${GREEN}✓${NC} Port $port is listening"
    else
        echo "  ${RED}✗${NC} Port $port is NOT listening"
    fi
done

echo ""
echo "Services are starting... Wait 30 seconds for full initialization"
echo ""

# Save PIDs to file for easy cleanup
echo "BACKEND_PID=$BACKEND_PID" > .service-pids
echo "ML_PID=$ML_PID" >> .service-pids
echo "FRONTEND_PID=$FRONTEND_PID" >> .service-pids

echo "Saved process IDs to .service-pids"
echo ""
