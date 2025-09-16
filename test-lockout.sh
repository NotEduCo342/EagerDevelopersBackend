#!/bin/bash

# Test account lockout system
EMAIL="lockout@test.com"
PASSWORD="wrongpassword"

echo "Testing Account Lockout System"
echo "=============================="

for i in {2..10}; do
    echo "Attempt $i:"
    
    # Make failed login attempt
    RESPONSE=$(curl -s -X POST http://localhost:3000/auth/login \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$EMAIL\",
            \"password\": \"$PASSWORD\"
        }")
    
    echo "Login Response: $RESPONSE"
    
    # Check lockout status
    STATUS=$(curl -s -X POST http://localhost:3000/auth/check-lockout \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$EMAIL\"
        }")
    
    echo "Status: $STATUS"
    echo "---"
    
    # If we get locked, break
    if echo "$RESPONSE" | grep -q "locked"; then
        echo "Account locked! Test successful."
        break
    fi
    
    # Small delay to avoid rate limiting
    sleep 2
done

echo ""
echo "Final lockout status check:"
curl -s -X POST http://localhost:3000/auth/check-lockout \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"$EMAIL\"
    }"