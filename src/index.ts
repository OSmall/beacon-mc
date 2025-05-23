#!/usr/bin/env node
import { hostConfig } from "./sensitive.js";
import { HostObject, hostConfigObjectToHostObject } from './types.js';
import emptyServerStopper from './emptyServerStopper.js';
import startBeaconServer from "./beacon.js";
import ddns from "./ddns.js";

export const hosts: HostObject = hostConfigObjectToHostObject(hostConfig);

console.log(hosts);

startBeaconServer();
emptyServerStopper();
ddns();