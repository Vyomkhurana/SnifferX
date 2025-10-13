# DDoS Detection Testing Guide

This guide will walk you through testing SnifferX's DDoS detection capabilities.

## 📋 Prerequisites

Before testing, make sure:
- ✅ Node.js is installed
- ✅ npm dependencies are installed (`npm install`)
- ✅ Wireshark/tshark is installed
- ✅ PowerShell running as **Administrator** (required for packet capture)

## 🧪 Testing Steps

### Step 1: Open Two PowerShell Windows (Both as Administrator)

**Window 1** - For running SnifferX monitoring
**Window 2** - For running the attack simulator

---

### Step 2: Start SnifferX Monitoring (Window 1)

First, check available interfaces:

```powershell
node snifferx.js interfaces
```

You should see a list like:
```
📡 Available Network Interfaces
──────────────────────────────────────────────────────────────────────
  1  │ Ethernet
  2  │ Wi-Fi
  7  │ Wi-Fi (Microsoft Kernel Debug Network Adapter)
```

Start monitoring on your active network interface (usually 1, 2, or 7):

```powershell
node snifferx.js monitor -i 7
```

You'll see the live dashboard:
```
═══════════════════════════════════════════════════════════
                    LIVE MONITORING DASHBOARD
═══════════════════════════════════════════════════════════

📊 System Status
───────────────────────────────────────────────────────────
  Total Packets:  0
  Packet Rate:   0.00 pps
  Uptime:        3s
  Status:        ● ACTIVE

🚨 Threat Detection
───────────────────────────────────────────────────────────
  Total Alerts:   0
  DDoS Attacks:   0
  Port Scans:     0
  IP Spoofing:    0
```

**Leave this window running!**

---

### Step 3: Navigate to SnifferX Directory (Window 2)

```powershell
cd C:\Users\user\OneDrive\Desktop\SnifferX
```

---

### Step 4: Run Attack Simulation (Window 2)

Choose one of the following attack types:

#### 🌊 HTTP Flood Attack (Recommended for Testing)
```powershell
node scripts\simulate-ddos-windows.js http
```

#### 🌊 SYN Flood Attack
```powershell
node scripts\simulate-ddos-windows.js syn
```

#### 🌊 UDP Flood Attack
```powershell
node scripts\simulate-ddos-windows.js udp
```

#### 🐌 Slowloris Attack
```powershell
node scripts\simulate-ddos-windows.js slowloris
```

#### 🏓 Ping Flood
```powershell
node scripts\simulate-ddos-windows.js ping
```

---

### Step 5: Watch the Detection (Window 1)

Within a few seconds, you should see alerts in the SnifferX dashboard:

```
═══════════════════════════════════════════════════════════
                    LIVE MONITORING DASHBOARD
═══════════════════════════════════════════════════════════

📊 System Status
───────────────────────────────────────────────────────────
  Total Packets:  1,234
  Packet Rate:   150.50 pps
  Uptime:        12s
  Status:        ● ACTIVE

🚨 Threat Detection
───────────────────────────────────────────────────────────
  Total Alerts:   3
  DDoS Attacks:   3  ⚠️
  Port Scans:     0
  IP Spoofing:    0

🔥 RECENT ALERTS
───────────────────────────────────────────────────────────
  [12:34:56] 🚨 DDoS - CRITICAL from 192.168.1.100
             Traffic spike detected: 500 packets/sec
  
  [12:34:45] 🚨 DDoS - HIGH from 192.168.1.100
             High traffic rate detected: 200 packets/sec
```

---

## 🎯 What to Look For

### ✅ Successful Detection Indicators:

1. **Packet count increases rapidly** - Should go from 0 to hundreds/thousands quickly
2. **DDoS Alerts appear** - You'll see red alerts in the "RECENT ALERTS" section
3. **Alert severity increases** - Starts with LOW, then MEDIUM, HIGH, CRITICAL
4. **Top talker appears** - The attacking IP shows in "Top Talkers" section

### 🔴 DDoS Alert Severity Levels:

- **🟡 LOW** - Traffic slightly above normal (100+ pps)
- **🟠 MEDIUM** - Moderate traffic spike (300+ pps)
- **🔴 HIGH** - Significant traffic spike (500+ pps)
- **💀 CRITICAL** - Massive traffic spike (1000+ pps)

---

## 📊 Expected Results

### HTTP Flood Attack:
- **Packets captured**: 500-2000+ packets
- **Detection time**: 2-5 seconds
- **Alert severity**: HIGH to CRITICAL
- **Pattern**: Rapid HTTP requests from single IP

### SYN Flood Attack:
- **Packets captured**: 300-1000+ packets
- **Detection time**: 3-7 seconds
- **Alert severity**: MEDIUM to HIGH
- **Pattern**: Many TCP SYN packets

### UDP Flood Attack:
- **Packets captured**: 1000-3000+ packets
- **Detection time**: 1-3 seconds
- **Alert severity**: CRITICAL
- **Pattern**: Massive UDP traffic

---

## 🔍 Verification

After the attack simulation completes (30 seconds), check:

1. **Final Report** in SnifferX (Window 1):
   ```
   ═══════════════════════════════════════════════════════════
                         FINAL REPORT
   ═══════════════════════════════════════════════════════════

   Session Summary:
     Duration:        45s
     Total Packets:   2,340
     Average Rate:    52 pps

   Threat Summary:
     Total Alerts:    5
     DDoS Attacks:    5  ✓ DETECTED
     Port Scans:      0
     IP Spoofing:     0
   ```

2. **Log Files** (stored in `logs/` directory):
   ```powershell
   Get-Content logs\snifferx-*.log | Select-String "DDoS"
   ```

3. **Export Data** (if enabled in config):
   ```powershell
   Get-ChildItem exports\
   ```

---

## 🛠️ Troubleshooting

### Problem: No packets captured
**Solution**: 
- Run PowerShell as Administrator
- Check if interface ID is correct (`node snifferx.js interfaces`)
- Verify tshark is installed (`C:\Program Files\Wireshark\tshark.exe`)

### Problem: No alerts generated
**Solution**:
- Attack simulation might not be generating enough traffic
- Check DDoS detector threshold in `config.js`
- Lower the threshold for testing:
  ```javascript
  ddos: {
      enabled: true,
      packetsPerSecond: 50,  // Change from 100 to 50
      timeWindow: 5,
      connectionThreshold: 50
  }
  ```

### Problem: Too many false positives
**Solution**:
- Increase thresholds in `config.js`
- Normal browsing shouldn't trigger alerts with default config

---

## 📝 Testing Checklist

- [ ] PowerShell running as Administrator
- [ ] SnifferX started with correct interface
- [ ] Dashboard showing live updates
- [ ] Attack simulator running
- [ ] DDoS alerts appearing
- [ ] Alert severity increasing
- [ ] Final report showing detections
- [ ] Logs saved to `logs/` directory

---

## ⚠️ Important Notes

1. **Legal Disclaimer**: Only test on your own network or with explicit permission
2. **Target Safety**: Default target (google.com) won't be affected by our small-scale test
3. **Network Impact**: May temporarily slow your internet connection
4. **Duration**: Attacks run for 30 seconds then automatically stop
5. **Cleanup**: All connections are properly closed after testing

---

## 🎓 Understanding the Detection

SnifferX detects DDoS attacks by monitoring:

1. **Packet Rate**: Sudden spike in packets per second
2. **Source IP**: Single IP sending excessive traffic
3. **Pattern**: Sustained high-volume traffic
4. **Time Window**: Analyzes traffic over 5-second windows

The detector uses these thresholds (from `config.js`):
```javascript
{
    packetsPerSecond: 100,    // Trigger if >100 pps from one IP
    timeWindow: 5,            // Monitor 5-second windows
    connectionThreshold: 100  // Trigger if >100 connections
}
```

---

## 🚀 Next Steps

After successful DDoS detection testing:

1. **Test Port Scanning**: Use `simulate-attacks.sh portscan`
2. **Test IP Spoofing**: Use `simulate-attacks.sh ipspoofing`
3. **Adjust Thresholds**: Tune detection sensitivity in `config.js`
4. **Review Logs**: Analyze captured data in `logs/` directory
5. **Export Data**: Enable exports for deeper analysis

---

## 📞 Need Help?

If detection isn't working:

1. Check SnifferX is running as Administrator
2. Verify correct network interface selected
3. Review logs: `Get-Content logs\snifferx-*.log`
4. Check config: `node snifferx.js config`
5. Create GitHub issue: https://github.com/Vyomkhurana/SnifferX/issues

---

**Happy Testing! 🎉**

Remember: SnifferX is a learning tool. Use responsibly and ethically.
