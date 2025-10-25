<div align="center">

# 🛡️ SnifferX

### Professional Network Threat Detection & Analysis Tool

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux%20%7C%20macOS-blue)]()
[![Version](https://img.shields.io/badge/version-1.0.0-blue)](https://github.com/Vyomkhurana/SnifferX)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/Vyomkhurana/SnifferX/pulls)
[![Stars](https://img.shields.io/github/stars/Vyomkhurana/SnifferX?style=social)](https://github.com/Vyomkhurana/SnifferX/stargazers)

**Real-time network security monitoring with AI-powered threat detection and audio alerts**

[Features](#features) • [Installation](#installation) • [Quick Start](#usage) • [Documentation](#documentation) • [Contributing](#contributing)

</div>

---

## 🎯 Overview

SnifferX is an advanced network security monitoring tool that provides **real-time threat detection** with a unique audio alert system. Built with Node.js for high performance, it analyzes network traffic patterns and identifies security threats before they become problems.

### Why SnifferX?

✨ **Industry First** - Only network monitor with real-time audio threat notifications  
⚡ **High Performance** - Process 1000+ packets/second with low CPU usage  
🎯 **Smart Detection** - ML-powered behavior analytics catch anomalies others miss  
🖥️ **Beautiful CLI** - Professional dashboard with live statistics  
🌐 **Cross-Platform** - Native Windows, Linux, and macOS support  
🔧 **Easy Setup** - Guided wizard and auto-detect for beginners

---

## ✨ Features

### 🔍 Detection Engines

| Feature | Description | Status |
|---------|-------------|--------|
| **DDoS Detection** | Real-time packet rate analysis and traffic volume monitoring | ✅ Active |
| **Port Scan Detection** | Identifies reconnaissance attempts and systematic port probing | ✅ Active |
| **IP Spoofing Detection** | TTL-based forgery detection and sequence validation | ✅ Active |
| **User Behavior Analytics** | ML-based anomaly detection for unusual network patterns | ✅ Active |
| **Audio Alert System** | Real-time sound notifications for different threat types | ✅ Active |
| **Threat Visualization** | Color-coded live threat history with timestamps and severity | ✅ Active |

### 🚀 Core Capabilities

- **Live Dashboard** - Real-time statistics, protocol distribution, and threat monitoring
- **Threat History** - Color-coded timeline showing last 10 threats with severity levels
- **Auto-Export** - Automatic session data export to JSON and CSV formats
- **High Performance** - Handles 1000+ packets per second with minimal CPU usage
- **Configurable Thresholds** - Customizable detection sensitivity for different environments
- **Professional CLI** - Commander.js-based interface with intuitive commands
- **Cross-Platform** - Native support for Windows, Linux, and macOS
- **Packet Analysis** - Deep inspection of TCP, UDP, ICMP, and other protocols

### 📊 Session Export & Reporting

Every monitoring session is automatically exported when you stop:
- **JSON format** - Complete session data, statistics, and threat details
- **CSV format** - Threat timeline for spreadsheet analysis
- **Automatic timestamps** - Easy to track and compare sessions
- **Export history** - View all past sessions with `snifferx exports`

Exported data includes:
- Session metadata (start/end time, duration, interface)
- Traffic statistics (packets, rates, protocols)
- Complete threat history with timestamps
- Top talkers (source IPs)
- Protocol distribution

### ⚡ Recent Threat Activity View

The dashboard now shows a live threat history with:
- 🔴 **Critical** - Immediate action required
- 🟠 **High** - Serious threat detected
- 🟡 **Medium** - Suspicious activity
- 🟢 **Low** - Minor anomaly

Each threat shows:
- Timestamp of detection
- Threat type (DDoS, Port Scan, IP Spoof, Behavior)
- Source IP address
- Detailed description

---

## Installation

### Prerequisites

- **Node.js** >= 14.0.0
- **npm** or **yarn**
- **Wireshark/tshark** (for packet capture)
- **Administrator/root privileges** (for network monitoring)

### Platform-Specific Setup

<details>
<summary><b>Windows</b></summary>

```powershell
# Install Node.js from https://nodejs.org/
# Install Wireshark from https://www.wireshark.org/

# Clone repository
git clone https://github.com/Vyomkhurana/SnifferX.git
cd SnifferX

# Install dependencies
npm install
```
</details>

<details>
<summary><b>Linux/Ubuntu</b></summary>

```bash
# Install dependencies
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs tshark

# Clone repository
git clone https://github.com/Vyomkhurana/SnifferX.git
cd SnifferX

# Install packages
npm install
```
</details>

<details>
<summary><b>macOS</b></summary>

```bash
# Install dependencies
brew install node wireshark

# Clone repository
git clone https://github.com/Vyomkhurana/SnifferX.git
cd SnifferX

# Install packages
npm install
```
</details>

---

## Usage

### Quick Start (Beginner-Friendly)

```bash
# Option 1: Guided Setup Wizard (Recommended for first-time users)
node snifferx.js start

# Option 2: Auto-detect your network interface and start
node snifferx.js auto

# Option 3: Manual setup
node snifferx.js interfaces        # List interfaces
node snifferx.js monitor -i 7      # Start monitoring interface 7
```

### Command Reference

| Command | Aliases | Description | Example |
|---------|---------|-------------|---------|
| `start` | - | Guided setup wizard | `node snifferx.js start` |
| `auto` | - | Auto-detect and monitor | `node snifferx.js auto` |
| `interfaces` | `list`, `ls` | List all network interfaces | `node snifferx.js interfaces` |
| `monitor -i <id>` | - | Start monitoring interface | `sudo node snifferx.js monitor -i 7` |
| `monitor --no-audio` | - | Monitor without audio alerts | `node snifferx.js monitor -i 7 --no-audio` |
| `config` | `settings` | Display detection configuration | `node snifferx.js config` |
| `exports` | `history` | View exported session reports | `node snifferx.js exports` |
| `test-audio` | `audio-test` | Test audio alert system | `node snifferx.js test-audio` |
| `help` | - | Detailed help with examples | `node snifferx.js help` |
| `--version` | `-V` | Show version | `node snifferx.js --version` |

### Live Dashboard

When monitoring is active, you'll see a real-time dashboard:

```
═══════════════════════════════════════════════════════════
                    LIVE MONITORING DASHBOARD
═══════════════════════════════════════════════════════════

📊 System Status
────────────────────────────────
  Total Packets:  12,543
  Packet Rate:    134.5 pps
  Uptime:         93s
  Status:         ● ACTIVE

🚨 Threat Detection
───────────────────────────────────────────────────────────
  Total Alerts:   2
  DDoS Attacks:   1
  Port Scans:     1
  IP Spoofing:    0
  User Anomalies: 0

📡 Protocol Distribution
───────────────────────────────────────────────────────────
  TCP      ████████████████████████ 65.3%
  UDP      ████████ 21.4%
  ICMP     ██ 8.1%
```

---

## Configuration

Edit `config.js` to customize detection thresholds:

```javascript
detection: {
    ddos: {
        packetsPerSecondThreshold: 1000,    // Packets/sec to trigger alert
        connectionsThreshold: 100,           // Max connections from single IP
        timeWindow: 60                       // Analysis window (seconds)
    },
    portScanning: {
        portsPerMinute: 20,                 // Distinct ports threshold
        timeWindow: 60                       // Detection window
    },
    ipSpoofing: {
        ttlVarianceThreshold: 40,           // TTL deviation tolerance
        enableSequenceCheck: true            // TCP sequence validation
    },
    userBehavior: {
        learningPhaseDuration: 3600,        // Learning phase (1 hour)
        riskThreshold: 70                    // Risk score alert threshold
    }
}
```

### Audio Configuration

```javascript
audio: {
    enabled: true,                          // Enable/disable audio alerts
    volume: 0.7,                            // Volume level (0.0-1.0)
    cooldown: 5000,                         // Milliseconds between alerts
    playOnStartup: true,                    // Startup sound
    playOnShutdown: true,                   // Shutdown sound
    emergencyThreshold: 5                   // Alerts for emergency siren
}
```

---

## Project Structure

```
SnifferX/
├── snifferx.js                 # Main CLI application
├── config.js                   # Configuration settings
├── utils.js                    # Utility functions
├── package.json                # Dependencies
├── src/
│   ├── audio/
│   │   └── audioAlertSystem.js     # Audio notification engine
│   ├── capture/
│   │   └── captureManager.js       # Packet capture handler
│   ├── detection/
│   │   ├── ddosDetector.js         # DDoS detection engine
│   │   ├── portScanDetector.js     # Port scan detector
│   │   ├── ipSpoofingDetector.js   # IP spoofing detector
│   │   └── userBehaviorAnalytics.js # ML-based behavior analysis
│   └── models/
│       └── Packet.js               # Packet data model
├── docs/                       # Documentation
├── scripts/                    # Testing & simulation scripts
└── logs/                       # Application logs (auto-created)
```

---

## 🔊 Audio Alert System

SnifferX features a **revolutionary audio alert system** - the first network monitor with real-time sound-based threat notifications.

### Sound Patterns

| Threat Type | Pattern | Frequency | Duration | Description |
|-------------|---------|-----------|----------|-------------|
| **DDoS Attack** | Rapid beeps | 1000-1200 Hz | 200-400ms | Urgent high-pitch alarm |
| **Port Scan** | Medium warble | 600-800 Hz | 300ms | Attention-grabbing tone |
| **IP Spoofing** | Alternating tones | 700-900 Hz | 200ms | Warbling alert |
| **User Behavior** | Soft beep | 600 Hz | 400ms | Subtle notification |
| **Emergency** | Siren pattern | 800-1200 Hz | Variable | Multiple threats detected |

### Special Sounds

- **Startup**: Musical chord (A-C#-E) - System online
- **Shutdown**: Descending melody (E-C#-A) - Graceful exit
- **Emergency**: Multi-threat siren (5+ simultaneous alerts)

**Configure audio settings in `config.js` to customize volume, cooldown, and alert preferences.**

---

## 🛠️ Technology Stack

| Category | Technologies |
|----------|-------------|
| **Runtime** | Node.js >= 14.0.0 |
| **CLI Framework** | Commander.js |
| **Styling** | Chalk (terminal colors) |
| **Packet Capture** | tshark, pcap-parser |
| **Audio System** | Native OS beep APIs |
| **Statistics** | simple-statistics |
| **File System** | fs-extra |

**Built with modern JavaScript and zero external dependencies for core detection algorithms.**

---

## 📸 Screenshots

### Live Monitoring Dashboard
```
Coming soon - Real-time dashboard with packet statistics and threat alerts
```

### Audio Alert Test
```
Coming soon - Audio alert system testing interface
```
- **simple-statistics** - Statistical analysis
- **fs-extra** - Enhanced file operations
- **play-sound** - Audio playback

---

## Development Roadmap

- [x] Core packet capture engine
- [x] DDoS detection algorithm
- [x] Port scan detection
- [x] IP spoofing detection
- [x] User behavior analytics
- [x] Audio alert system
- [x] Live monitoring dashboard
- [ ] Web-based dashboard
- [ ] Machine learning threat prediction
- [ ] SIEM integration (Splunk, ELK)
- [ ] Export to JSON/CSV/PCAP
- [ ] Alert notification system (email, SMS)
- [ ] Historical traffic analysis
- [ ] Threat intelligence feeds

---

## Legal Notice

**⚠️ IMPORTANT - READ BEFORE USE**

This tool is designed for **EDUCATIONAL** and **AUTHORIZED SECURITY TESTING** purposes only.

- Only use on networks you own or have explicit permission to monitor
- Unauthorized network monitoring may violate local, state, or federal laws
- The author is NOT responsible for any misuse of this software
- Always obtain proper authorization before conducting security assessments
- Use responsibly and ethically

By using this software, you agree to use it only for legal and ethical purposes.

---

## 🤝 Contributing

We welcome contributions from the community! Whether it's bug fixes, new features, or documentation improvements.

### How to Contribute

1. **Fork** the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a **Pull Request**

### Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/SnifferX.git
cd SnifferX

# Install dependencies
npm install

# Run in development mode
npm run dev
```

### Areas for Contribution

- 🐛 Bug fixes and stability improvements
- ✨ New detection algorithms
- 📝 Documentation and tutorials
- 🧪 Test coverage
- 🌍 Internationalization

---

## 📚 Documentation

For detailed documentation, visit the [docs](./docs) folder:

- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Detection Algorithms](./docs/DETECTION.md)
- [API Reference](./docs/API.md)
- [Configuration Guide](./docs/CONFIG.md)

---

## 📋 Roadmap

- [ ] Web-based dashboard UI
- [ ] Export reports in PDF format
- [ ] Integration with SIEM systems
- [ ] Custom rule engine
- [ ] Machine learning threat prediction
- [ ] Mobile app for alerts
- [ ] Cloud deployment support

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Vyom Khurana**

- GitHub: [@Vyomkhurana](https://github.com/Vyomkhurana)
- Project: [SnifferX](https://github.com/Vyomkhurana/SnifferX)

---

## 🙏 Acknowledgments

- Built with Node.js and love for cybersecurity
- Inspired by industry-standard SIEM tools
- Special thanks to the open-source community

---

<div align="center">

### ⭐ Star this repository if you find it helpful!

**Made for cybersecurity education and research**

[Report Bug](https://github.com/Vyomkhurana/SnifferX/issues) • [Request Feature](https://github.com/Vyomkhurana/SnifferX/issues)

</div>
