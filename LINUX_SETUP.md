# 🐧 Running SnifferX on Linux

## 🎯 **Three Ways to Test on Linux**

---

## **Option 1: WSL (Windows Subsystem for Linux)** ⭐ RECOMMENDED

### **Step 1: Install WSL (if not already installed)**

Open **PowerShell as Administrator** and run:

```powershell
# Install WSL and Ubuntu
wsl --install

# OR if already installed, just install Ubuntu
wsl --install -d Ubuntu-22.04

# Reboot your computer after installation
```

### **Step 2: Launch WSL**

```powershell
# Open Ubuntu terminal
wsl

# You're now in Linux! 🎉
```

### **Step 3: Install Dependencies in WSL**

```bash
# Update package list
sudo apt update

# Install Node.js (v20)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install tshark (Wireshark command-line)
sudo apt install -y tshark

# Allow non-root user to capture packets
sudo dpkg-reconfigure wireshark-common
# Select "Yes" when asked "Should non-superusers be able to capture packets?"

# Add your user to wireshark group
sudo usermod -aG wireshark $USER

# Apply group changes (logout/login or run this)
newgrp wireshark

# Verify installations
node --version     # Should show v20.x.x
tshark --version   # Should show Wireshark version
```

### **Step 4: Copy SnifferX to WSL**

```bash
# Navigate to Linux home directory
cd ~

# Copy from Windows to WSL
cp -r /mnt/c/Users/user/OneDrive/Desktop/SnifferX ./SnifferX

# Navigate to project
cd SnifferX

# Install Node.js dependencies
npm install
```

### **Step 5: Update tshark Path for Linux**

Edit `src/capture/captureManager.js`:

```bash
# Open with nano editor
nano src/capture/captureManager.js

# Find this line:
#   this.tsharkPath = 'C:\\Program Files\\Wireshark\\tshark.exe';
# 
# Change to:
#   this.tsharkPath = '/usr/bin/tshark';

# Save: Ctrl+O, Enter
# Exit: Ctrl+X
```

### **Step 6: List Network Interfaces**

```bash
# List available interfaces
tshark -D

# Example output:
# 1. eth0
# 2. lo (Loopback)
# 3. any (Pseudo-device that captures on all interfaces)
```

### **Step 7: Run Detection Test**

```bash
# Run on interface 1 (eth0)
sudo node detection-test.js 1

# OR capture on all interfaces
sudo node detection-test.js 3

# Press Ctrl+C to stop
```

**Why `sudo`?** Packet capture requires root privileges on Linux.

---

## **Option 2: Virtual Machine (VirtualBox/VMware)**

### **Step 1: Download Ubuntu ISO**
- Go to: https://ubuntu.com/download/desktop
- Download Ubuntu 22.04 LTS

### **Step 2: Install VirtualBox**
- Download: https://www.virtualbox.org/wiki/Downloads
- Install VirtualBox on Windows

### **Step 3: Create Ubuntu VM**
```
1. Open VirtualBox
2. Click "New"
3. Name: SnifferX-Lab
4. Type: Linux
5. Version: Ubuntu (64-bit)
6. RAM: 4GB minimum
7. Storage: 25GB
8. Install Ubuntu from ISO
```

### **Step 4: Install SnifferX**

In Ubuntu VM terminal:

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install tshark
sudo apt install -y tshark

# Configure wireshark
sudo dpkg-reconfigure wireshark-common  # Select "Yes"
sudo usermod -aG wireshark $USER
newgrp wireshark

# Clone from GitHub
git clone https://github.com/Vyomkhurana/SnifferX.git
cd SnifferX

# Install dependencies
npm install
```

### **Step 5: Update tshark Path**

```bash
nano src/capture/captureManager.js

# Change:
#   this.tsharkPath = 'C:\\Program Files\\Wireshark\\tshark.exe';
# To:
#   this.tsharkPath = '/usr/bin/tshark';
```

### **Step 6: Run**

```bash
sudo node detection-test.js 1
```

---

## **Option 3: Cloud Linux Server (AWS/DigitalOcean)**

### **AWS EC2 (Free Tier)**

1. **Create EC2 Instance:**
   - Go to: https://aws.amazon.com/free/
   - Launch EC2 instance (Ubuntu 22.04)
   - Instance type: t2.micro (free tier)

2. **Connect via SSH:**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

3. **Install SnifferX:**
   ```bash
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install tshark
   sudo apt install -y tshark
   
   # Clone project
   git clone https://github.com/Vyomkhurana/SnifferX.git
   cd SnifferX
   npm install
   
   # Update tshark path
   nano src/capture/captureManager.js
   # Change to: this.tsharkPath = '/usr/bin/tshark';
   
   # Run
   sudo node detection-test.js 1
   ```

---

## 🔧 **Linux-Specific Configuration**

### **Create Linux-Compatible captureManager.js**

Since tshark path is different on Linux, let's make it auto-detect:

```javascript
// In src/capture/captureManager.js constructor:

constructor(config) {
    this.config = config;
    this.captureProcess = null;
    this.isCapturing = false;
    this.packetCount = 0;
    this.startTime = null;
    this.packets = [];
    
    // Auto-detect tshark path based on platform
    if (process.platform === 'win32') {
        this.tsharkPath = 'C:\\Program Files\\Wireshark\\tshark.exe';
    } else {
        // Linux/Mac
        this.tsharkPath = '/usr/bin/tshark';
    }
    
    this.callbacks = {
        onPacket: null,
        onError: null,
        onEnd: null
    };
}
```

---

## 📝 **Quick Script for Linux**

Create `linux-detection-test.sh`:

```bash
#!/bin/bash

echo "╔════════════════════════════════════════════════════════╗"
echo "║         SnifferX Linux Detection Test              ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run as root (use sudo)"
    exit 1
fi

# Check if tshark is installed
if ! command -v tshark &> /dev/null; then
    echo "❌ tshark not found. Installing..."
    apt update
    apt install -y tshark
fi

# List interfaces
echo "📡 Available network interfaces:"
tshark -D
echo ""

# Prompt for interface
read -p "Enter interface number: " INTERFACE

# Run detection
echo ""
echo "🚀 Starting detection on interface $INTERFACE..."
node detection-test.js $INTERFACE
```

Make it executable:
```bash
chmod +x linux-detection-test.sh
sudo ./linux-detection-test.sh
```

---

## 🎯 **Testing Real Attacks on Linux**

### **1. Test DDoS Detection**

Generate high packet rate:

```bash
# In terminal 1: Run SnifferX
sudo node detection-test.js 1

# In terminal 2: Generate traffic with hping3
sudo apt install hping3
sudo hping3 --flood --rand-source google.com

# SnifferX should detect DDoS! 🚨
```

### **2. Test Port Scanning Detection**

```bash
# In terminal 1: Run SnifferX
sudo node detection-test.js 1

# In terminal 2: Run nmap scan
sudo apt install nmap
nmap -p 1-1000 192.168.1.1

# SnifferX should detect port scan! 🚨
```

### **3. Test IP Spoofing Detection**

```bash
# In terminal 1: Run SnifferX
sudo node detection-test.js 1

# In terminal 2: Spoof IP with scapy
sudo apt install python3-scapy
sudo python3 << EOF
from scapy.all import *
send(IP(src="8.8.8.8", dst="192.168.1.1")/ICMP())
EOF

# SnifferX should detect spoofing! 🚨
```

---

## 🐛 **Common Linux Issues & Fixes**

### **Issue 1: "Permission denied" when capturing**

```bash
# Solution: Run with sudo
sudo node detection-test.js 1

# OR add user to wireshark group
sudo usermod -aG wireshark $USER
newgrp wireshark
```

### **Issue 2: "tshark: command not found"**

```bash
# Solution: Install tshark
sudo apt update
sudo apt install -y tshark
```

### **Issue 3: "No interfaces found"**

```bash
# Check interfaces
ip link show

# Check if tshark can see them
sudo tshark -D

# If not, install libpcap
sudo apt install libpcap-dev
```

### **Issue 4: Node.js version too old**

```bash
# Remove old Node.js
sudo apt remove nodejs

# Install latest
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version  # Should be v20+
```

---

## 📊 **Expected Results on Linux**

```bash
$ sudo node detection-test.js 1

╔════════════════════════════════════════════════════════╗
║           SnifferX Detection System Test            ║
╚════════════════════════════════════════════════════════╝

[2025-10-12 15:30:45] ℹ️  INFO: 🛡️  DDoS Detector initialized
[2025-10-12 15:30:45] ℹ️  INFO: 🔍 Port Scan Detector initialized
[2025-10-12 15:30:45] ℹ️  INFO: 🎭 IP Spoofing Detector initialized

✓ All detectors initialized

🚀 Starting capture on interface 1 (eth0)...

📊 Live Statistics:
────────────────────────────────────────────────────────
  Packets: 1,234
  Duration: 15s
  Rate: 82.3 pps

🛡️  DDoS Detection:
  Tracked IPs: 45
  Alerts: 0

🔍 Port Scan Detection:
  Tracked IPs: 38
  Alerts: 0

🎭 IP Spoofing Detection:
  Tracked IPs: 42
  Alerts: 0

✅ All systems operational
```

---

## 🎓 **Advantages of Testing on Linux**

1. ✅ **Native Environment** - Most servers run Linux
2. ✅ **Better Tools** - hping3, nmap, scapy available
3. ✅ **Real Attacks** - Can test with actual attack tools
4. ✅ **Performance** - Faster packet processing
5. ✅ **Professional** - Learn real-world deployment

---

## 🚀 **Quick Start (TL;DR)**

```bash
# 1. Install WSL (PowerShell as Admin)
wsl --install

# 2. Launch WSL
wsl

# 3. Install dependencies
sudo apt update
sudo apt install -y nodejs npm tshark
sudo dpkg-reconfigure wireshark-common  # Select "Yes"
sudo usermod -aG wireshark $USER
newgrp wireshark

# 4. Copy project
cp -r /mnt/c/Users/user/OneDrive/Desktop/SnifferX ~/SnifferX
cd ~/SnifferX
npm install

# 5. Update tshark path (add auto-detection)
nano src/capture/captureManager.js
# Add platform detection (see above)

# 6. Run
sudo node detection-test.js 1
```

**That's it! You're running SnifferX on Linux!** 🎉

---

## 📚 **Next Steps After Linux Testing**

1. ✅ Test all three detectors
2. ✅ Try real attack simulation (hping3, nmap)
3. ✅ Compare Windows vs Linux performance
4. ✅ Deploy on cloud server (AWS/DigitalOcean)
5. ✅ Continue to Phase 4: Analysis Engine

**Ready to try it on Linux?** 🐧
