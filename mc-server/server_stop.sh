#!/bin/bash

mcrcon -H localhost -P 25575 -p <RCON_PASSWORD> "say Server stopping..."

sleep 5

mcrcon -H localhost -P 25575 -p <RCON_PASSWORD> stop

while kill -0 $MAINPID 2>/dev/null
do
  sleep 0.5
done

aws ec2 stop-instances --instance-ids <INSTANCE_ID>