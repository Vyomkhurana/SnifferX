# SnifferX Development Workflow

## 🎯 **How We'll Build This Project**

This document outlines the practical, step-by-step flow of building SnifferX.

---

## **Phase 2: Packet Capture (The Foundation)**
**Goal:** Capture and parse network packets

### **Session 1: Basic Capture**
**What we'll do:**
- Install `cap` library (Windows-friendly packet capture)
- Create `src/capture/captureManager.js`
- Write code to initialize network interface
- Capture our FIRST packet (exciting!)
- Print raw packet data to console

**Commands:**
```bash
npm install cap simple-statistics lowdb lodash moment
mkdir src
mkdir src/capture src/detection src/analysis src/storage src/alerts src/models
```

**Deliverable:** Can see raw packet data in terminal

---

### **Session 2: Parse Packets**
**What we'll do:**
- Create `src/capture/packetParser.js`
- Parse Ethernet frame (source/dest MAC addresses)
- Extract IP header (source/dest IP addresses)
- Identify protocol type (TCP/UDP/ICMP)
- Display in readable format

**Deliverable:** Can see human-readable packet info (Source IP → Dest IP, Protocol)

---

### **Session 3: Clean It Up**
**What we'll do:**
- Store packets in memory (array/buffer)
- Add packet counter
- Show real-time stats (packets/sec)
- Handle start/stop capture gracefully

**Deliverable:** Professional packet capture working smoothly

---

## **Phase 3: Detection Algorithms (The Cool Stuff)**

### **Session 4: DDoS Detection**
**What we'll do:**
1. Create `src/detection/ddosDetector.js`
2. Track packets per source IP
3. Implement sliding window (count packets in last 60 seconds)
4. Alert when threshold exceeded (> 1000 packets/sec from one IP)
5. Display alert with source IP and packet count

**Algorithm:**
```javascript
// Pseudocode
if (packetsFromIP in last 60sec > threshold) {
    alert("Possible DDoS from " + sourceIP);
}
```

**Deliverable:** DDoS detection working and alerting

---

### **Session 5: Port Scan Detection**
**What we'll do:**
1. Create `src/detection/portScanDetector.js`
2. Track connection attempts per IP
3. Detect multiple ports accessed quickly
4. Alert on > 20 different ports in 60 seconds
5. Identify SYN scan patterns

**Algorithm:**
```javascript
// Pseudocode
if (uniquePortsAttempted by IP > 20 in 60sec) {
    alert("Port scan detected from " + sourceIP);
}
```

**Deliverable:** Port scan detection working

---

### **Session 6: IP Spoofing Detection**
**What we'll do:**
1. Create `src/detection/ipSpoofingDetector.js`
2. Track TTL (Time To Live) values per source IP
3. Detect TTL anomalies (same IP, different TTL)
4. Check for impossible packet combinations
5. Alert on suspicious patterns

**Deliverable:** IP spoofing detection working

---

## **Phase 4: Analysis Engine (Making Sense of Data)**

### **Session 7: Traffic Statistics**
**What we'll do:**
1. Create `src/analysis/trafficAnalyzer.js`
2. Calculate total packets captured
3. Identify top talkers (most active IPs)
4. Protocol breakdown (% TCP, UDP, ICMP)
5. Bandwidth estimation

**Deliverable:** Dashboard-like statistics in terminal

---

### **Session 8: Connection Tracking**
**What we'll do:**
1. Create `src/models/Connection.js`
2. Track TCP connections (3-way handshake)
3. Monitor active connections
4. Calculate connection duration
5. Track data transferred per connection

**Deliverable:** Can see active network connections

---

### **Session 9: Protocol Analysis**
**What we'll do:**
1. Create `src/analysis/protocolAnalyzer.js`
2. Identify HTTP traffic
3. Detect DNS queries
4. Spot SSH connections
5. Find FTP transfers

**Deliverable:** Deep protocol-level insights

---

## **Phase 5: Alerts & Logging (Professional Features)**

### **Session 10: Alert System**
**What we'll do:**
1. Create `src/alerts/alertManager.js`
2. Implement alert priority levels (low, medium, high, critical)
3. Add color-coded alerts
4. Implement alert deduplication
5. Optional: Sound alerts

**Deliverable:** Professional alert system

---

### **Session 11: Enhanced Logging**
**What we'll do:**
1. Save all captured packets to JSON files
2. Export suspicious traffic separately
3. Generate daily reports
4. Create incident logs with timestamps

**Deliverable:** Complete logging infrastructure

---

## **Phase 6: Export & Storage (Data Management)**

### **Session 12: Export Functionality**
**What we'll do:**
1. Create `src/storage/exportManager.js`
2. Implement JSON export
3. Implement CSV export (for Excel)
4. Implement PCAP export (for Wireshark)
5. Create text summary reports

**Deliverable:** Can export data in multiple formats

---

### **Session 13: Simple Database**
**What we'll do:**
1. Create `src/storage/databaseManager.js`
2. Set up lowdb (JSON database)
3. Store alerts and incidents
4. Implement query functionality
5. Create statistics history

**Deliverable:** Persistent storage working

---

## **Phase 7 (Optional): Web Dashboard**

### **Session 14-16: Web Interface**
**What we'll do:**
1. Create Express server (`src/visualization/webServer.js`)
2. Build HTML dashboard
3. Add real-time charts (Chart.js or D3.js)
4. Create live alert feed (Socket.io)
5. Build REST API for querying data

**Deliverable:** Beautiful web dashboard!

---

## **🔧 Our Working Process**

### **Each Session Flow:**

1. **Explain Concept** (5-10 mins)
   - What we're building
   - Why it's needed
   - How it works

2. **Create Structure** (2-3 mins)
   - Make folders/files
   - Set up boilerplate

3. **Write Code** (30-45 mins)
   - I create the code
   - Explain each part
   - Add comments

4. **Test Immediately** (5-10 mins)
   - Run the code
   - See real results
   - Verify it works

5. **Debug if Needed** (variable)
   - Fix any issues
   - Explain problems
   - Improve code

6. **Git Commit** (2 mins)
   - Save progress
   - Clear commit message
   - Push to GitHub

7. **Quick Review** (3-5 mins)
   - Recap what we did
   - Preview next steps

**Total per session:** 60-90 minutes

---

## **📋 Prerequisites Checklist**

Before starting Phase 2:

- [ ] **Npcap installed** (CRITICAL!)
  - Download: https://npcap.com/
  - Install with WinPcap API-compatible mode
  - Restart computer after installation

- [ ] **Run VS Code as Administrator**
  - Right-click VS Code → "Run as administrator"
  - Required for packet capture

- [ ] **Basic Understanding**
  - Packets = data traveling on network
  - IP address = computer's address
  - Port = application's door number

- [ ] **Optional but Helpful**
  - Wireshark installed (for comparison)
  - Basic networking knowledge
  - Understanding of TCP/IP

---

## **⏱️ Time Estimates**

**Conservative (Learning as we go):**
- Phase 2: 3 sessions × 1.5 hours = 4.5 hours
- Phase 3: 3 sessions × 1.5 hours = 4.5 hours
- Phase 4: 3 sessions × 1.5 hours = 4.5 hours
- Phase 5: 2 sessions × 1.5 hours = 3 hours
- Phase 6: 2 sessions × 1.5 hours = 3 hours
- Phase 7: 3 sessions × 2 hours = 6 hours (optional)
- **Total: ~20-26 hours over 2-4 weeks**

**Aggressive (Experienced developer):**
- **Total: ~10-15 hours over 1-2 weeks**

---

## **🚀 The Journey**

```
✅ Phase 1: Foundation (COMPLETE)
   └─ CLI, Config, Utils, Documentation

⬜ Phase 2: Packet Capture
   └─ Can see network traffic

⬜ Phase 3: Detection Algorithms
   └─ Can detect attacks

⬜ Phase 4: Analysis Engine
   └─ Can analyze patterns

⬜ Phase 5: Alerts & Logging
   └─ Professional features

⬜ Phase 6: Export & Storage
   └─ Data management

⬜ Phase 7: Web Dashboard (Optional)
   └─ Visual interface

🎉 COMPLETE: Network Security Tool!
```

---

## **💡 Teaching Approach**

**I will:**
- ✅ Explain networking concepts as we go
- ✅ Show real examples and test after every feature
- ✅ Break down complex topics into simple steps
- ✅ Answer all questions patiently
- ✅ Adjust pace based on your feedback

**You should:**
- ✅ Ask questions anytime
- ✅ Tell me if pace is too fast/slow
- ✅ Test the code yourself
- ✅ Experiment with modifications
- ✅ Have fun learning!

---

## **🎓 What You'll Learn**

By completion:
- ✅ Deep understanding of network packets
- ✅ How network attacks work and how to detect them
- ✅ Binary data parsing in Node.js
- ✅ Real-time data processing
- ✅ Complex algorithm implementation
- ✅ Professional code architecture
- ✅ Testing and debugging strategies
- ✅ A portfolio-worthy cybersecurity project

---

## **🎯 Success Metrics**

### **Phase 2 Success:**
- [ ] Can capture packets on local network
- [ ] Can parse Ethernet/IP headers
- [ ] Can identify protocol types
- [ ] Can display readable packet info

### **Phase 3 Success:**
- [ ] Can detect simulated DDoS attacks
- [ ] Can identify port scans
- [ ] Can detect IP spoofing attempts
- [ ] False positive rate < 5%

### **Project Success:**
- [ ] All detection modules working
- [ ] Real-time monitoring operational
- [ ] Export functionality complete
- [ ] Documentation comprehensive
- [ ] Can demonstrate to others

---

## **🚦 How to Start**

When you're ready, just say:

- **"Let's start Phase 2"** → Begin packet capture
- **"I need to install Npcap first"** → I'll guide you
- **"Explain [concept] first"** → I'll break it down
- **"Can we add [feature]?"** → Let's discuss!

---

## **📞 Getting Help**

**During development:**
- Ask me anything, anytime
- Request explanations
- Report errors immediately
- Suggest improvements

**External resources:**
- Npcap: https://npcap.com/
- Wireshark: https://www.wireshark.org/
- Node.js cap: https://github.com/mscdex/cap
- Stack Overflow: Tag with `node.js`, `packet-capture`

---

## **🎉 Final Notes**

**Remember:**
- This is a learning journey, not a race
- Understanding > Speed
- Every error is a learning opportunity
- We'll build something impressive together!

**Let's build an amazing network security tool! 🚀**

---

*Workflow Version: 1.0*  
*Last Updated: October 9, 2025*  
*Author: Vyom Khurana*
