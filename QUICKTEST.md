# 🚀 QUICK TEST - DDoS Detection

## One-Line Testing Commands

### Step 1: Start SnifferX (PowerShell as Admin)
```powershell
node snifferx.js monitor -i 7
```

### Step 2: Open New PowerShell and Run Attack
```powershell
cd C:\Users\user\OneDrive\Desktop\SnifferX
node scripts\simulate-ddos-windows.js http
```

## That's it! 🎉

Watch Window 1 for alerts within 5 seconds.

---

## All Attack Types

```powershell
# HTTP Flood (best for testing)
node scripts\simulate-ddos-windows.js http

# SYN Flood
node scripts\simulate-ddos-windows.js syn

# UDP Flood
node scripts\simulate-ddos-windows.js udp

# Slowloris
node scripts\simulate-ddos-windows.js slowloris

# Ping Flood
node scripts\simulate-ddos-windows.js ping
```

---

## Expected Output

**Window 1 (SnifferX):**
```
🚨 Threat Detection
───────────────────────────────────────────────────────────
  Total Alerts:   3
  DDoS Attacks:   3  ⚠️

🔥 RECENT ALERTS
───────────────────────────────────────────────────────────
  [12:34:56] 🚨 DDoS - CRITICAL from 192.168.1.100
             Traffic spike detected: 500 packets/sec
```

**Window 2 (Simulator):**
```
✓ Attack Simulation Complete!
═══════════════════════════════════════════════════════════
  Total Requests: 2340
  Duration: 30 seconds
  Average Rate: 78 requests/sec
═══════════════════════════════════════════════════════════

💡 Now check your SnifferX dashboard for alerts!
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| No packets | Run as Administrator |
| No alerts | Lower threshold in config.js |
| Error on start | Check interface: `node snifferx.js interfaces` |

---

## Full Documentation

See `docs/TESTING_GUIDE.md` for complete instructions.
