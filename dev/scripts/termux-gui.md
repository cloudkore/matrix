# Download Termux x11 App : https://github.com/termux/termux-x11/releases/tag/nightly

# Run this inside Termux First

```pkg update && pkg install x11-repo && pkg install termux-x11-nightly```

# Install Proot-Distro

```pkg install proot-distro```

# Install Debian Proot-Distro

```proot-distro install debian```

# Login Debian

```proot-distro login debian --user root --shared-tmp```

# Install Core Apps

```apt update && apt install sudo nano firefox-esr```

# Set Password for Root

```passwd``` >> Set Password for Root

# Add Groups

```groupadd storage && groupadd wheel && groupadd video```

# Add User

```useradd -m -g users -G wheel,audio,video,storage -s /bin/bash user && passwd user```

# Give User Sudo

```nano /etc/sudoers```
### Under root , add 

```user ALL=(ALL:ALL) ALL```

# Login as User

```su user```
then
```cd```

# Install GUI in Debian

```sudo apt install lxde-core lxpanel dbus-x11```

# Setup Timezone

```ln -sf /usr/share/zoneinfo/Asia/Kolkata /etc/localtime```

# Install Locales

```sudo apt install locales fonts-noto-cjk```

# Config Locale

```locale-gen && echo "LANG=en_US.UTF-8" > /etc/locale.conf```

# Disable Polkit

```grep polkit /etc/xdg/lxsession/LXDE/desktop.conf && sudo sed -i 's/^polkit\/command=.*/polkit\/command=/' /etc/xdg/lxsession/LXDE/desktop.conf```

# Exit

# Login Termux

# Create Shortcut

```mkdir .shortcuts```
then
```nano .shortcuts/boot.sh```

# Bash script - Paste this inside boot.sh

```bash
#!/bin/bash
pkill -f termux-wake-lock 2>/dev/null

if ! pgrep -f "termux-x11 :0" > /dev/null; then
  echo "[+] Starting X11 server..."
  am start --user 0 -n com.termux.x11/com.termux.x11.MainActivity
  sleep 2
  XDG_RUNTIME_DIR=${TMPDIR}
  nohup termux-x11 :0 -ac >/dev/null 2>&1 &
  sleep 3
else
  echo "[+] X11 already running."
fi

echo "[+] Starting LXDE..."
proot-distro login debian --user user --shared-tmp -- bash -c \
  "export DISPLAY=:0; dbus-launch --exit-with-session startlxde"
```

# Make the Bash Script Executable
```chmod u+x boot.sh```

# Exit

# Add Widget via Homescreen of your Phone
