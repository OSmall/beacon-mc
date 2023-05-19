import mc from 'minecraft-protocol';
import { StartInstancesCommand } from "@aws-sdk/client-ec2";
import { ec2Client, hosts } from "./index";
import { beaconMotd, beaconPort } from "./config";

function verifyHostName(hostName: string) {
  if (hostName === undefined)
    throw new Error('host name undefined');
  if (hosts[hostName] === undefined)
    throw new Error(`server accessed from unspecified host: ${hostName}`);
}

function startEC2(hostName: string, client: mc.ServerClient) {
  const startCommand = new StartInstancesCommand({ InstanceIds: [hosts[hostName].ec2InstanceId] });

  ec2Client.send(startCommand).then(() => {
    console.log(`Booting ${hostName} EC2 instance`);
    client.end(`Server booting now... try again in around ${hosts[hostName].bootDuration} seconds`);
  }).catch((error) => {
    client.end('beacon-mc: EC2 instance id rejected');
    console.error(new Error("EC2 instance won't start. ID rejected", { cause: error }));
  });

  hosts[hostName].lastBoot = Date.now();
}

function handleServerLogin(client: mc.ServerClient) {
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
    client.end('beacon-mc: Host rejected');
    return;
  }

  // if enough time has passed since the last boot, start the EC2 server
  if (Date.now() > hosts[hostName].lastBoot + hosts[hostName].bootDuration * 1000) {
    startEC2(hostName, client);
  }
}

export function startBeaconServer() {
  const server = mc.createServer({
    motd: beaconMotd,
    maxPlayers: 0,
    port: beaconPort,
    version: false, // works for all mc versions
  });

  server.on('login', handleServerLogin);

  server.on('error', function (error) {
    console.error('Error:', error);
  });

  server.on('listening', function () {
    console.log('Server listening on port', server.socketServer.address().port);
  });
}

export default startBeaconServer;