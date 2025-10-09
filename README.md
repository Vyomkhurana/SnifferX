# SnifferX 🔍

A powerful network traffic analyzer for cybersecurity analysis and threat detection.

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-%3E%3D14.0.0-brightgreen.svg)
![Status](https://img.shields.io/badge/status-in%20development-yellow.svg)
![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)

## 🚀 About

SnifferX is a network traffic analysis tool designed to capture, analyze, and detect malicious network activities in real-time. Built with Node.js for efficient packet processing and real-time analysis. This project showcases advanced cybersecurity concepts and network monitoring techniques.

## ✨ Features

### Current Features ✓
- 🎨 **Interactive CLI** - Beautiful command-line interface with ASCII banner
- ⚙️ **Configuration System** - Comprehensive settings for detection thresholds
- 📝 **Advanced Logging** - Color-coded logging with timestamps
- 🛠️ **Utility Functions** - Network analysis helpers (IP validation, packet rate calculation, etc.)
- 📁 **Auto Directory Setup** - Automatic creation of logs and exports directories
- 📊 **System Information Display** - Real-time system stats and configuration status

### Planned Features 🔜
- 📡 **Packet Capture** - Real-time network traffic capture using pcap
- ⚡ **Real-time Traffic Analysis** - Live monitoring and analysis
- �️ **DDoS Detection** - Identify distributed denial of service attacks
- 🎭 **IP Spoofing Detection** - Detect spoofed IP addresses
- ⚠️ **Suspicious Activity Monitoring** - Real-time threat detection
- 📊 **Traffic Visualization** - Graphical network analysis dashboard
- � **Port Scanning Detection** - Identify port scan attempts
- � **Protocol Analysis** - Deep packet inspection (TCP/UDP/ICMP)
- 📤 **Export Capabilities** - Export data in JSON, CSV, and PCAP formats

## 🛠️ Installation

### Prerequisites
- Node.js >= 14.0.0
- npm or yarn

### Setup
```bash
# Clone the repository
git clone https://github.com/Vyomkhurana/SnifferX.git

# Navigate to project directory
cd SnifferX

# Install dependencies
npm install

# Run the application
npm start
```

## 💻 Usage

### Start the application
```bash
npm start
# or
node index.js
```

### View help
```bash
node index.js --help
```

### Check version
```bash
node index.js --version
```

## � Project Structure

```
SnifferX/
├── config.js          # Configuration settings
├── index.js           # Main application entry point
├── utils.js           # Utility functions
├── package.json       # Project dependencies
├── README.md          # Documentation
├── .gitignore         # Git ignore rules
├── logs/              # Application logs (auto-created)
└── exports/           # Exported data (auto-created)
```

## ⚙️ Configuration

The application can be configured through `config.js`:

- **DDoS Detection**: Packet rate thresholds, connection limits
- **IP Spoofing**: TTL variance checks, sequence validation
- **Port Scanning**: Port scan thresholds per minute
- **Logging**: Log levels, output directories
- **Analysis**: Export formats, real-time monitoring

## �🔧 Technologies

- **Node.js** - Runtime environment
- **Chalk** - Terminal styling and colors
- **Commander.js** - CLI argument parsing
- **fs-extra** - Enhanced file system operations
- **pcap** (planned) - Packet capture library

## 🎯 Current Development Phase

✅ Phase 1: Project Initialization (Complete)
- Project structure setup
- Configuration system
- Utility functions
- Interactive CLI

🔄 Phase 2: Core Implementation (In Progress)
- Packet capture module
- Detection algorithms
- Analysis engine

⏳ Phase 3: Advanced Features (Upcoming)
- Visualization dashboard
- Export functionality
- Alert system

## 📊 Detection Capabilities (Planned)

| Detection Type | Status | Threshold |
|----------------|--------|-----------|
| DDoS Attack | Planned | 1000 pps |
| IP Spoofing | Planned | TTL variance check |
| Port Scanning | Planned | 100 ports/min |
| Suspicious Activity | Planned | Protocol-based |

## ⚠️ Important Disclaimer

**READ CAREFULLY BEFORE USE:**

This tool is designed for **EDUCATIONAL** and **AUTHORIZED** security testing purposes only. 

- ⚖️ Unauthorized network monitoring or packet capture may be **ILLEGAL** in your jurisdiction
- 📜 Always obtain **proper authorization** before monitoring any network
- 🎓 Use only in **controlled environments** or with **explicit permission**
- ⚠️ The author is **NOT RESPONSIBLE** for any misuse of this software

**Use responsibly and ethically.**

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/Vyomkhurana/SnifferX/issues).

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Vyom Khurana**
- GitHub: [@Vyomkhurana](https://github.com/Vyomkhurana)
- Project Link: [SnifferX](https://github.com/Vyomkhurana/SnifferX)

## 🌟 Show Your Support

Give a ⭐️ if this project helped you learn about network security!

---

*Built with ❤️ for cybersecurity education*

## 📄 License

ISC
