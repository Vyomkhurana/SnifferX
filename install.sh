#!/bin/bash

# SnifferX Professional Installation Script
# Installs SnifferX as a global command-line tool

set -e

echo "╔════════════════════════════════════════════════════════╗"
echo "║              SnifferX Installation                   ║"
echo "║      Network Threat Detection & Analysis Tool        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Detect OS
OS="unknown"
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="mac"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    OS="windows"
fi

echo -e "${BLUE}📦 Detected OS: ${CYAN}$OS${NC}"
echo ""

# Check Node.js
echo -e "${BLUE}📦 Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found${NC}"
    echo ""
    echo "Please install Node.js first:"
    if [[ "$OS" == "linux" ]]; then
        echo "  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
        echo "  sudo apt install -y nodejs"
    elif [[ "$OS" == "mac" ]]; then
        echo "  brew install node"
    else
        echo "  Download from: https://nodejs.org/"
    fi
    exit 1
else
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js found: ${NODE_VERSION}${NC}"
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm not found${NC}"
    exit 1
fi

# Check tshark
echo -e "${BLUE}📦 Checking tshark (Wireshark CLI)...${NC}"
if ! command -v tshark &> /dev/null; then
    echo -e "${YELLOW}⚠️  tshark not found${NC}"
    echo ""
    echo "Installing tshark is required for packet capture."
    echo ""
    
    if [[ "$OS" == "linux" ]]; then
        read -p "Install tshark now? (y/n): " INSTALL_TSHARK
        if [[ "$INSTALL_TSHARK" == "y" ]]; then
            echo "wireshark-common wireshark-common/install-setuid boolean true" | sudo debconf-set-selections
            sudo DEBIAN_FRONTEND=noninteractive apt update
            sudo DEBIAN_FRONTEND=noninteractive apt install -y tshark
            echo -e "${GREEN}✓ tshark installed${NC}"
        fi
    else
        echo "Please install Wireshark:"
        echo "  Linux: sudo apt install tshark"
        echo "  Mac:   brew install wireshark"
        echo "  Windows: https://www.wireshark.org/download.html"
    fi
else
    TSHARK_VERSION=$(tshark --version | head -n1)
    echo -e "${GREEN}✓ tshark found: ${TSHARK_VERSION}${NC}"
fi

echo ""
echo -e "${BLUE}📦 Installing SnifferX dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"

echo ""
echo -e "${BLUE}🔗 Creating global link...${NC}"

# Make snifferx.js executable
chmod +x snifferx.js 2>/dev/null || true

# Link globally
if npm link 2>/dev/null; then
    echo -e "${GREEN}✓ SnifferX linked globally${NC}"
else
    echo -e "${YELLOW}⚠️  Global link failed (trying with sudo)${NC}"
    sudo npm link
    echo -e "${GREEN}✓ SnifferX linked globally (with sudo)${NC}"
fi

# Configure wireshark permissions (Linux only)
if [[ "$OS" == "linux" ]]; then
    echo ""
    echo -e "${BLUE}🔧 Configuring packet capture permissions...${NC}"
    sudo dpkg-reconfigure -p critical wireshark-common 2>/dev/null || true
    sudo usermod -aG wireshark $USER 2>/dev/null || true
    echo -e "${GREEN}✓ Permissions configured${NC}"
    echo -e "${YELLOW}⚠️  Note: Logout/login or run 'newgrp wireshark' to apply${NC}"
fi

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║           ✓ Installation Complete!                  ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}✅ SnifferX is now installed globally!${NC}"
echo ""
echo -e "${CYAN}Quick Start:${NC}"
echo ""
echo -e "${YELLOW}1. List network interfaces:${NC}"
echo -e "   ${CYAN}snifferx interfaces${NC}"
echo ""
echo -e "${YELLOW}2. Start monitoring:${NC}"
echo -e "   ${CYAN}sudo snifferx monitor -i <interface-id>${NC}"
echo ""
echo -e "${YELLOW}3. View configuration:${NC}"
echo -e "   ${CYAN}snifferx config${NC}"
echo ""
echo -e "${YELLOW}4. Get help:${NC}"
echo -e "   ${CYAN}snifferx --help${NC}"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "   - README.md           - Project overview"
echo "   - LINUX_SETUP.md      - Linux-specific guide"
echo "   - PHASE3_SUMMARY.md   - Detection algorithms"
echo ""
echo -e "${RED}⚠️  Note: Packet capture requires sudo/root privileges${NC}"
echo ""
