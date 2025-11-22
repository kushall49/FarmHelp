#!/bin/sh
# TestSpirit Automated Debugging Pipeline
# POSIX-compliant script for running TestSpirit CLI

set -e

# Get the project root directory (where this script is located)
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
OUTPUT_FILE="${PROJECT_ROOT}/.testspirit_output.json"

echo "========================================="
echo "TestSpirit Automated Debugging Pipeline"
echo "========================================="
echo ""
echo "Project Root: ${PROJECT_ROOT}"
echo "Output File:  ${OUTPUT_FILE}"
echo ""

# Check if TestSpirit CLI is available
if ! command -v testspirit >/dev/null 2>&1; then
    echo "ERROR: TestSpirit CLI not found in PATH"
    echo ""
    echo "Please install TestSpirit CLI first:"
    echo "  npm install -g testspirit-cli"
    echo "  OR"
    echo "  yarn global add testspirit-cli"
    echo ""
    exit 1
fi

# Change to project root
cd "${PROJECT_ROOT}"

echo "Running TestSpirit analysis..."
echo ""

# Run TestSpirit CLI with JSON output
# Adjust flags based on TestSpirit CLI documentation
if testspirit analyze . --format json --output "${OUTPUT_FILE}" 2>&1; then
    echo ""
    echo "✅ TestSpirit analysis completed successfully!"
    echo ""
    echo "Results saved to: ${OUTPUT_FILE}"
    echo ""
    
    # Display summary if jq is available
    if command -v jq >/dev/null 2>&1; then
        echo "Summary:"
        echo "--------"
        jq -r '
            if type == "object" then
                "Total Issues: \(.totalIssues // .total // "N/A")",
                "Critical: \(.critical // 0)",
                "High: \(.high // 0)",
                "Medium: \(.medium // 0)",
                "Low: \(.low // 0)"
            else
                "Analysis complete. Check output file for details."
            end
        ' "${OUTPUT_FILE}" 2>/dev/null || echo "Check ${OUTPUT_FILE} for full details."
    fi
    
    exit 0
else
    echo ""
    echo "⚠️  TestSpirit analysis completed with warnings or errors"
    echo ""
    echo "Check ${OUTPUT_FILE} for details"
    echo ""
    exit 0
fi
