# beacon-mc
Host a small server that launches a big minecraft server and redirects the player when they connect.


## beacon server
### DDNS
- [ ] if main server is alive, assign main server's IP to the domain
- [ ] else, assign beacon server's IP to the domain

### node-minecraft-protocol server
- [ ] detects when a user tries to connect to the beacon server in Minecraft, and boots the main server EC2 instance using aws-cli
- [ ] disconnects the player with the message that the main server is booting

## main server
### MC Server
- [x] boots on startup with a systemd service
- [x] when service exits, safely shut down minecraft server with RCON

### SFTP Server
- [ ] to access and edit server files