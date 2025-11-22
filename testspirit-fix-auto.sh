#!/bin/sh
# TestSpirit + Copilot Automated Fix Pipeline
# Usage: ./testspirit-fix-auto.sh

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
OUTPUT_FILE="${PROJECT_ROOT}/.testspirit_output.json"

echo "================================================"
echo "TestSpirit Automated Fix Pipeline"
echo "================================================"
echo ""

# Step 1: Run TestSpirit analysis
echo "Step 1/3: Running TestSpirit analysis..."
sh "${PROJECT_ROOT}/testspirit-run.sh"

if [ ! -f "${OUTPUT_FILE}" ]; then
    echo "ERROR: TestSpirit output file not found!"
    echo "Expected: ${OUTPUT_FILE}"
    exit 1
fi

echo ""
echo "✅ TestSpirit analysis complete"
echo ""

# Step 2: Display issue summary
echo "Step 2/3: Analyzing issues..."
echo ""

if command -v jq >/dev/null 2>&1; then
    TOTAL_ISSUES=$(jq -r '.totalIssues // .total // 0' "${OUTPUT_FILE}" 2>/dev/null || echo "0")
    echo "Total Issues Found: ${TOTAL_ISSUES}"
    echo ""
fi

# Step 3: Trigger Copilot instructions
echo "Step 3/3: Ready for automated fixing"
echo ""
echo "================================================"
echo "NEXT STEP:"
echo "================================================"
echo ""
echo "In VS Code, open GitHub Copilot Chat and say:"
echo ""
echo "  \"Run TestSpirit and fix all errors\""
echo ""
echo "OR use the command:"
echo ""
echo "  @testspirit /run_testspirit_fix"
echo ""
echo "Copilot will automatically:"
echo "  1. Read ${OUTPUT_FILE}"
echo "  2. Prioritize and analyze all issues"
echo "  3. Apply fixes using real project code"
echo "  4. Verify improvements"
echo "  5. Provide a detailed summary"
echo ""
echo "================================================"
