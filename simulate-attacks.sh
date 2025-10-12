#!/bin/bash

# SnifferX Attack Simulation Script for Linux
# Tests detection capabilities with real attack tools

echo "╔════════════════════════════════════════════════════════╗"
echo "║       SnifferX Attack Simulation (Linux Only)        ║"
echo "║           ⚠️  FOR EDUCATIONAL PURPOSES ONLY           ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Please run as root: sudo ./simulate-attacks.sh${NC}"
    exit 1
fi

# Warning
echo -e "${RED}⚠️  WARNING: This script will simulate network attacks${NC}"
echo -e "${RED}⚠️  Only use on networks you own or have permission to test${NC}"
echo -e "${RED}⚠️  Unauthorized use may be illegal${NC}"
echo ""
read -p "Do you understand and accept? (yes/no): " ACCEPT

if [ "$ACCEPT" != "yes" ]; then
    echo "Aborted."
    exit 0
fi

echo ""
echo -e "${BLUE}Installing attack simulation tools...${NC}"

# Install tools if not present
if ! command -v hping3 &> /dev/null; then
    echo "Installing hping3..."
    apt update -qq
    apt install -y hping3
fi

if ! command -v nmap &> /dev/null; then
    echo "Installing nmap..."
    apt install -y nmap
fi

if ! command -v python3 &> /dev/null || ! python3 -c "import scapy" 2>/dev/null; then
    echo "Installing scapy..."
    apt install -y python3-pip
    pip3 install scapy
fi

echo -e "${GREEN}✓ Tools installed${NC}"
echo ""

# Get target
read -p "Enter target IP or hostname (default: 127.0.0.1): " TARGET
TARGET=${TARGET:-127.0.0.1}

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║              Attack Simulation Menu                  ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "1. 🛡️  DDoS Simulation (High packet rate)"
echo "2. 🔍 Port Scan Simulation (nmap)"
echo "3. 🎭 IP Spoofing Simulation (Scapy)"
echo "4. 🎯 All Tests (Sequential)"
echo "5. ❌ Exit"
echo ""
read -p "Select test (1-5): " CHOICE

case $CHOICE in
    1)
        echo ""
        echo -e "${BLUE}🛡️  Starting DDoS simulation...${NC}"
        echo "Target: $TARGET"
        echo "Duration: 10 seconds"
        echo ""
        echo -e "${YELLOW}SnifferX should detect: High packet rate alert${NC}"
        echo ""
        read -p "Press Enter to start..."
        
        # Send flood of ICMP packets
        timeout 10 hping3 --icmp --flood --rand-source $TARGET 2>/dev/null
        
        echo ""
        echo -e "${GREEN}✓ DDoS simulation complete${NC}"
        ;;
    
    2)
        echo ""
        echo -e "${BLUE}🔍 Starting port scan simulation...${NC}"
        echo "Target: $TARGET"
        echo "Ports: 1-100"
        echo ""
        echo -e "${YELLOW}SnifferX should detect: Port scanning activity${NC}"
        echo ""
        read -p "Press Enter to start..."
        
        # Scan ports 1-100
        nmap -p 1-100 --max-retries 0 --max-rtt-timeout 100ms $TARGET
        
        echo ""
        echo -e "${GREEN}✓ Port scan simulation complete${NC}"
        ;;
    
    3)
        echo ""
        echo -e "${BLUE}🎭 Starting IP spoofing simulation...${NC}"
        echo "Target: $TARGET"
        echo "Spoofed source: 8.8.8.8"
        echo ""
        echo -e "${YELLOW}SnifferX should detect: TTL variance/IP spoofing${NC}"
        echo ""
        read -p "Press Enter to start..."
        
        # Send spoofed packets with Scapy
        python3 << 'PYEOF'
from scapy.all import *
import sys

target = sys.argv[1] if len(sys.argv) > 1 else "127.0.0.1"

print(f"Sending spoofed packets to {target}...")

# Send 10 packets with spoofed source IP
for i in range(10):
    # Spoof as Google DNS
    pkt = IP(src="8.8.8.8", dst=target)/ICMP()
    send(pkt, verbose=False)
    time.sleep(0.1)

print("Sent 10 spoofed packets")
PYEOF
        
        echo ""
        echo -e "${GREEN}✓ IP spoofing simulation complete${NC}"
        ;;
    
    4)
        echo ""
        echo -e "${BLUE}🎯 Running all tests sequentially...${NC}"
        echo ""
        
        # Test 1: DDoS
        echo -e "${BLUE}[1/3] DDoS Simulation${NC}"
        timeout 5 hping3 --icmp --flood --rand-source $TARGET 2>/dev/null
        sleep 2
        
        # Test 2: Port Scan
        echo -e "${BLUE}[2/3] Port Scan Simulation${NC}"
        nmap -p 1-50 --max-retries 0 --max-rtt-timeout 100ms $TARGET 2>/dev/null
        sleep 2
        
        # Test 3: IP Spoofing
        echo -e "${BLUE}[3/3] IP Spoofing Simulation${NC}"
        python3 -c "from scapy.all import *; [send(IP(src='8.8.8.8', dst='$TARGET')/ICMP(), verbose=False) for _ in range(5)]"
        
        echo ""
        echo -e "${GREEN}✓ All tests complete${NC}"
        ;;
    
    5)
        echo "Exiting..."
        exit 0
        ;;
    
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║                Test Complete                         ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo -e "${BLUE}📊 Check SnifferX output for detected threats!${NC}"
echo ""
echo "Expected detections:"
echo "  🛡️  DDoS: High packet rate from multiple sources"
echo "  🔍 Port Scan: Multiple port connection attempts"
echo "  🎭 IP Spoofing: TTL anomaly from spoofed source"
echo ""
