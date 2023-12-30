#!/bin/bash

# Update package lists
sudo apt update

# Upgrade installed packages
sudo apt upgrade -y

# Install XFCE, Terminal, Firefox ESR, and Default JRE
sudo apt install -y xfce4 xfce4-terminal firefox-esr default-jre

# Install dependencies
sudo apt --fix-broken install -y

# Create a "packages" directory and navigate into it
mkdir ~/packages
cd ~/packages

# Download Chrome Remote Desktop and install it
wget https://dl.google.com/linux/direct/chrome-remote-desktop_current_amd64.deb
sudo dpkg -i chrome-remote-desktop_current_amd64.deb
sudo apt --fix-broken install -y

# Create an "EMU" directory and navigate into it
mkdir ~/EMU
cd ~/EMU

# Download Microemulator JAR file
wget https://github.com/cloudkore/matrix/raw/main/dev/assets/microemulator.jar

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
