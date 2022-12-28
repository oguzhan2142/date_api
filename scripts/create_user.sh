#!/bin/sh



i=9; while [ $i -le 10 ]; do  

    i=$(( i + 1 ))
    curl -X POST http://localhost:3000/api/auth/signup -H "Content-Type: application/json" -d "{ 'username': '$i', 'password': '123', 'firstName': 'robot$i', 'lastName': 'user', 'mail': '$i@datingapp.com' }"
    echo "$i"  
done
