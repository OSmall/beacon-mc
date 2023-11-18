import mc, { NewPingResult, OldPingResult } from "minecraft-protocol";
import { hosts } from "./index.js";
import { errTimeout, timeout } from "./config.js";
import { fetchBeaconIP } from "./ddns.js";

function getPlayerCount(pingResult: OldPingResult | NewPingResult): number {
	if ((pingResult as NewPingResult)?.players?.online !== undefined)
		return (pingResult as NewPingResult).players.online;
	else if ((pingResult as OldPingResult)?.playerCount !== undefined)
		return (pingResult as OldPingResult).playerCount;
	else
		throw new Error("Unable to get player count");
}

function handlePing(hostName: string, pingResult: OldPingResult | NewPingResult): void {
	// set time that the server last had at least one player in it
	let playerCount = getPlayerCount(pingResult);
	if (playerCount !== 0 || (pingResult as NewPingResult).players.max === 0) hosts[hostName].lastOccupied = Date.now(); // TODO check based on AWS EC2 instance state

	if (Date.now() > hosts[hostName].lastOccupied + hosts[hostName].idleTime * 1000) {
		console.log(`${hostName} has been idle for ${hosts[hostName].idleTime} seconds... stopping server`);
		
		// stop server
		hosts[hostName].virtualServer.stop().then(() => {
			// update DNS to Beacon IP
			fetchBeaconIP().then((beaconIP) => {
				hosts[hostName].dns.update(beaconIP);
			});
		});
	}
}

function handlePingError(hostName: string) {
	// set last occupied time to now because we don't want to send the EC2 stop command when the server is off
	hosts[hostName].lastOccupied = Date.now();
}

function checkServer(hostName: string) {
	mc.ping({ host: hostName }, (_err, result) => {
		if (!result) return;
		handlePing(hostName, result);
	}).then(() => {
		setTimeout(() => checkServer(hostName), timeout);
	}).catch((_err) => {
		handlePingError(hostName);
		setTimeout(() => checkServer(hostName), errTimeout);
	});
}

export function emptyServerStopper(): void {
	Object.keys(hosts).forEach(checkServer);
}

export default emptyServerStopper;