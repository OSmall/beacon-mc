#!/home/ec2-user/.nvm/versions/node/v16.19.1/bin/node

import { ec2Config, hostConfig } from "./sensitive";
import { HostObject, hostConfigObjectToHostObject } from './types';
import { EC2Client } from "@aws-sdk/client-ec2";
import emptyServerStopper from './emptyServerStopper';
import startBeaconServer from "./beacon";

export const hosts: HostObject = hostConfigObjectToHostObject(hostConfig);
export const ec2Client = new EC2Client(ec2Config);

console.log(hosts);

startBeaconServer();
emptyServerStopper();