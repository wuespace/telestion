#!/bin/bash
# Quick validation script to verify the example structure

set -e

echo "🔍 Validating end-to-end demo structure..."

# Check required files exist
required_files=(
  "README.md"
  "docker-compose.yml"
  "data-generator/mod.ts"
  "data-generator/deno.json"
  "data-generator/Dockerfile"
  "data-processor/main.go"
  "data-processor/go.mod"
  "data-processor/Dockerfile"
  "database-service/mod.ts"
  "database-service/deno.json"
  "database-service/Dockerfile"
)

echo "Checking required files..."
for file in "${required_files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ Missing: $file"
    exit 1
  fi
done

# Validate Go code compiles
echo ""
echo "Validating Go service..."
cd data-processor
if go build -o /tmp/test-data-processor main.go 2>&1; then
  echo "  ✅ Go service builds successfully"
  rm -f /tmp/test-data-processor
else
  echo "  ❌ Go service failed to build"
  exit 1
fi
cd ..

echo ""
echo "✅ All validation checks passed!"
echo ""
echo "To run the demo:"
echo "  docker-compose up"
