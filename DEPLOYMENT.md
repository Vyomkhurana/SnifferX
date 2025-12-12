# SnifferX Deployment Guide

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v14.0.0 or higher
- **npm**: v6.0.0 or higher
- **Root/Admin privileges**: Required for packet capture
- **Operating System**: Linux, macOS, or Windows

### Installation

#### Option 1: Install from npm (when published)
```bash
npm install -g snifferx
```

#### Option 2: Install from source
```bash
# Clone the repository
git clone https://github.com/Vyomkhurana/SnifferX.git
cd SnifferX

# Install dependencies
npm install

# Make executable (Linux/macOS)
chmod +x snifferx.js

# Link globally (optional)
npm link
```

## 📦 Deployment Options

### 1. Local Deployment
```bash
# Run directly
node snifferx.js --help

# Or if installed globally
snifferx --help
```

### 2. Server Deployment
```bash
# Install as system service (Linux)
sudo cp snifferx.service /etc/systemd/system/
sudo systemctl enable snifferx
sudo systemctl start snifferx

# Check status
sudo systemctl status snifferx
```

### 3. Docker Deployment (Coming Soon)
```bash
# Build image
docker build -t snifferx:latest .

# Run container
docker run --net=host --privileged -it snifferx:latest
```

## ⚙️ Configuration

### Environment Variables
Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
nano .env
```

Key configurations:
- `SNIFFERX_API_KEY`: Backend API key (optional)
- `SNIFFERX_BACKEND_ENABLED`: Enable backend integration
- `SNIFFERX_AUDIO_ENABLED`: Enable audio alerts
- `SNIFFERX_LOG_LEVEL`: Logging level (info, debug, warn, error)

### Configuration File
Edit `config.js` for advanced settings:
- Detection thresholds
- Network settings
- Alert preferences
- Analysis options

## 🔒 Permissions

### Linux/macOS
```bash
# Run with sudo
sudo snifferx monitor

# Or grant capabilities (Linux only)
sudo setcap cap_net_raw,cap_net_admin=eip $(which node)
```

### Windows
- Run PowerShell/CMD as Administrator
- Install WinPcap or Npcap

## 🧪 Testing Deployment

```bash
# Check system requirements
snifferx doctor

# List network interfaces
snifferx interfaces

# Test audio system
snifferx test-audio

# Test backend connectivity
snifferx test-backend

# Run monitoring (requires root/admin)
sudo snifferx monitor --interface eth0
```

## 📊 Monitoring & Logs

### Log Files
Located in `logs/` directory:
- `snifferx.log`: Main application log
- `threats.log`: Detected threats
- `errors.log`: Error logs

### Viewing Logs
```bash
# Tail logs
tail -f logs/snifferx.log

# View threat history
snifferx exports
```

## 🔧 Troubleshooting

### Common Issues

**1. Permission Denied**
```bash
# Solution: Run with sudo/admin privileges
sudo snifferx monitor
```

**2. Missing Dependencies**
```bash
# Solution: Reinstall dependencies
npm install
```

**3. No Network Interface Found**
```bash
# Solution: Check available interfaces
snifferx interfaces
# Then specify interface explicitly
sudo snifferx monitor --interface <name>
```

**4. Audio Not Working**
```bash
# Solution: Test audio system
snifferx test-audio
# Or disable audio in config.js
```

## 🔄 Updates

```bash
# Update from npm (when published)
npm update -g snifferx

# Update from source
git pull origin main
npm install
```

## 📈 Performance Tuning

### For High Traffic Networks
Edit `config.js`:
```javascript
detection: {
    ddos: {
        packetsPerSecondThreshold: 1000,  // Increase threshold
        timeWindow: 10                     // Longer time window
    }
}
```

### For Low Resource Systems
```javascript
network: {
    maxPackets: 5000,           // Reduce max packets
    bufferSize: 5 * 1024 * 1024 // Reduce buffer
}
```

## 🌐 Production Deployment Checklist

- [ ] Node.js v14+ installed
- [ ] All dependencies installed (`npm install`)
- [ ] Configuration reviewed and customized
- [ ] Environment variables set (if using backend)
- [ ] Permissions configured (root/admin or capabilities)
- [ ] Log directory created and writable
- [ ] Network interfaces identified
- [ ] Audio system tested (if enabled)
- [ ] Backend connectivity tested (if enabled)
- [ ] Monitoring started successfully
- [ ] Logs rotating properly

## 🛡️ Security Considerations

1. **Root Access**: Required for packet capture - use with caution
2. **API Keys**: Store securely in `.env`, never commit to git
3. **Log Files**: May contain sensitive network data - protect accordingly
4. **Backend Integration**: Use HTTPS endpoints only
5. **Rate Limiting**: Configure appropriate thresholds for your network

## 📞 Support

- **Issues**: https://github.com/Vyomkhurana/SnifferX/issues
- **Documentation**: Check the `docs/` directory
- **Discussions**: GitHub Discussions

## 📄 License

ISC License - see LICENSE file for details

---

**Note**: SnifferX requires administrative privileges to capture network packets. Always use responsibly and in accordance with local laws and regulations.
