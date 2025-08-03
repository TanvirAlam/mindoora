#!/bin/bash

# Test runner script for Mindoora AI service
# Usage: ./scripts/test.sh [options]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🧪 Running Mindoora AI Tests${NC}"

# Set test environment variables
export NODE_ENV=test
export LOG_LEVEL=error

# Create logs directory if it doesn't exist
mkdir -p logs

# Parse command line arguments
WATCH_MODE=false
COVERAGE=false
VERBOSE=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --watch|-w)
      WATCH_MODE=true
      shift
      ;;
    --coverage|-c)
      COVERAGE=true
      shift
      ;;
    --verbose|-v)
      VERBOSE=true
      shift
      ;;
    --help|-h)
      echo "Usage: $0 [options]"
      echo "Options:"
      echo "  --watch, -w     Run tests in watch mode"
      echo "  --coverage, -c  Generate coverage report"
      echo "  --verbose, -v   Verbose output"
      echo "  --help, -h      Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

# Build Jest command
JEST_CMD="NODE_OPTIONS=--experimental-vm-modules jest"

if [ "$WATCH_MODE" = true ]; then
  JEST_CMD="$JEST_CMD --watch"
fi

if [ "$COVERAGE" = true ]; then
  JEST_CMD="$JEST_CMD --coverage"
fi

if [ "$VERBOSE" = true ]; then
  JEST_CMD="$JEST_CMD --verbose"
fi

# Run the tests
echo -e "${YELLOW}Running command: $JEST_CMD${NC}"
eval $JEST_CMD

# Check exit code
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ All tests passed!${NC}"
else
  echo -e "${RED}❌ Some tests failed!${NC}"
  exit 1
fi
