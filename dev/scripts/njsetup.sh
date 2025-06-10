#!/bin/bash

set -e

# ─── Braille Spinner Function ────────────────────────────────────────
spinner() {
    local pid=$!
    local delay=0.1
    local spinstr='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
    while kill -0 $pid 2>/dev/null; do
        for (( i=0; i<${#spinstr}; i++ )); do
            printf "\r[%c] $1" "${spinstr:$i:1}"
            sleep $delay
        done
    done
    printf "\r[✓] $1\n"
}

echo "=== Starting system setup ==="

# ─── Update Package Lists ─────────────────────────────────────────────
(sudo apt update &> /dev/null) & spinner "Updating package lists..."

# ─── Install GUI Packages ────────────────────────────────────────────
(sudo apt install -y xorg openbox pcmanfm lightdm &> /dev/null) & spinner "Installing GUI packages..."

# ─── Prepare Packages Directory ──────────────────────────────────────
mkdir -p ~/packages
cd ~/packages

# ─── Download Chrome Remote Desktop ──────────────────────────────────
(wget https://dl.google.com/linux/direct/chrome-remote-desktop_current_amd64.deb &> /dev/null) & spinner "Downloading Chrome Remote Desktop..."

# ─── Try Installing .deb ─────────────────────────────────────────────
(sudo dpkg -i chrome-remote-desktop_current_amd64.deb &> /dev/null || true) & spinner "Installing Chrome Remote Desktop..."

# ─── Fix Broken Dependencies ─────────────────────────────────────────
(sudo apt --fix-broken install -y &> /dev/null) & spinner "Fixing broken dependencies..."

cd ~

# ─── Check and Install default-jre ───────────────────────────────────
if dpkg -s default-jre &> /dev/null; then
    echo "[✓] default-jre is already installed."
else
    (sudo apt install -y default-jre &> /dev/null) & spinner "Installing default-jre..."
fi

# ─── Check if nohup Exists ───────────────────────────────────────────
if command -v nohup &> /dev/null; then
    echo "[✓] 'nohup' is available."
else
    (sudo apt install -y coreutils &> /dev/null) & spinner "Installing coreutils (for nohup)..."
fi

# ─── Setup Emulator ──────────────────────────────────────────────────
mkdir -p ~/emu
cd ~/emu
(wget https://github.com/cloudkore/matrix/raw/refs/heads/main/data/EMU/Desktop/AngelChipEmulator.jar &> /dev/null) & spinner "Downloading AngelChipEmulator.jar..."

cd ~

# ─── Setup Mods ──────────────────────────────────────────────────────
mkdir -p ~/mods
cd ~/mods
(wget https://github.com/cloudkore/matrix/raw/refs/heads/main/data/MODs/TDTV_Premium-X3.jar &> /dev/null) & spinner "Downloading TDTV_Premium-X3.jar..."

cd ~

# ─── Download and Make ac.sh Executable ──────────────────────────────
(wget https://github.com/cloudkore/matrix/raw/refs/heads/main/dev/scripts/ac.sh -O ~/ac.sh &> /dev/null) & spinner "Downloading ac.sh..."
chmod +x ~/ac.sh

echo -e "\n=== ✅ Setup completed successfully! ==="
