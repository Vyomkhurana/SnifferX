/**
 * SnifferX - Network Traffic Analyzer
 * A cybersecurity tool for capturing and analyzing network traffic
 * Features: Packet capture, DDoS detection, IP spoofing detection, and more
 * 
 * @author Vyom Khurana
 * @version 1.0.0
 */

const config = require('./config');
const utils = require('./utils');

const displayBanner = () => {
    console.log('╔════════════════════════════════════════╗');
    console.log('║   SnifferX - Network Traffic Analyzer  ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('');
    console.log(`Version: ${config.app.version}`);
    console.log('Status: ✓ Project Initialized');
    console.log(`Author: ${config.app.author}`);
    console.log(`Started: ${utils.getTimestamp()}`);
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

const displayConfiguration = () => {
    console.log('⚙️  Configuration:');
    console.log(`  → DDoS Detection: ${config.detection.ddos.enabled ? '✓ Enabled' : '✗ Disabled'}`);
    console.log(`  → IP Spoofing Detection: ${config.detection.ipSpoofing.enabled ? '✓ Enabled' : '✗ Disabled'}`);
    console.log(`  → Port Scanning Detection: ${config.detection.portScanning.enabled ? '✓ Enabled' : '✗ Disabled'}`);
    console.log(`  → Logging: ${config.logging.enabled ? '✓ Enabled' : '✗ Disabled'} (Level: ${config.logging.level})`);
    console.log('');
};

// Main execution
try {
    displayBanner();
    displayFeatures();
    displayConfiguration();
    
    utils.log('success', 'SnifferX initialized successfully!');
    utils.log('warn', 'Remember: Use only for authorized security testing');
    console.log('');
} catch (error) {
    utils.log('error', `Failed to initialize: ${error.message}`);
    process.exit(1);
}
