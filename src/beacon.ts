import mc from 'minecraft-protocol';
import { hosts } from "./index.js";
import { beaconMotd, beaconPort } from "./config.js";
import { fetchVpsIP } from './ddns.js';

function verifyHostName(hostName: string) {
	if (hostName === undefined)
		throw new Error('host name undefined');
	if (hosts[hostName] === undefined)
		throw new Error(`server accessed from unspecified host: ${hostName}`);
}

function handleServerLogin(client: mc.ServerClient & { serverHost: string }) {
	// consts
	const addr = client.socket.remoteAddress + ':' + client.socket.remotePort;
	const hostName = client.serverHost?.split('\0')[0];

	// console logs
	console.log(`${client.username} connected (${addr})`);
	client.on('end', () => {
		console.log(`${client.username} disconnected (${addr})`);
	});

	// verify host name
	try {
		verifyHostName(hostName);
	} catch (error) {
		console.error(error);
		client.end('beacon-mc: error: host name rejected');
		return;
	}

	// if enough time has passed since the last boot, start the virtual server
	if (Date.now() > hosts[hostName].lastBoot + hosts[hostName].bootDuration * 1000) {
		hosts[hostName].virtualServer.start().then(() => {
			client.end(`beacon-mc: Server booting now... try again in around ${hosts[hostName].bootDuration} seconds`);
			
			// update DNS to VPS IP
			setTimeout(() => fetchVpsIP(hostName).then((vpsIP) => { // TODO change to an event-based system responding to AWS EC2 state changes using EventBridge https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cloudwatch-events/#description 
				hosts[hostName].dns.update(vpsIP);
			}), 5000);
		}).catch((reason) => {
			console.error("unable to start virtual server", reason);
			client.end('beacon-mc: error: unable to start virtual server');
		});

		hosts[hostName].lastBoot = Date.now();
	} else {
		client.end('beacon-mc: Server still booting... try again soon');
	}
}

export function startBeaconServer() {
	const server: mc.Server & { socketServer?: any } = mc.createServer({
		motd: beaconMotd,
		maxPlayers: 0,
		port: beaconPort,
		version: false, // works for all mc versions
		"online-mode": false,
	});

	server.on('playerJoin', (client) => handleServerLogin(client as mc.ServerClient & { serverHost: string }));

	server.on('login', (client) => {
		console.log('login event:', client);
	});

	server.on('connection', (client) => {
		console.log('connection event:', client);
	});

	server.on('playerJoin', (client) => {
		console.log('playerJoin event:', client);
	});

	server.on('error', function (error) {
		console.error('error event:', error);
	});

	server.on('listening', function () {
		console.log('Server listening on port', server.socketServer?.address?.()?.port);
	});
}

export default startBeaconServer;