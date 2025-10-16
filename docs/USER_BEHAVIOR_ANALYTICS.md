# 👤 User Behavior Analytics (UBA) Documentation

## Overview

SnifferX's User Behavior Analytics module tracks and profiles network behavior for each IP address/device, learning normal patterns and detecting anomalies that may indicate security threats.

---

## 🎯 What It Detects

### 1. **Unusual Time Access**
- Detects access during abnormal hours
- Example: Server accessed at 3 AM when normally only used 9-5

### 2. **Data Exfiltration**
- Monitors sudden large data transfers (>10MB in 5 minutes)
- Example: Employee downloading 50MB of files unexpectedly

### 3. **Abnormal Data Volume**
- Compares current traffic to learned baseline
- Alerts if data transfer exceeds 3x normal amount

### 4. **Access to Unusual Destinations**
- Tracks new/unknown IP destinations
- Example: Workstation connecting to foreign IPs

### 5. **Lateral Movement**
- Detects scanning/access to multiple internal IPs
- Common in advanced persistent threats (APTs)

### 6. **Unusual Protocol Usage**
- Flags protocols not normally used by this IP
- Example: HTTP server suddenly using FTP

### 7. **Abnormal Connection Rate**
- Detects connection spikes (2.5x normal rate)
- May indicate compromise or malware

---

## 🔄 How It Works

### Phase 1: Learning Mode (1 hour default)

```
Time: 0 ────────────────────────────────────── 60 minutes
      │                                          │
      Learning normal behavior...                Learning complete!
      
Collects data on:
- Active hours (when user is typically online)
- Average data transfer rates
- Normal destinations (IPs contacted)
- Common protocols used
- Typical connection patterns
```

### Phase 2: Detection Mode

After learning, UBA monitors in real-time and alerts on deviations:

```
Normal Behavior Profile:
├── Active Hours: 9:00-17:00
├── Avg Data: 5 MB/min
├── Destinations: 10 IPs
└── Protocols: HTTP, HTTPS

Current Activity:
├── Time: 02:00 ⚠️ UNUSUAL
├── Data: 20 MB/min ⚠️ 4x NORMAL
├── New Destination: suspicious-ip.com ⚠️
└── Risk Score: 85/100 🚨 CRITICAL
```

---

## 📊 Risk Scoring

UBA calculates a risk score (0-100) based on anomalies:

| Anomaly | Risk Points |
|---------|-------------|
| Data exfiltration | +40 |
| Lateral movement | +35 |
| Abnormal data volume | +25 |
| Unusual time access | +20 |
| Abnormal connections | +20 |
| New destinations | +15 |
| Unusual protocol | +10 |

**Alert Thresholds:**
- 70-89: HIGH risk
- 90-100: CRITICAL risk

---

## ⚙️ Configuration

Located in `config.js`:

```javascript
userBehavior: {
    enabled: true,
    learningPeriod: 3600000,            // 1 hour (in ms)
    dataThresholdMultiplier: 3,         // Alert if data > 3x normal
    connectionThresholdMultiplier: 2.5, // Alert if connections > 2.5x normal
    minPacketsForProfile: 100,          // Minimum packets to create profile
    riskScoreThreshold: 70,             // Alert if risk score > 70
    exfiltrationThreshold: 10485760     // 10MB in 5 min = exfiltration
}
```

---

## 🧪 Testing UBA

### Step 1: Start Learning
```bash
node snifferx.js monitor -i 7
```

**You'll see:**
```
✓ User Behavior Analytics loaded
📚 Learning mode active for 60 minutes
```

### Step 2: Generate Normal Traffic
Browse normally for 1 hour to establish baseline.

### Step 3: Learning Complete
```
✅ Learning complete - UBA detection active
📊 Profile created for 192.168.1.100: 1250 packets, 5 destinations
```

### Step 4: Trigger Anomaly
Run one of these to trigger alerts:

**Unusual Time (if outside learned hours):**
```bash
# Just use the system at an unusual time
```

**Data Exfiltration Simulation:**
```bash
# Download large files rapidly
curl -O http://example.com/largefile.zip
curl -O http://example.com/largefile2.zip
curl -O http://example.com/largefile3.zip
```

**Lateral Movement Simulation:**
```bash
# Scan internal network
nmap 192.168.1.0/24
```

---

## 📈 Expected Results

### Normal Operation:
```
📊 System Status
───────────────────────────────────────────────────────────
  Total Packets:  5,230
  Packet Rate:   87 pps
  User Anomalies: 0 ✓
```

### Anomaly Detected:
```
👤 BEHAVIORAL ANOMALY!
──────────────────────────────────────────────────────────
⚠️  HIGH: Behavioral anomaly from 192.168.1.100
   Risk Score: 75/100
   Anomalies: Data exfiltration, Access to 3 new destinations
Time: 2025-10-16 02:34:15
──────────────────────────────────────────────────────────
```

---

## 🎯 Real-World Use Cases

### 1. **Insider Threat Detection**
```
Employee downloads company database at midnight
→ UBA detects: Unusual time + Large data transfer
→ Alert: "Potential data exfiltration" (Risk: 95)
```

### 2. **Compromised Account**
```
Attacker uses stolen credentials from foreign country
→ UBA detects: New destination IPs + Unusual time + Lateral movement
→ Alert: "Behavioral anomaly" (Risk: 85)
```

### 3. **Malware Activity**
```
Infected device starts scanning network
→ UBA detects: Abnormal connections + Lateral movement
→ Alert: "Potential lateral movement" (Risk: 80)
```

---

## 🔍 Profile Information

View detailed user profiles:

```javascript
// In code:
const profile = detectors.userBehavior.getUserProfile('192.168.1.100');
console.log(profile);

/* Output:
{
    ip: '192.168.1.100',
    firstSeen: '2025-10-16 10:00:00',
    lastSeen: '2025-10-16 14:30:15',
    totalPackets: 5230,
    bytesTransferred: '45.2 MB',
    destinations: 12,
    protocols: 'HTTP, HTTPS, DNS',
    riskScore: 15,
    anomalyCount: 0,
    hasBaseline: true
}
*/
```

---

## 🛡️ Best Practices

1. **Learning Period:** Run for at least 1 hour during normal business hours
2. **Adjust Thresholds:** Tune multipliers based on your environment
3. **Baseline Reset:** Restart learning after major network changes
4. **Monitor Regularly:** Check UBA alerts daily for anomalies
5. **Combine with Other Detectors:** UBA works best alongside DDoS, Port Scan detection

---

## 📚 Technical Details

### Profile Structure:
- **firstSeen/lastSeen:** Timestamp tracking
- **totalPackets:** Cumulative packet count
- **bytesTransferred:** Total data volume
- **destinations:** Set of contacted IPs
- **activeHours:** Distribution of activity by hour
- **protocols:** Protocol usage histogram
- **portsAccessed:** Set of destination ports
- **dataPerDestination:** Bytes sent to each IP
- **recentActivity:** Last 5 minutes of activity
- **baseline:** Learned normal behavior
- **riskScore:** Current risk level (0-100)

### Memory Efficient:
- Profiles auto-clean old data
- Only stores recent 5-minute activity
- Uses Sets/Maps for efficient lookups

---

## 🚀 Future Enhancements

- Machine learning clustering for better baselines
- Peer group analysis (compare users in similar roles)
- Time-series anomaly detection
- Integration with SIEM platforms
- Automated response actions

---

## ❓ FAQ

**Q: How long should learning mode be?**  
A: Minimum 1 hour, but 24 hours captures daily patterns better.

**Q: What if I get false positives?**  
A: Increase `dataThresholdMultiplier` and `riskScoreThreshold` in config.

**Q: Can I reset learning?**  
A: Yes, call `detectors.userBehavior.resetLearning()` or restart SnifferX.

**Q: Does it work with DHCP (changing IPs)?**  
A: Currently profiles by IP. Consider using MAC addresses or user IDs in future versions.

---

**SnifferX v1.1.0 - User Behavior Analytics** 🎉
