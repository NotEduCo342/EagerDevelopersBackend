#!/bin/bash

echo "Testing rate limiting - making 15 requests to localhost:3000"
echo "Expected: First 10 should succeed (200), next 5 should be rate limited (429)"
echo

for i in {1..15}; do
  response=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:3000/)
  echo "Request $i: HTTP $response"
  sleep 0.1  # Small delay between requests
done

echo
echo "Wait 60+ seconds and try again - rate limit should reset"