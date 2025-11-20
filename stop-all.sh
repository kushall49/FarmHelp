#!/bin/bash
# ============================================
# FarmHelp - Stop All Services (Mac/Linux)
# ============================================

echo ""
echo "========================================"
echo "  Stopping FarmHelp Services"
echo "========================================"
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Kill by saved PIDs if available
if [ -f ".service-pids" ]; then
    echo "Found saved process IDs..."
    source .service-pids
    
    echo "[1/3] Stopping Backend (PID: $BACKEND_PID)..."
    kill -9 $BACKEND_PID 2>/dev/null && echo "   ${GREEN}✓${NC} Stopped" || echo "   ${RED}✗${NC} Not running"
    
    echo "[2/3] Stopping ML Service (PID: $ML_PID)..."
    kill -9 $ML_PID 2>/dev/null && echo "   ${GREEN}✓${NC} Stopped" || echo "   ${RED}✗${NC} Not running"
    
    echo "[3/3] Stopping Frontend (PID: $FRONTEND_PID)..."
    kill -9 $FRONTEND_PID 2>/dev/null && echo "   ${GREEN}✓${NC} Stopped" || echo "   ${RED}✗${NC} Not running"
    
    rm .service-pids
else
    echo "No saved PIDs found. Killing by port..."
    
    for port in 4000 5000 19000; do
        echo "Stopping service on port $port..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || echo "   Nothing running on port $port"
    done
fi

echo ""
echo "========================================"
echo "  All Services Stopped!"
echo "========================================"
echo ""
