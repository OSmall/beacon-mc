import mc, { NewPingResult, OldPingResult } from "minecraft-protocol";
import { hosts } from "./index";
import { StopInstancesCommand } from "@aws-sdk/client-ec2";
import { errTimeout, timeout } from "./config";

function getPlayerCount(pingResult: OldPingResult | NewPingResult): number {
	if ((pingResult as NewPingResult)?.players?.online !== undefined)
		return (pingResult as NewPingResult).players.online;
	else if ((pingResult as OldPingResult)?.playerCount !== undefined)
		return (pingResult as OldPingResult).playerCount;
	else
		throw new Error("Unable to get player count");
}

function stopEC2() {

}

function handlePing(hostName: string, pingResult: OldPingResult | NewPingResult): void {

	console.log(pingResult);

	// set time that the server last had at least one player in it
	let playerCount = getPlayerCount(pingResult);
	if (playerCount !== 0) hosts[hostName].lastOccupied = Date.now();

	if (Date.now() > hosts[hostName].lastOccupied + hosts[hostName].idleTime * 1000) {
		stopEC2();
	}

}

function handlePingError(hostName: string) {
	// set last occupied time to now because we don't want to send the EC2 stop command when the server is off
	hosts[hostName].lastOccupied = Date.now();
}

function checkServer(hostName: string) {
	const stopCommand = new StopInstancesCommand({ InstanceIds: [hosts[hostName].ec2InstanceId] });
	console.log(hostName);

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
	Object.keys(hosts).forEach((host) => { checkServer(host); });
}

export default emptyServerStopper;