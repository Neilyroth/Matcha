#!/bin/bash

echo "USER"

RET=1
while [[ RET -ne 0 ]]; do
    echo "=> Waiting for confirmation of MongoDB service startup"
    sleep 1
    mongo admin --eval "help" >/dev/null 2>&1
    RET=$?
done

sleep 5

echo "=> Creating an ${USER} user with a ${_word} password in MongoDB"
mongo admin --eval "db.createUser({user: 'Neilyroth', pwd: '42Matcha', roles:[{role:'root',db:'admin'}]});"
mongo admin --eval "db.auth('Neilyroth','42Matcha');"
mongo admin -u Neilyroth -p 42Matcha << EOF
use Matcha
db.createUser({user: 'MatchaUser', pwd: 'matcha42', roles:[{role:'userAdmin',db:'Matcha'}, {role:'readWrite',db:'Matcha'}]})
EOF