# 🚀 SnifferX Quick Start Guide

## Installation (2 minutes)

### Linux/Ubuntu
```bash
git clone https://github.com/Vyomkhurana/SnifferX.git
cd SnifferX
chmod +x install.sh
./install.sh
```

### Windows
```powershell
git clone https://github.com/Vyomkhurana/SnifferX.git
cd SnifferX
npm install
npm link
```

---

## Usage (30 seconds)

### 1. List Interfaces
```bash
snifferx interfaces
```

### 2. Start Monitoring
```bash
sudo snifferx monitor -i 7
```

### 3. View Config
```bash
snifferx config
```

---

## What You'll See

```
    ███████╗███╗   ██╗██╗███████╗███████╗███████╗██████╗ ██╗  ██╗
    ██╔════╝████╗  ██║██║██╔════╝██╔════╝██╔════╝██╔══██╗╚██╗██╔╝
    ███████╗██╔██╗ ██║██║█████╗  █████╗  █████╗  ██████╔╝ ╚███╔╝ 
    ╚════██║██║╚██╗██║██║██╔══╝  ██╔══╝  ██╔══╝  ██╔══██╗ ██╔██╗ 
    ███████║██║ ╚████║██║██║     ██║     ███████╗██║  ██║██╔╝ ██╗
    ╚══════╝╚═╝  ╚═══╝╚═╝╚═╝     ╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝
    
═══════════════════════════════════════════════════════════
                    LIVE MONITORING DASHBOARD
═══════════════════════════════════════════════════════════

📊 System Status
───────────────────────────────────────────────────────────
  Total Packets:  12,543
  Packet Rate:    134.5 pps
  Uptime:         93s
  Status:         ● ACTIVE

🚨 Threat Detection
───────────────────────────────────────────────────────────
  Total Alerts:   0
  DDoS Attacks:   0
  Port Scans:     0
  IP Spoofing:    0

📡 Protocol Distribution
───────────────────────────────────────────────────────────
  TCP      ████████████████████████ 65.3%
  UDP      ████████ 21.4%
  ICMP     ██ 8.1%

🌐 Top Source IPs
───────────────────────────────────────────────────────────
  1. 192.168.1.100    → 3,245 packets
  2. 142.250.185.46   → 1,876 packets
```

---

## Detection Capabilities

### 🛡️ DDoS Detection
- Monitors packet rates per source IP
- **Alert Threshold**: 1000 packets/second
- Detects flood attacks in real-time

### 🔍 Port Scan Detection
- Tracks connection attempts
- **Alert Threshold**: 20+ ports in 60 seconds
- Identifies reconnaissance activities

### 🎭 IP Spoofing Detection
- Analyzes TTL (Time To Live) patterns
- **Alert Threshold**: 40+ hops variance
- Detects forged source addresses

---

## Example Alert

```
🚨 THREAT DETECTED!
──────────────────────────────────────────────────────────────
⚠️  HIGH: Potential DDoS from 203.0.113.50
    Rate: 1,234 pps (threshold: 1000 pps)
    Duration: 15s
Time: 2025-10-12 20:30:45
──────────────────────────────────────────────────────────────
```

---

## Testing with Attacks

```bash
# Run attack simulation
sudo ./scripts/simulate-attacks.sh

# Options:
1. DDoS Simulation
2. Port Scan Simulation
3. IP Spoofing Simulation
```

---

## Commands Cheat Sheet

| Command | Description |
|---------|-------------|
| `snifferx interfaces` | List network interfaces |
| `snifferx monitor -i <id>` | Start monitoring |
| `snifferx config` | View configuration |
| `snifferx --help` | Show help |
| `snifferx --version` | Show version |

---

## Configuration

Edit `config.js` to customize:

```javascript
detection: {
    ddos: {
        packetsPerSecondThreshold: 1000
    },
    portScanning: {
        distinctPortsThreshold: 20
    },
    ipSpoofing: {
        ttlVarianceThreshold: 40
    }
}
```

---

## Troubleshooting

### "Permission denied"
```bash
sudo snifferx monitor -i 7
```

### "tshark not found"
```bash
# Linux
sudo apt install tshark

# Mac
brew install wireshark

# Windows
# Download from wireshark.org
```

### "No interfaces found"
```bash
# Check tshark can see interfaces
sudo tshark -D
```

---

## Stop Monitoring

Press **Ctrl+C** to stop and see final report

---

## Next Steps

1. ✅ Test with normal traffic
2. ✅ Run attack simulations
3. ✅ Customize thresholds
4. ✅ Deploy on production network
5. ✅ Integrate with SIEM

---

## Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/Vyomkhurana/SnifferX/issues)
- **Author**: Vyom Khurana

---

**⚠️ Legal Notice**: Only use on networks you own or have permission to test.

---

**Made with ❤️ for cybersecurity**
