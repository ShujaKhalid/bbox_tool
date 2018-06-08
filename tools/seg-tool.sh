#/!/bin/sh

# Run the server
cd ~/Documents/seg-tool/server && node server.js &

# Run the application
cd ~/Documents/seg-tool/ && npm start