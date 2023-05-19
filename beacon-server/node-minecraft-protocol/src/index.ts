#!/home/ec2-user/.nvm/versions/node/v16.19.1/bin/node

import { ec2Config, hostConfig } from "./sensitive";
import { HostObject, hostConfigObjectToHostObject } from './types';
import emptyServerStopper from './emptyServerStopper';
import startBeaconServer from "./beacon";

export { ec2Config };
export const hosts: HostObject = hostConfigObjectToHostObject(hostConfig);

console.log(hosts);

startBeaconServer();
emptyServerStopper();