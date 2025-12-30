#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESULTS_DIR="$SCRIPT_DIR/results"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$RESULTS_DIR"

echo "=== API Gateway Load Tests ==="
echo "Timestamp: $TIMESTAMP"
echo ""

run_test() {
  local test_name=$1
  local test_file=$2
  local output_file="$RESULTS_DIR/${test_name}_${TIMESTAMP}.json"
  
  echo "Running $test_name..."
  artillery run "$SCRIPT_DIR/$test_file" --output "$output_file" 2>&1
  
  if [ -f "$output_file" ]; then
    echo "Results saved to: $output_file"
    artillery report "$output_file" --output "$RESULTS_DIR/${test_name}_${TIMESTAMP}.html" 2>/dev/null
  fi
  echo ""
}

case "${1:-all}" in
  rest)
    run_test "rest-load" "rest-load-test.yml"
    ;;
  ws|websocket)
    run_test "websocket-load" "websocket-load-test.yml"
    ;;
  stress)
    run_test "stress" "stress-test.yml"
    ;;
  all)
    run_test "rest-load" "rest-load-test.yml"
    run_test "websocket-load" "websocket-load-test.yml"
    run_test "stress" "stress-test.yml"
    ;;
  *)
    echo "Usage: $0 [rest|ws|stress|all]"
    exit 1
    ;;
esac

echo "=== Load Tests Complete ==="
echo "Results directory: $RESULTS_DIR"
