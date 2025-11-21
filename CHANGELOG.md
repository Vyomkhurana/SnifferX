# Changelog

All notable changes to SnifferX will be documented in this file.

## [1.2.0] - 2025-11-21

### Added
- **Animated Loading Spinners**: Beautiful rotating spinner animations for async operations (scanning interfaces, initializing engines)
- **Progressive Engine Loading**: Sequenced loading display with checkmarks as each detection engine initializes
- **Enhanced Success/Error Messages**: Color-coded feedback with icons (✓, ✗, ℹ, ⚠) for better visual clarity
- **Countdown Timer**: Auto-start countdown with real-time display when using `auto` command
- **Improved Interface Listing**: Network interfaces now display with icons (🌐 for Ethernet/WiFi, 🔌 for others)
- **Better Final Report**: Enhanced session summary with visual indicators, threat status badges, and organized layout

### Improved
- **Visual Hierarchy**: Better use of colors, icons, and spacing throughout the CLI
- **Error Handling**: More helpful error messages with troubleshooting steps
- **Status Indicators**: Replaced plain text with visual symbols (●, ○, ◐) for better status recognition
- **Command Feedback**: All operations now provide clear visual confirmation
- **Dashboard Layout**: Cleaner organization with better use of box-drawing characters
- **Capture Initialization**: Now shows session ID and more details when starting

### Technical
- Added `showSpinner()` utility for async operation feedback
- Added `showSuccess()`, `showError()`, `showInfo()`, `showWarning()` helper functions
- Enhanced color scheme with better contrast and readability
- Improved user experience with progressive disclosure of information

## [1.1.0] - 2025-11-15

### Added
- **Interactive CLI Mode**: Running `node snifferx` now launches an interactive prompt
  - Continuous input mode - no need to restart for each command
  - Command history support (up to 50 commands)
  - Available commands: start, auto, interfaces, config, exports, test-audio, help, stats, clear, exit
  - Type `exit` or press Ctrl+C to quit

- **Enhanced Statistics**:
  - New `stats` command showing quick system information
  - Human-readable uptime formatting (e.g., "2h 15m 30s")
  - Peak packets per second tracking
  - Average packet size calculation
  - Alert rate percentage in exports

- **Improved Session Management**:
  - Unique session ID generation for each monitoring session
  - Enhanced export metadata with platform info, Node version, and SnifferX version
  - Better session tracking with interface names
  - Data integrity verification in exports

- **Smart Command Suggestions**:
  - Autocomplete suggestions for mistyped commands
  - Helpful error messages with command hints
  - Keyboard shortcuts information displayed in welcome screen

- **Performance Monitoring**:
  - Real-time peak performance tracking
  - Average packet size analytics
  - Enhanced dashboard with formatted uptime display

### Improved
- Better error handling in interactive mode
- More detailed export files with comprehensive metadata
- Cleaner command output formatting
- Enhanced user experience with helpful tips

### Technical
- Added `formatUptime()` utility function for time formatting
- Extended stats object with sessionId, interfaceName, peakPacketsPerSecond, averagePacketSize
- Improved command parsing in interactive mode
- Better memory and resource tracking

## [1.0.0] - 2025-10-16

### Added
- 👤 **User Behavior Analytics (UBA)** - Advanced behavioral anomaly detection
  - Learns normal user/device patterns over time
  - Detects data exfiltration attempts (>10MB in 5 minutes)
  - Identifies unusual time access patterns
  - Monitors abnormal data volumes (3x normal threshold)
  - Tracks access to new/suspicious destinations
  - Detects lateral movement across internal networks
  - Flags unusual protocol usage
  - Risk scoring system (0-100) for threat prioritization
  - 1-hour learning period for baseline establishment
- 📊 **Enhanced Dashboard** - Now shows User Anomalies counter
- 📚 **UBA Documentation** - Complete guide with testing instructions
- 🎯 **Real-time Risk Assessment** - Dynamic risk scoring per IP/device

### Changed
- Updated detection engine initialization to include UBA
- Improved alert handling with behavioral anomaly notifications
- Enhanced statistics tracking with user behavior metrics

### Technical Details
- Profile tracking: Active hours, data patterns, destinations, protocols
- Memory-efficient design with 5-minute activity windows
- Configurable thresholds in config.js
- Integration with existing detection pipeline

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
