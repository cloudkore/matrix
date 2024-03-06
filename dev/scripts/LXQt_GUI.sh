#!/bin/bash

# Update package lists
sudo apt update -y

# Upgrade installed packages
sudo apt upgrade -y

# Install LXQt Desktop, Default JRE and Firefox
sudo apt install -y lxde-core default-jre firefox-esr

# Reconfigure CA Certificates
sudo dpkg-reconfigure ca-certificates-java

# Create a "packages" directory and navigate into it
mkdir ~/packages
cd ~/packages

# Download Chrome Remote Desktop and install it
wget https://deb.rug.nl/ppa/mirror/dl.google.com/linux/chrome-remote-desktop/deb/pool/main/c/chrome-remote-desktop/chrome-remote-desktop_114.0.5735.35_amd64.deb
sudo dpkg -i chrome-remote-desktop_114.0.5735.35_amd64.deb
sudo apt --fix-broken install -y

# Create an "EMU" directory and navigate into it
mkdir ~/EMU
cd ~/EMU

# Download Microemulator JAR file
wget https://github.com/cloudkore/matrix/raw/main/data/EMU/Desktop/AngelChipEmulator.jar

# Create a "Desktop" folder and set its permissions
mkdir ~/Desktop
chmod 700 ~/Desktop

# Navigate into the "Desktop" folder
cd ~/Desktop

# Download the ME.sh script and make it executable
wget https://github.com/cloudkore/matrix/raw/main/dev/scripts/ME.sh
chmod u+x ME.sh

echo "Installation completed. Rebooting the server..."
sudo reboot
