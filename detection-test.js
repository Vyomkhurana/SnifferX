/**
 * Detection Test
 * Tests all three detection modules with real packet capture
 */

const chalk = require('chalk');
const config = require('./config');
const CaptureManager = require('./src/capture/captureManager');
const DDoSDetector = require('./src/detection/ddosDetector');
const PortScanDetector = require('./src/detection/portScanDetector');
const IPSpoofingDetector = require('./src/detection/ipSpoofingDetector');
const utils = require('./utils');

// Display banner
console.log(chalk.cyan.bold('\n╔════════════════════════════════════════════════════════╗'));
console.log(chalk.cyan.bold('║           SnifferX Detection System Test            ║'));
console.log(chalk.cyan.bold('║              Phase 3: Detection Algorithms           ║'));
console.log(chalk.cyan.bold('╚════════════════════════════════════════════════════════╝\n'));

// Initialize detectors
const ddosDetector = new DDoSDetector(config);
const portScanDetector = new PortScanDetector(config);
const ipSpoofingDetector = new IPSpoofingDetector(config);

// Statistics
let totalPackets = 0;
let totalAlerts = 0;
let packetsByProtocol = {};
let lastStatsTime = Date.now();

/**
 * Display live statistics
 */
function displayLiveStats() {
    const uptime = Math.floor((Date.now() - lastStatsTime) / 1000);
    
    console.log(chalk.bold.cyan('\n📊 Live Statistics:'));
    console.log(chalk.gray('─'.repeat(70)));
    console.log(`  ${chalk.white('Total Packets:')} ${chalk.cyan(totalPackets)}`);
    console.log(`  ${chalk.white('Total Alerts:')} ${chalk.red(totalAlerts)}`);
    console.log(`  ${chalk.white('Uptime:')} ${chalk.cyan(uptime)}s`);
    
    // Protocol breakdown
    const protocols = Object.entries(packetsByProtocol)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    if (protocols.length > 0) {
        console.log(chalk.bold('\n  Protocol Distribution:'));
        protocols.forEach(([proto, count]) => {
            const percentage = ((count / totalPackets) * 100).toFixed(1);
            console.log(`    ${proto.padEnd(10)} ${chalk.cyan(count.toString().padStart(6))} packets (${percentage}%)`);
        });
    }
    console.log(chalk.gray('─'.repeat(70)));
}

/**
 * Handle each captured packet
 */
function handlePacket(packet) {
    totalPackets++;
    
    // Track protocol distribution
    const proto = packet.protocol || 'UNKNOWN';
    packetsByProtocol[proto] = (packetsByProtocol[proto] || 0) + 1;
    
    // Run through all detectors
    const ddosAlert = ddosDetector.analyze(packet);
    const portScanAlert = portScanDetector.analyze(packet);
    const spoofingAlert = ipSpoofingDetector.analyze(packet);
    
    // Display alerts immediately
    if (ddosAlert) {
        totalAlerts++;
        console.log('\n' + ddosAlert.message);
        console.log(chalk.gray(`  └─ Details: ${JSON.stringify(ddosAlert.details, null, 2).replace(/\n/g, '\n     ')}`));
    }
    
    if (portScanAlert) {
        totalAlerts++;
        console.log('\n' + portScanAlert.message);
        console.log(chalk.gray(`  └─ Details: ${JSON.stringify(portScanAlert.details, null, 2).replace(/\n/g, '\n     ')}`));
    }
    
    if (spoofingAlert) {
        totalAlerts++;
        console.log('\n' + spoofingAlert.message);
        console.log(chalk.gray(`  └─ Details: ${JSON.stringify(spoofingAlert.details, null, 2).replace(/\n/g, '\n     ')}`));
    }
    
    // Show live stats every 500 packets
    if (totalPackets % 500 === 0) {
        displayLiveStats();
    }
    
    // Show first few packets for verification
    if (totalPackets <= 10) {
        const color = packet.isTCP() ? 'blue' : packet.isUDP() ? 'green' : 'gray';
        console.log(chalk[color](`[${totalPackets}] ${packet.toString()}`));
    }
}

/**
 * Display final statistics
 */
function displayFinalStats(manager) {
    console.log(chalk.bold.green('\n\n═══════════════════════════════════════════════════════════════'));
    console.log(chalk.bold.green('                    FINAL DETECTION REPORT'));
    console.log(chalk.bold.green('═══════════════════════════════════════════════════════════════\n'));
    
    // Capture stats
    const captureStats = manager.getStatistics();
    console.log(chalk.bold.white('📡 Capture Statistics:'));
    console.log(chalk.gray('─'.repeat(70)));
    console.log(`  Total Packets: ${chalk.cyan(captureStats.totalPackets)}`);
    console.log(`  Duration: ${chalk.cyan(captureStats.duration)}`);
    console.log(`  Avg Rate: ${chalk.cyan(captureStats.packetsPerSecond)} packets/sec`);
    console.log(chalk.gray('─'.repeat(70)));
    
    // Detection stats
    ddosDetector.displayStats();
    portScanDetector.displayStats();
    ipSpoofingDetector.displayStats();
    
    // Overall summary
    const ddosStats = ddosDetector.getStatistics();
    const portStats = portScanDetector.getStatistics();
    const spoofingStats = ipSpoofingDetector.getStatistics();
    
    console.log(chalk.bold.yellow('\n🎯 Overall Threat Summary:'));
    console.log(chalk.gray('─'.repeat(70)));
    console.log(`  Total Threats Detected: ${chalk.red(totalAlerts)}`);
    console.log(`  DDoS Alerts: ${chalk.cyan(ddosStats.totalAlertsGenerated)}`);
    console.log(`  Port Scan Alerts: ${chalk.cyan(portStats.totalAlertsGenerated)}`);
    console.log(`  IP Spoofing Alerts: ${chalk.cyan(spoofingStats.totalAlertsGenerated)}`);
    console.log(chalk.gray('─'.repeat(70)));
    
    // Threat level
    const criticalCount = ddosStats.criticalAlerts + portStats.criticalAlerts + spoofingStats.criticalAlerts;
    const highCount = ddosStats.highAlerts + portStats.highAlerts + spoofingStats.highAlerts;
    
    let threatLevel = 'LOW';
    let threatColor = 'green';
    
    if (criticalCount > 0) {
        threatLevel = 'CRITICAL';
        threatColor = 'red';
    } else if (highCount > 5) {
        threatLevel = 'HIGH';
        threatColor = 'yellow';
    } else if (totalAlerts > 0) {
        threatLevel = 'MEDIUM';
        threatColor = 'cyan';
    }
    
    console.log(chalk.bold[threatColor](`\n  ⚠️  Threat Level: ${threatLevel}\n`));
    
    console.log(chalk.bold.green('═══════════════════════════════════════════════════════════════\n'));
}

/**
 * Main function
 */
async function main() {
    try {
        // Get interface from command line or list interfaces
        const args = process.argv.slice(2);
        
        if (args.length === 0) {
            console.log(chalk.yellow('📋 Available Network Interfaces:\n'));
            const interfaces = await CaptureManager.listInterfaces();
            
            interfaces.forEach(iface => {
                console.log(`  ${chalk.cyan(iface.id)}. ${chalk.white(iface.description || iface.name)}`);
            });
            
            console.log(chalk.gray('\nUsage: node detection-test.js <interface_id>'));
            console.log(chalk.gray('Example: node detection-test.js 6\n'));
            process.exit(0);
        }
        
        const interfaceId = args[0];
        
        console.log(chalk.bold.white('🔧 Configuration:'));
        console.log(chalk.gray('─'.repeat(70)));
        console.log(`  DDoS Threshold: ${chalk.cyan(config.detection.ddos.packetsPerSecondThreshold)} pps`);
        console.log(`  Port Scan Threshold: ${chalk.cyan(config.detection.portScanning.distinctPortsThreshold)} ports`);
        console.log(`  IP Spoofing TTL Variance: ${chalk.cyan(config.detection.ipSpoofing.ttlVarianceThreshold)}`);
        console.log(chalk.gray('─'.repeat(70)));
        
        console.log(chalk.bold.green('\n✓ All detectors initialized'));
        console.log(chalk.white(`\n🚀 Starting capture on interface ${chalk.cyan(interfaceId)}...`));
        console.log(chalk.gray('Press Ctrl+C to stop\n'));
        
        // Create capture manager
        const manager = new CaptureManager(config);
        
        // Register packet callback
        manager.onPacket(handlePacket);
        
        // Start capture
        manager.start(interfaceId);
        
        // Handle Ctrl+C gracefully
        process.on('SIGINT', () => {
            console.log(chalk.yellow('\n\n⏹️  Stopping capture...\n'));
            manager.stop();
            displayFinalStats(manager);
            process.exit(0);
        });
        
        // Auto-stop after 60 seconds for testing
        setTimeout(() => {
            console.log(chalk.yellow('\n\n⏹️  Auto-stopping after 60 seconds...\n'));
            manager.stop();
            displayFinalStats(manager);
            process.exit(0);
        }, 60000);
        
    } catch (error) {
        console.error(chalk.red(`\n❌ Error: ${error.message}\n`));
        process.exit(1);
    }
}

// Run main function
main();
