#!/home/ec2-user/.nvm/versions/node/v16.19.1/bin/npx tsc && /home/ec2-user/.nvm/versions/node/v16.19.1/bin/node

import { hostConfig } from "./sensitive0.js";
import { HostObject, hostConfigObjectToHostObject } from './types.js';
import emptyServerStopper from './emptyServerStopper.js';
import startBeaconServer from "./beacon.js";
import ddns from "./ddns.js";

export const hosts: HostObject = hostConfigObjectToHostObject(hostConfig);

console.log(hosts);

startBeaconServer();
emptyServerStopper();
ddns();