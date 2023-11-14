#!/home/ec2-user/.nvm/versions/node/v16.19.1/bin/npx tsc && /home/ec2-user/.nvm/versions/node/v16.19.1/bin/node

import { hostConfig, route53Config } from "./sensitive0.js";
import { HostObject, hostConfigObjectToHostObject } from './types.js';
import { Route53Client } from "@aws-sdk/client-route-53";
import emptyServerStopper from './emptyServerStopper.js';
import startBeaconServer from "./beacon.js";
import ddns from "./ddns.js";

export const hosts: HostObject = hostConfigObjectToHostObject(hostConfig);
export const route53Client = new Route53Client(route53Config);

console.log(hosts);

startBeaconServer();
emptyServerStopper();
// ddns();