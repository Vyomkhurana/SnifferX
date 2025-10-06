/**
 * SnifferX - Network Traffic Analyzer
 * A cybersecurity tool for capturing and analyzing network traffic
 * Features: Packet capture, DDoS detection, IP spoofing detection, and more
 * 
 * @author Vyom Khurana
 * @version 1.0.0
 */

const displayBanner = () => {
    console.log('╔════════════════════════════════════════╗');
    console.log('║   SnifferX - Network Traffic Analyzer  ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('');
    console.log('Version: 1.0.0');
    console.log('Status: ✓ Project Initialized');
    console.log('Author: Vyom Khurana');
    console.log('');
};

const displayFeatures = () => {
    console.log('🔍 Planned Features:');
    console.log('  → Network packet capture using Wireshark/pcap');
    console.log('  → Real-time traffic analysis');
    console.log('  → DDoS attack detection');
    console.log('  → IP spoofing detection');
    console.log('  → Suspicious activity monitoring');
    console.log('  → Traffic visualization');
    console.log('  → Port scanning detection');
    console.log('  → Protocol analysis');
    console.log('');
};

// Main execution
displayBanner();
displayFeatures();
console.log('🚀 SnifferX initialized successfully!');
console.log('⚠️  Remember: Use only for authorized security testing\n');
