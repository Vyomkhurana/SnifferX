# Changelog

All notable changes to SnifferX will be documented in this file.

## [1.0.0] - 2025-10-12

### Added
- 🎉 **Initial Release** - Professional network threat detection tool
- 🛡️ **DDoS Detection** - Real-time packet rate analysis with configurable thresholds
- 🔍 **Port Scan Detection** - Identifies reconnaissance attempts across TCP/UDP
- 🎭 **IP Spoofing Detection** - TTL-based forgery detection with smart filtering
- 📊 **Live Dashboard** - Real-time monitoring with statistics and protocol distribution
- 🌐 **Cross-Platform Support** - Works on Windows, Linux, and macOS
- ⚡ **High Performance** - Handles 1000+ packets per second
- 🎯 **Professional CLI** - Metasploit-style command-line interface
- 📡 **Multi-Protocol Support** - Analyzes TCP, UDP, ICMP, ARP, and more
- 🔧 **Configurable Thresholds** - Customizable detection parameters
- 📝 **Comprehensive Logging** - Color-coded logs with timestamps
- 🧪 **Attack Simulation** - Testing tools for DDoS, port scans, and IP spoofing
- 📚 **Complete Documentation** - Installation guides, API docs, and tutorials

### Features
- Automatic platform detection (Windows/Linux/macOS)
- Real-time threat alerts with severity levels
- Protocol distribution analysis
- Top talkers identification
- Session statistics and reporting
- Global CLI installation
- Automated setup scripts

### Detection Algorithms
- **DDoS Detection**: Sliding window analysis with configurable PPS threshold (default: 1000)
- **Port Scanning**: Distinct port tracking with 20-port threshold in 60s window
- **IP Spoofing**: Statistical TTL baseline with 40-hop variance threshold

### Documentation
- README.md - Project overview and quick start
- LINUX_SETUP.md - Linux-specific installation guide
- DETECTION_EXPLAINED.md - Deep dive into false positive handling
- FALSE_POSITIVE_ANALYSIS.md - Before/after detection accuracy analysis
- PHASE3_SUMMARY.md - Development summary and technical details

### Scripts
- `install.sh` - Automated installation script
- `scripts/setup-linux.sh` - Linux environment setup
- `scripts/simulate-attacks.sh` - Attack simulation for testing

### Dependencies
- Node.js >= 14.0.0
- tshark (Wireshark CLI) for packet capture
- chalk@4.1.2 for terminal styling
- commander@14.0.1 for CLI framework
- fs-extra@11.3.2 for file operations

### Known Limitations
- Requires root/sudo privileges for packet capture
- Platform-specific tshark installation required
- Real-time performance depends on network load

---

## Roadmap

### [1.1.0] - Planned
- [ ] Web-based dashboard with graphs
- [ ] Export to JSON/CSV/PCAP
- [ ] Email/Webhook alert notifications
- [ ] Custom filter rules
- [ ] Whitelist/blacklist management

### [1.2.0] - Planned
- [ ] Machine learning-based anomaly detection
- [ ] Historical data analysis
- [ ] Threat intelligence integration
- [ ] Advanced protocol analysis
- [ ] Connection tracking and session reconstruction

### [2.0.0] - Future
- [ ] Distributed deployment support
- [ ] Database storage (PostgreSQL/MongoDB)
- [ ] REST API for integration
- [ ] Multi-user support with authentication
- [ ] Enterprise features (SIEM integration, compliance reporting)

---

## Version History

### v1.0.0 (2025-10-12)
- Initial public release
- Core detection engines implemented
- Professional CLI interface
- Cross-platform support
- Complete documentation

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - See [LICENSE](LICENSE) for details.
