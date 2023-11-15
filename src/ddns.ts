import { Resolver, promises } from "dns";
import { hosts } from "./index.js";

const dnsTimeout = 10 * 1000;


function fetchDnsIP(hostName: string) {
	promises.setServers(['1.1.1.1']);
	return promises.resolve4(hostName).then(res => res[0]);
}
function fetchVpsIP(hostName: string) {
	return hosts[hostName].virtualServer.getIP();
}
function fetchBeaconIP() {
	return fetch('https://api.ipify.org').then(res => res.text());
}

async function checkStarted(hostName: string) {
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

export default function ddns() {
	setInterval(() => {
		fetchBeaconIP();
		Object.keys(hosts).forEach(checkDns);
	}, dnsTimeout);
}