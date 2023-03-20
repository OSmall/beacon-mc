# beacon-mc
Host a small server that launches a big minecraft server and redirects the player when they connect.


## beacon server
### DDNS
- if main server is alive, assign main server's IP to the domain
- else assign beacon server's IP to the domain

### node-minecraft-protocol server
- detects when a user tries to connect to the beacon server in Minecraft, and launches the main server


## main server
### MC Server
- boots on startup with a systemd service
- when service exits, safely shut down minecraft server with RCON