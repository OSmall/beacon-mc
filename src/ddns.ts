import { promises } from "dns";
import { hosts } from "./index.js";
import fetch from "node-fetch";

const dnsTimeout = 60 * 1000; // TODO: move this to config


function fetchDnsIP(hostName: string) {
	promises.setServers(['1.1.1.1']);
	return promises.resolve4(hostName).then(res => res[0]).catch(console.error);
}
export function fetchVpsIP(hostName: string) {
	return hosts[hostName].virtualServer.getIP();
}
export function fetchBeaconIP() {
	return fetch('https://api.ipify.org').then(res => res.text());
}

async function checkStarted(hostName: string) { // TODO validate IPs
	// DNS record needs to point to VPS
	const dnsIP = await fetchDnsIP(hostName);
	const vpsIP = await fetchVpsIP(hostName);

	if (dnsIP === vpsIP) {
		console.log(`no IP change needed: ${dnsIP}`);
		return;
	}

	hosts[hostName].dns.update(vpsIP);
}

async function checkStopped(hostName: string) {
	// DNS record needs to point to Beacon
	const dnsIP = await fetchDnsIP(hostName);
	const beaconIP = await fetchBeaconIP();

	if (dnsIP === beaconIP) {
		console.log(`no IP change needed: ${dnsIP}`);
		return;
	}

	hosts[hostName].dns.update(beaconIP);
}

async function checkDns(hostName: string) {
	const state = await hosts[hostName].virtualServer.getState();

	switch (state) {
		case 'pending':
		case 'running':
			checkStarted(hostName);
			break;
		case 'stopped':
		case 'stopping':
			checkStopped(hostName);
			break;
	}
}

function repeatedCheckDns(hostName: string) {
	checkDns(hostName).then(() => {
		setTimeout(() => repeatedCheckDns(hostName), dnsTimeout);
	});
}

export default function ddns() {
	Object.keys(hosts).forEach(repeatedCheckDns);
}