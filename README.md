# SnifferX 🛡️



[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)A powerful network traffic analyzer for cybersecurity analysis and threat detection.

[![Node.js](https://img.shields.io/badge/node.js-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](package.json)![License](https://img.shields.io/badge/license-ISC-blue.svg)

[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux%20%7C%20macOS-lightgrey.svg)](https://github.com/Vyomkhurana/SnifferX)![Node.js](https://img.shields.io/badge/node.js-%3E%3D14.0.0-brightgreen.svg)

![Status](https://img.shields.io/badge/status-in%20development-yellow.svg)

**Professional Network Threat Detection & Analysis Tool**![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)



Real-time network traffic monitoring with advanced threat detection capabilities. Detect DDoS attacks, port scanning, IP spoofing, and suspicious network activities.## 🚀 About



```SnifferX is a network traffic analysis tool designed to capture, analyze, and detect malicious network activities in real-time. Built with Node.js for efficient packet processing and real-time analysis. This project showcases advanced cybersecurity concepts and network monitoring techniques.

    ███████╗███╗   ██╗██╗███████╗███████╗███████╗██████╗ ██╗  ██╗

    ██╔════╝████╗  ██║██║██╔════╝██╔════╝██╔════╝██╔══██╗╚██╗██╔╝## ✨ Features

    ███████╗██╔██╗ ██║██║█████╗  █████╗  █████╗  ██████╔╝ ╚███╔╝ 

    ╚════██║██║╚██╗██║██║██╔══╝  ██╔══╝  ██╔══╝  ██╔══██╗ ██╔██╗ ### Current Features ✓

    ███████║██║ ╚████║██║██║     ██║     ███████╗██║  ██║██╔╝ ██╗- 🎨 **Interactive CLI** - Beautiful command-line interface with ASCII banner

    ╚══════╝╚═╝  ╚═══╝╚═╝╚═╝     ╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝- ⚙️ **Configuration System** - Comprehensive settings for detection thresholds

    - 📝 **Advanced Logging** - Color-coded logging with timestamps

    Network Threat Detection & Analysis Tool v1.0.0- 🛠️ **Utility Functions** - Network analysis helpers (IP validation, packet rate calculation, etc.)

```- 📁 **Auto Directory Setup** - Automatic creation of logs and exports directories

- 📊 **System Information Display** - Real-time system stats and configuration status

---

### Planned Features 🔜

## 🚀 Quick Start- 📡 **Packet Capture** - Real-time network traffic capture using pcap

- ⚡ **Real-time Traffic Analysis** - Live monitoring and analysis

```bash- �️ **DDoS Detection** - Identify distributed denial of service attacks

# Clone repository- 🎭 **IP Spoofing Detection** - Detect spoofed IP addresses

git clone https://github.com/Vyomkhurana/SnifferX.git- ⚠️ **Suspicious Activity Monitoring** - Real-time threat detection

cd SnifferX- 📊 **Traffic Visualization** - Graphical network analysis dashboard

- � **Port Scanning Detection** - Identify port scan attempts

# Install- � **Protocol Analysis** - Deep packet inspection (TCP/UDP/ICMP)

chmod +x install.sh- 📤 **Export Capabilities** - Export data in JSON, CSV, and PCAP formats

./install.sh

## 🛠️ Installation

# List interfaces

snifferx interfaces### Prerequisites

- Node.js >= 14.0.0

# Start monitoring- npm or yarn

sudo snifferx monitor -i <interface-id>

```### Setup

```bash

---# Clone the repository

git clone https://github.com/Vyomkhurana/SnifferX.git

## ✨ Features

# Navigate to project directory

- **🛡️ DDoS Detection** - Real-time packet rate analysiscd SnifferX

- **🔍 Port Scan Detection** - Identifies reconnaissance attempts

- **🎭 IP Spoofing Detection** - TTL-based forgery detection# Install dependencies

- **📊 Live Dashboard** - Real-time statistics and alertsnpm install

- **🌐 Cross-Platform** - Windows, Linux, macOS support

- **⚡ High Performance** - Handles 1000+ packets/second# Run the application

- **🎯 Professional CLI** - Metasploit-style interfacenpm start

```

---

## 💻 Usage

## 📦 Installation

### Start the application

### Automated (Recommended)```bash

npm start

```bash# or

git clone https://github.com/Vyomkhurana/SnifferX.gitnode index.js

cd SnifferX```

chmod +x install.sh

./install.sh### View help

``````bash

node index.js --help

### Manual```



**Linux/Ubuntu:**### Check version

```bash```bash

# Dependenciesnode index.js --version

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -```

sudo apt install -y nodejs tshark

## � Project Structure

# Install

git clone https://github.com/Vyomkhurana/SnifferX.git```

cd SnifferXSnifferX/

npm install├── config.js          # Configuration settings

sudo npm link├── index.js           # Main application entry point

```├── utils.js           # Utility functions

├── package.json       # Project dependencies

**macOS:**├── README.md          # Documentation

```bash├── .gitignore         # Git ignore rules

brew install node wireshark├── logs/              # Application logs (auto-created)

git clone https://github.com/Vyomkhurana/SnifferX.git└── exports/           # Exported data (auto-created)

cd SnifferX```

npm install

sudo npm link## ⚙️ Configuration

```

The application can be configured through `config.js`:

**Windows:**

```powershell- **DDoS Detection**: Packet rate thresholds, connection limits

# Install Node.js & Wireshark first- **IP Spoofing**: TTL variance checks, sequence validation

git clone https://github.com/Vyomkhurana/SnifferX.git- **Port Scanning**: Port scan thresholds per minute

cd SnifferX- **Logging**: Log levels, output directories

npm install- **Analysis**: Export formats, real-time monitoring

npm link

```## �🔧 Technologies



---- **Node.js** - Runtime environment

- **Chalk** - Terminal styling and colors

## 🎯 Usage- **Commander.js** - CLI argument parsing

- **fs-extra** - Enhanced file system operations

```bash- **pcap** (planned) - Packet capture library

# List interfaces

snifferx interfaces## 🎯 Current Development Phase



# Start monitoring✅ Phase 1: Project Initialization (Complete)

sudo snifferx monitor -i 7- Project structure setup

- Configuration system

# View config- Utility functions

snifferx config- Interactive CLI



# Help🔄 Phase 2: Core Implementation (In Progress)

snifferx --help- Packet capture module

```- Detection algorithms

- Analysis engine

---

⏳ Phase 3: Advanced Features (Upcoming)

## 📊 Live Dashboard Example- Visualization dashboard

- Export functionality

```- Alert system

═══════════════════════════════════════════════════════════

                    LIVE MONITORING DASHBOARD## 📊 Detection Capabilities (Planned)

═══════════════════════════════════════════════════════════

| Detection Type | Status | Threshold |

📊 System Status|----------------|--------|-----------|

────────────────────────────────

  Total Packets:  12,543| IP Spoofing | Planned | TTL variance check |

  Packet Rate:    134.5 pps| Port Scanning | Planned | 100 ports/min |

  Uptime:         93s| Suspicious Activity | Planned | Protocol-based |

  Status:         ● ACTIVE

## ⚠️ Important Disclaimer

🚨 Threat Detection

───────────────────────────────────────────────────────────**READ CAREFULLY BEFORE USE:**

  Total Alerts:   2

  DDoS Attacks:   1This tool is designed for **EDUCATIONAL** and **AUTHORIZED** security testing purposes only. 

  Port Scans:     1

  IP Spoofing:    0- ⚖️ Unauthorized network monitoring or packet capture may be **ILLEGAL** in your jurisdiction

- 📜 Always obtain **proper authorization** before monitoring any network

📡 Protocol Distribution- 🎓 Use only in **controlled environments** or with **explicit permission**

───────────────────────────────────────────────────────────- ⚠️ The author is **NOT RESPONSIBLE** for any misuse of this software

  TCP      ████████████████████████ 65.3%

  UDP      ████████ 21.4%**Use responsibly and ethically.**

  ICMP     ██ 8.1%

## 🤝 Contributing

🌐 Top Source IPs

───────────────────────────────────────────────────────────Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/Vyomkhurana/SnifferX/issues).

  1. 192.168.1.100    → 3,245 packets

  2. 142.250.185.46   → 1,876 packets## 📝 License

```

This project is licensed under the ISC License.

---

## 👨‍💻 Author

## 🔧 Configuration

**Vyom Khurana**

Edit `config.js` to customize thresholds:- GitHub: [@Vyomkhurana](https://github.com/Vyomkhurana)

- Project Link: [SnifferX](https://github.com/Vyomkhurana/SnifferX)

```javascript

detection: {## 🌟 Show Your Support

    ddos: {

        packetsPerSecondThreshold: 1000,Give a ⭐️ if this project helped you learn about network security!

        timeWindow: 60

    },---

    portScanning: {

        distinctPortsThreshold: 20,*Built with ❤️ for cybersecurity education*

        timeWindow: 60

    },## 📄 License

    ipSpoofing: {

        ttlVarianceThreshold: 40ISC

    }
}
```

---

## 🧪 Testing

```bash
# Attack simulation
sudo ./simulate-attacks.sh

# Manual tests
sudo hping3 --flood target-ip        # DDoS
nmap -p 1-100 target-ip               # Port scan
scapy> send(IP(src="...")/ICMP())    # IP spoofing
```

---

## 📁 Structure

```
SnifferX/
├── snifferx.js              # Main CLI
├── config.js                # Configuration
├── src/
│   ├── capture/            # Packet capture
│   ├── models/             # Data models
│   └── detection/          # Detection engines
├── docs/                   # Documentation
└── scripts/                # Helper scripts
```

---

## ⚠️ Legal Notice

**FOR EDUCATIONAL & AUTHORIZED USE ONLY**

Only use on networks you own or have permission to test. Unauthorized network monitoring may be illegal.

---

## 👤 Author

**Vyom Khurana**
- GitHub: [@Vyomkhurana](https://github.com/Vyomkhurana)

---

## 📄 License

MIT License - See [LICENSE](LICENSE)

---

**Made with ❤️ for cybersecurity**

---

## 🏁 Next Phase Roadmap

SnifferX is evolving! The next phase will focus on:

- **Advanced Analytics**: Machine learning-based anomaly detection, historical traffic analysis, and automated threat reporting (see `analytics/` folder).
- **Community Collaboration**: Clear contributing guidelines, code of conduct, and security policy for open source growth.
- **SIEM Integration**: Export alerts and traffic data to external dashboards and security platforms.
- **Performance Optimization**: Faster packet processing and lower resource usage.
- **Modular Architecture**: Easier extension for new detection algorithms and plugins.

Want to contribute? See `CONTRIBUTING.md` and open a pull request!
