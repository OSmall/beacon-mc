#!/home/ec2-user/.nvm/versions/node/v16.19.1/bin/node

import mc from 'minecraft-protocol';
import { EC2Client, StartInstancesCommand } from "@aws-sdk/client-ec2";
import { ec2Config, hosts } from "./sensitive";
import { beaconMotd, errTimeout, timeout } from './config';

const ec2Client = new EC2Client(ec2Config);

const server = mc.createServer({
	motd: beaconMotd,
	maxPlayers: 0,
	port: 25565,
	version: false, // works for all mc versions
});

server.on('login', (client: mc.ServerClient) => {
	client.on('end', () => {
		console.log(client.username + ' disconnected', '(' + addr + ')');
	});

	const addr = client.socket.remoteAddress + ':' + client.socket.remotePort;
	console.log(client.username + ' connected', '(' + addr + ')');
	
	let hostName = client.serverHost.split('\0')[0];
	if (hostName === undefined) {
		client.end(`Error, host name undefined`);
		return;
	}

	const startCommand = new StartInstancesCommand({ "InstanceIds": [hosts[hostName].awsInstanceId] });

	if (Date.now() > hosts[hostName].lastBoot + hosts[hostName].bootDuration * 1000) {
		ec2Client.send(startCommand).then(() => console.log(`Booting ${hostName} EC2 instance`));
		hosts[hostName].lastBoot = Date.now();
	}

	client.end(`Server booting now... try again in around ${hosts[hostName].bootDuration} seconds`);
});

server.on('error', function (error) {
	console.log('Error:', error);
});

server.on('listening', function () {
	console.log('Server listening on port', server.socketServer.address().port);
});


// ----Empty Server----

function checkServer(host: string)  {
	console.log(host);
	mc.ping({ host: host }, (_err, result) => {
		console.log(result);
		// TODO: shut off server when empty
	}).then(() => {
		setTimeout(() => checkServer(host), timeout);
	}).catch((err) => {
		console.error(err);
		setTimeout(() => checkServer(host), errTimeout);
	});
}

Object.keys(hosts).forEach((host) => {checkServer(host)});
