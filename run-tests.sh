#!/bin/bash

# Playwright Test Runner Script
# Usage: ./run-tests.sh [URL] [OPTIONS]

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Default values
BASE_URL=""
TEST_FILE=""
MODE=""

# Function to display usage
usage() {
    echo -e "${BLUE}Playwright Test Runner${NC}"
    echo ""
    echo "Usage: ./run-tests.sh [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -u, --url URL          Run tests on specified URL (e.g., https://example.com)"
    echo "  -f, --file FILE        Run specific test file (e.g., patient.spec.js)"
    echo "  -m, --mode MODE        Run mode: ui, headed, debug (default: normal)"
    echo "  -h, --help             Display this help message"
    echo ""
    echo "Examples:"
    echo "  ./run-tests.sh                                    # Run all tests locally"
    echo "  ./run-tests.sh -u https://example.com            # Run all tests on custom URL"
    echo "  ./run-tests.sh -f patient.spec.js                # Run patient tests locally"
    echo "  ./run-tests.sh -u https://example.com -m ui      # Run tests on custom URL in UI mode"
    echo "  ./run-tests.sh -f patient.spec.js -m headed      # Run patient tests with visible browser"
    echo ""
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -u|--url)
            BASE_URL="$2"
            shift 2
            ;;
        -f|--file)
            TEST_FILE="$2"
            shift 2
            ;;
        -m|--mode)
            MODE="$2"
            shift 2
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            usage
            exit 1
            ;;
    esac
done

# Build the command
CMD="npx playwright test"

# Add test file if specified
if [ ! -z "$TEST_FILE" ]; then
    CMD="$CMD $TEST_FILE"
fi

# Add mode if specified
case $MODE in
    ui)
        CMD="$CMD --ui"
        ;;
    headed)
        CMD="$CMD --headed"
        ;;
    debug)
        CMD="$CMD --debug"
        ;;
esac

# Display configuration
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Playwright Test Configuration     ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"

if [ ! -z "$BASE_URL" ]; then
    echo -e "${GREEN}URL:${NC}        $BASE_URL"
    export BASE_URL="$BASE_URL"
else
    echo -e "${GREEN}URL:${NC}        http://localhost:8080 (local)"
fi

if [ ! -z "$TEST_FILE" ]; then
    echo -e "${GREEN}Test File:${NC}  $TEST_FILE"
else
    echo -e "${GREEN}Test File:${NC}  All tests"
fi

if [ ! -z "$MODE" ]; then
    echo -e "${GREEN}Mode:${NC}       $MODE"
else
    echo -e "${GREEN}Mode:${NC}       normal"
fi

echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if Playwright is installed
if ! command -v npx &> /dev/null; then
    echo -e "${RED}Error: npx not found. Please install Node.js and npm.${NC}"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Warning: node_modules not found. Running npm install...${NC}"
    npm install
fi

# Check if Playwright browsers are installed
if [ ! -d "$HOME/Library/Caches/ms-playwright" ] && [ ! -d "$HOME/.cache/ms-playwright" ]; then
    echo -e "${YELLOW}Warning: Playwright browsers not found. Installing...${NC}"
    npx playwright install
fi

# Run the tests
echo -e "${BLUE}Running: $CMD${NC}"
echo ""

eval $CMD

# Capture exit code
EXIT_CODE=$?

# Display result
echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓ Tests completed successfully!${NC}"
else
    echo -e "${RED}✗ Tests failed with exit code $EXIT_CODE${NC}"
fi

exit $EXIT_CODE

