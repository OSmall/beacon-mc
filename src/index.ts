#!/home/ec2-user/.nvm/versions/node/v16.19.1/bin/npx tsc && /home/ec2-user/.nvm/versions/node/v16.19.1/bin/node

import { ec2Config, hostConfig, route53Config } from "./sensitive0";
import { HostObject, hostConfigObjectToHostObject } from './types';
import { EC2Client } from "@aws-sdk/client-ec2";
import { Route53Client } from "@aws-sdk/client-route-53";
import emptyServerStopper from './emptyServerStopper';
import startBeaconServer from "./beacon";

export const hosts: HostObject = hostConfigObjectToHostObject(hostConfig);
export const ec2Client = new EC2Client(ec2Config);
export const route53Client = new Route53Client(route53Config);

console.log(hosts);

startBeaconServer();
emptyServerStopper();