#!/bin/bash

# Simple web server for testing YM2149 WASM player
# Run this script and open http://localhost:8000/simple-player.html

cd "$(dirname "$0")"

echo "Starting YM2149 Web Player server: http://localhost:8000 ..."
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python3 -m http.server 8000 --bind 0.0.0.0
