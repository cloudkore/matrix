#!/bin/bash

set -e

echo "[*] Starting system setup..."

# Update package lists
echo "[*] Updating package lists..."
sudo apt update

# Install required GUI packages
echo "[*] Installing xorg, openbox, pcmanfm, lightdm..."
sudo apt install -y xorg openbox pcmanfm lightdm

# Create and move to packages directory
echo "[*] Creating packages directory..."
mkdir /home/$USER/packages
cd /home/$USER/packages

# Download Chrome Remote Desktop
echo "[*] Downloading Chrome Remote Desktop..."
wget https://dl.google.com/linux/direct/chrome-remote-desktop_current_amd64.deb

# Install .deb (expected to fail due to dependencies)
echo "[*] Attempting to install Chrome Remote Desktop .deb..."
sudo dpkg -i chrome-remote-desktop_current_amd64.deb || true

# Fix broken dependencies
echo "[*] Fixing broken dependencies..."
sudo apt --fix-broken install -y

# Return to home directory
cd ~

# Check if default-jre is installed
if dpkg -s default-jre >/dev/null 2>&1; then
    echo "[✓] default-jre is already installed."
else
    echo "[*] Installing default-jre..."
    sudo apt install -y default-jre
fi

# Check if 'nohup' command exists
if command -v nohup >/dev/null 2>&1; then
    echo "[✓] 'nohup' is available."
else
    echo "[!] 'nohup' not found — installing coreutils..."
    sudo apt install -y coreutils
fi

mkdir /home/$USER/emu
cd /home/$USER/emu
wget https://github.com/cloudkore/matrix/raw/refs/heads/main/data/EMU/Desktop/AngelChipEmulator.jar

mkdir /home/$USER/mods
cd /home/$USER/mods
wget https://github.com/cloudkore/matrix/raw/refs/heads/main/data/MODs/TDTV_Premium-X3.jar

echo "[*] Downloading ac.sh script..."
wget https://github.com/cloudkore/matrix/raw/refs/heads/main/dev/scripts/ac.sh -O ~/ac.sh
chmod +x ~/ac.sh

echo "[✓] Full setup completed successfully."
