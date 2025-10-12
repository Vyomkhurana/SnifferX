#!/bin/bash

# SnifferX Linux Setup Script
# Automatically installs dependencies and configures SnifferX for Linux

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════╗"
echo "║         SnifferX Linux Setup & Installation          ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if running on Linux
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    echo -e "${RED}❌ This script is for Linux only${NC}"
    echo "Detected OS: $OSTYPE"
    exit 1
fi

echo -e "${BLUE}📦 Step 1: Checking system requirements...${NC}"

# Check for sudo
if ! command -v sudo &> /dev/null; then
    echo -e "${RED}❌ sudo not found. Please run as root or install sudo${NC}"
    exit 1
fi

echo -e "${GREEN}✓ System check passed${NC}"
echo ""

# Update package list
echo -e "${BLUE}📦 Step 2: Updating package list...${NC}"
sudo apt update -qq
echo -e "${GREEN}✓ Package list updated${NC}"
echo ""

# Install Node.js
echo -e "${BLUE}📦 Step 3: Installing Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo "Installing Node.js 20.x..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    echo -e "${GREEN}✓ Node.js installed: $(node --version)${NC}"
else
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 14 ]; then
        echo -e "${YELLOW}⚠️  Node.js version is old. Upgrading...${NC}"
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt install -y nodejs
        echo -e "${GREEN}✓ Node.js upgraded: $(node --version)${NC}"
    else
        echo -e "${GREEN}✓ Node.js already installed: $(node --version)${NC}"
    fi
fi
echo ""

# Install tshark
echo -e "${BLUE}📦 Step 4: Installing tshark (Wireshark CLI)...${NC}"
if ! command -v tshark &> /dev/null; then
    echo "Installing tshark..."
    # Pre-configure wireshark-common to allow non-root capture
    echo "wireshark-common wireshark-common/install-setuid boolean true" | sudo debconf-set-selections
    sudo DEBIAN_FRONTEND=noninteractive apt install -y tshark
    echo -e "${GREEN}✓ tshark installed: $(tshark --version | head -n1)${NC}"
else
    echo -e "${GREEN}✓ tshark already installed: $(tshark --version | head -n1)${NC}"
fi
echo ""

# Configure wireshark for non-root capture
echo -e "${BLUE}🔧 Step 5: Configuring packet capture permissions...${NC}"
sudo dpkg-reconfigure -p critical wireshark-common 2>/dev/null || true
sudo usermod -aG wireshark $USER 2>/dev/null || true
echo -e "${GREEN}✓ Permissions configured${NC}"
echo -e "${YELLOW}⚠️  Note: You may need to logout/login or run 'newgrp wireshark' for permissions to take effect${NC}"
echo ""

# Install npm dependencies
echo -e "${BLUE}📦 Step 6: Installing Node.js dependencies...${NC}"
if [ -f "package.json" ]; then
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${RED}❌ package.json not found. Are you in the SnifferX directory?${NC}"
    exit 1
fi
echo ""

# Check network interfaces
echo -e "${BLUE}📡 Step 7: Checking network interfaces...${NC}"
if command -v tshark &> /dev/null; then
    echo "Available interfaces:"
    sudo tshark -D || echo -e "${YELLOW}⚠️  Could not list interfaces${NC}"
else
    echo -e "${YELLOW}⚠️  tshark not available to list interfaces${NC}"
fi
echo ""

# Display completion message
echo "╔════════════════════════════════════════════════════════╗"
echo "║              ✓ Setup Complete!                       ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}✅ SnifferX is ready to run on Linux!${NC}"
echo ""
echo -e "${BLUE}📝 Quick Start:${NC}"
echo ""
echo "1. Apply wireshark group (if first install):"
echo "   ${YELLOW}newgrp wireshark${NC}"
echo ""
echo "2. List network interfaces:"
echo "   ${YELLOW}sudo node detection-test.js${NC}"
echo ""
echo "3. Start detection on interface (e.g., interface 1):"
echo "   ${YELLOW}sudo node detection-test.js 1${NC}"
echo ""
echo "4. Press Ctrl+C to stop"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "   - LINUX_SETUP.md    - Detailed Linux setup guide"
echo "   - PHASE3_SUMMARY.md - Detection algorithms overview"
echo ""
echo -e "${YELLOW}⚠️  Important: Packet capture requires sudo/root privileges${NC}"
echo ""
