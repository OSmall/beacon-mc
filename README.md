# beacon-mc
Host a small server that launches a big minecraft server and redirects the player when they connect.


## beacon server
### DDNS
- [X] if main server is alive, assign main server's IP to the domain
- [X] else, assign beacon server's IP to the domain

### node-minecraft-protocol server
- [x] detects when a user tries to connect to the beacon server in Minecraft, and boots the main server EC2 instance using aws-cli
- [x] disconnects the player with the message that the main server is booting
- [x] add a timeout for sending EC2 boot requests
- [x] make a systemd service

## main server
### MC Server
- [x] boots on startup with a systemd service
- [x] when service stops, safely shut down minecraft server with RCON
- [x] when service stops, stop EC2 instance

### AFK+ Plugin
- [x] [plugin link][AFK+]

### EmptyServerStopper Plugin
- [x] [plugin link][EmptyServerStopper]


### SFTP Server
- [ ] to access and edit server files


[AFK+]: https://www.spigotmc.org/resources/afk.35065/
[EmptyServerStopper]: https://www.spigotmc.org/resources/emptyserverstopper.19409/