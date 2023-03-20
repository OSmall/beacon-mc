#!/bin/bash

mcrcon -H localhost -P 25575 -p cUDj@0TySyyXEhktiFzFbxQ4bGJMOIMOxlr%vYq89qCoMVHWf@NTbUxdYBxfK3El "say Server stopping..."

sleep 5

mcrcon -H localhost -P 25575 -p cUDj@0TySyyXEhktiFzFbxQ4bGJMOIMOxlr%vYq89qCoMVHWf@NTbUxdYBxfK3El stop

while kill -0 $MAINPID 2>/dev/null
do
  sleep 0.5
done
