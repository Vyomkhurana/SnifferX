#!/usr/bin/env node

/**
 * SnifferX - Network Traffic Analysis & Threat Detection Tool
 * Professional CLI for real-time network security monitoring
 * 
 * @author Vyom Khurana
 * @version 1.0.0
 * @license MIT
 */

const chalk = require('chalk');
const { Command } = require('commander');
const config = require('./config');
const CaptureManager = require('./src/capture/captureManager');
const DDoSDetector = require('./src/detection/ddosDetector');
const PortScanDetector = require('./src/detection/portScanDetector');
const IPSpoofingDetector = require('./src/detection/ipSpoofingDetector');
const utils = require('./utils');

// ASCII Art Banner
const displayBanner = () => {
    console.clear();
    console.log(chalk.cyan(`
    ███████╗███╗   ██╗██╗███████╗███████╗███████╗██████╗ ██╗  ██╗
    ██╔════╝████╗  ██║██║██╔════╝██╔════╝██╔════╝██╔══██╗╚██╗██╔╝
    ███████╗██╔██╗ ██║██║█████╗  █████╗  █████╗  ██████╔╝ ╚███╔╝ 
    ╚════██║██║╚██╗██║██║██╔══╝  ██╔══╝  ██╔══╝  ██╔══██╗ ██╔██╗ 
    ███████║██║ ╚████║██║██║     ██║     ███████╗██║  ██║██╔╝ ██╗
    ╚══════╝╚═╝  ╚═══╝╚═╝╚═╝     ╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝
    `));
    console.log(chalk.gray('    ═══════════════════════════════════════════════════════════'));
    console.log(chalk.white(`           Network Threat Detection & Analysis v${config.app.version}`));
    console.log(chalk.gray('    ═══════════════════════════════════════════════════════════'));
    console.log(chalk.gray(`    Author: ${config.app.author}`));
    console.log(chalk.gray(`    GitHub: ${config.app.github}`));
    console.log(chalk.gray('    ═══════════════════════════════════════════════════════════\n'));
};

// Statistics tracking
let stats = {
    totalPackets: 0,
    startTime: null,
    alerts: {
        ddos: 0,
        portScan: 0,
        ipSpoofing: 0
    },
    protocols: {},
    topTalkers: {}
};

/**
 * Display live monitoring dashboard
 */
function displayDashboard() {
    const uptime = stats.startTime ? Math.floor((Date.now() - stats.startTime) / 1000) : 0;
    const pps = uptime > 0 ? (stats.totalPackets / uptime).toFixed(2) : 0;
    
    // Clear previous stats (keep banner visible)
    console.log('\n' + chalk.bold.cyan('═══════════════════════════════════════════════════════════'));
    console.log(chalk.bold.cyan('                    LIVE MONITORING DASHBOARD'));
    console.log(chalk.bold.cyan('═══════════════════════════════════════════════════════════\n'));
    
    // System Status
    console.log(chalk.bold.green('📊 System Status'));
    console.log(chalk.gray('───────────────────────────────────────────────────────────'));
    console.log(`  ${chalk.white('Total Packets:')}  ${chalk.cyan(stats.totalPackets.toLocaleString())}`);
    console.log(`  ${chalk.white('Packet Rate:')}   ${chalk.cyan(pps)} ${chalk.gray('pps')}`);
    console.log(`  ${chalk.white('Uptime:')}        ${chalk.cyan(uptime)}${chalk.gray('s')}`);
    console.log(`  ${chalk.white('Status:')}        ${chalk.green('● ACTIVE')}`);
    
    // Threat Alerts
    const totalAlerts = stats.alerts.ddos + stats.alerts.portScan + stats.alerts.ipSpoofing;
    console.log(chalk.bold.red('\n🚨 Threat Detection'));
    console.log(chalk.gray('───────────────────────────────────────────────────────────'));
    console.log(`  ${chalk.white('Total Alerts:')}   ${totalAlerts > 0 ? chalk.red(totalAlerts) : chalk.green('0')}`);
    console.log(`  ${chalk.white('DDoS Attacks:')}   ${stats.alerts.ddos > 0 ? chalk.red(stats.alerts.ddos) : chalk.gray('0')}`);
    console.log(`  ${chalk.white('Port Scans:')}     ${stats.alerts.portScan > 0 ? chalk.red(stats.alerts.portScan) : chalk.gray('0')}`);
    console.log(`  ${chalk.white('IP Spoofing:')}    ${stats.alerts.ipSpoofing > 0 ? chalk.red(stats.alerts.ipSpoofing) : chalk.gray('0')}`);
    
    // Protocol Distribution
    const protocols = Object.entries(stats.protocols)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    if (protocols.length > 0) {
        console.log(chalk.bold.blue('\n📡 Protocol Distribution'));
        console.log(chalk.gray('───────────────────────────────────────────────────────────'));
        protocols.forEach(([proto, count]) => {
            const percentage = ((count / stats.totalPackets) * 100).toFixed(1);
            const bar = '█'.repeat(Math.floor(percentage / 2));
            console.log(`  ${chalk.white(proto.padEnd(8))} ${chalk.cyan(bar)} ${chalk.gray(percentage + '%')}`);
        });
    }
    
    // Top Talkers
    const talkers = Object.entries(stats.topTalkers)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    if (talkers.length > 0) {
        console.log(chalk.bold.magenta('\n🌐 Top Source IPs'));
        console.log(chalk.gray('───────────────────────────────────────────────────────────'));
        talkers.forEach(([ip, count], index) => {
            console.log(`  ${chalk.gray(`${index + 1}.`)} ${chalk.cyan(ip.padEnd(15))} ${chalk.gray('→')} ${chalk.white(count)} ${chalk.gray('packets')}`);
        });
    }
    
    console.log(chalk.gray('\n───────────────────────────────────────────────────────────'));
    console.log(chalk.gray('Press Ctrl+C to stop monitoring\n'));
}

/**
 * Handle packet and run detections
 */
function handlePacket(packet, detectors) {
    stats.totalPackets++;
    
    // Track protocols
    stats.protocols[packet.protocol] = (stats.protocols[packet.protocol] || 0) + 1;
    
    // Track top talkers
    if (packet.srcIP && packet.srcIP !== 'N/A' && packet.srcIP !== 'unknown') {
        stats.topTalkers[packet.srcIP] = (stats.topTalkers[packet.srcIP] || 0) + 1;
    }
    
    // Run detections
    const ddosAlert = detectors.ddos.analyze(packet);
    const portScanAlert = detectors.portScan.analyze(packet);
    const spoofingAlert = detectors.ipSpoofing.analyze(packet);
    
    // Handle alerts
    if (ddosAlert) {
        stats.alerts.ddos++;
        console.log('\n' + chalk.red.bold('🚨 THREAT DETECTED!'));
        console.log(chalk.red('─'.repeat(70)));
        console.log(ddosAlert.message);
        console.log(chalk.gray(`Time: ${utils.getFormattedTimestamp()}`));
        console.log(chalk.red('─'.repeat(70)));
    }
    
    if (portScanAlert) {
        stats.alerts.portScan++;
        console.log('\n' + chalk.yellow.bold('⚠️  SUSPICIOUS ACTIVITY!'));
        console.log(chalk.yellow('─'.repeat(70)));
        console.log(portScanAlert.message);
        console.log(chalk.gray(`Time: ${utils.getFormattedTimestamp()}`));
        console.log(chalk.yellow('─'.repeat(70)));
    }
    
    if (spoofingAlert) {
        stats.alerts.ipSpoofing++;
        console.log('\n' + chalk.magenta.bold('🎭 ANOMALY DETECTED!'));
        console.log(chalk.magenta('─'.repeat(70)));
        console.log(spoofingAlert.message);
        console.log(chalk.gray(`Time: ${utils.getFormattedTimestamp()}`));
        console.log(chalk.magenta('─'.repeat(70)));
    }
}

/**
 * Start monitoring mode
 */
async function startMonitoring(interfaceId, options) {
    displayBanner();
    
    console.log(chalk.cyan.bold('⚡ Initializing Detection Engines...\n'));
    
    // Initialize detectors
    const detectors = {
        ddos: new DDoSDetector(config),
        portScan: new PortScanDetector(config),
        ipSpoofing: new IPSpoofingDetector(config)
    };
    
    console.log(chalk.green('  ✓ DDoS Detector loaded'));
    console.log(chalk.green('  ✓ Port Scan Detector loaded'));
    console.log(chalk.green('  ✓ IP Spoofing Detector loaded'));
    
    console.log(chalk.cyan.bold('\n🚀 Starting Packet Capture...\n'));
    
    // Initialize capture manager
    const manager = new CaptureManager(config);
    
    // Set up packet handler
    manager.onPacket((packet) => {
        handlePacket(packet, detectors);
    });
    
    // Start capture
    stats.startTime = Date.now();
    manager.start(interfaceId);
    
    console.log(chalk.green('  ✓ Capture started successfully'));
    console.log(chalk.gray(`  ✓ Monitoring interface: ${interfaceId || 'default'}\n`));
    
    // Display dashboard every 3 seconds
    const dashboardInterval = setInterval(() => {
        displayDashboard();
    }, 3000);
    
    // Handle Ctrl+C
    process.on('SIGINT', () => {
        clearInterval(dashboardInterval);
        console.log(chalk.yellow('\n\n⚠️  Stopping capture...\n'));
        
        const captureStats = manager.stop();
        
        // Final report
        console.log(chalk.cyan.bold('═══════════════════════════════════════════════════════════'));
        console.log(chalk.cyan.bold('                      FINAL REPORT'));
        console.log(chalk.cyan.bold('═══════════════════════════════════════════════════════════\n'));
        
        console.log(chalk.white('Session Summary:'));
        console.log(chalk.gray('  Duration:        ') + chalk.cyan(captureStats.duration));
        console.log(chalk.gray('  Total Packets:   ') + chalk.cyan(captureStats.totalPackets.toLocaleString()));
        console.log(chalk.gray('  Average Rate:    ') + chalk.cyan(captureStats.packetsPerSecond + ' pps'));
        
        const totalAlerts = stats.alerts.ddos + stats.alerts.portScan + stats.alerts.ipSpoofing;
        console.log(chalk.white('\nThreat Summary:'));
        console.log(chalk.gray('  Total Alerts:    ') + (totalAlerts > 0 ? chalk.red(totalAlerts) : chalk.green('0')));
        console.log(chalk.gray('  DDoS Attacks:    ') + (stats.alerts.ddos > 0 ? chalk.red(stats.alerts.ddos) : chalk.green('0')));
        console.log(chalk.gray('  Port Scans:      ') + (stats.alerts.portScan > 0 ? chalk.red(stats.alerts.portScan) : chalk.green('0')));
        console.log(chalk.gray('  IP Spoofing:     ') + (stats.alerts.ipSpoofing > 0 ? chalk.red(stats.alerts.ipSpoofing) : chalk.green('0')));
        
        console.log(chalk.cyan.bold('\n═══════════════════════════════════════════════════════════\n'));
        console.log(chalk.green('✓ Session ended successfully\n'));
        
        process.exit(0);
    });
}

/**
 * List available network interfaces
 */
async function listInterfaces() {
    displayBanner();
    
    console.log(chalk.cyan.bold('📡 Available Network Interfaces\n'));
    
    try {
        const interfaces = await CaptureManager.listInterfaces();
        
        console.log(chalk.gray('─'.repeat(70)));
        interfaces.forEach(iface => {
            console.log(`  ${chalk.cyan(iface.id.padEnd(3))} ${chalk.white('│')} ${chalk.green(iface.description || iface.name)}`);
        });
        console.log(chalk.gray('─'.repeat(70)));
        
        console.log(chalk.yellow('\n💡 Usage: ') + chalk.white('snifferx monitor -i <interface-id>'));
        console.log(chalk.gray('   Example: ') + chalk.cyan('snifferx monitor -i 7\n'));
        
    } catch (error) {
        console.log(chalk.red('✗ Failed to list interfaces: ' + error.message + '\n'));
        process.exit(1);
    }
}

/**
 * Display configuration
 */
function showConfig() {
    displayBanner();
    
    console.log(chalk.cyan.bold('⚙️  Detection Configuration\n'));
    
    console.log(chalk.bold('DDoS Detection:'));
    console.log(`  Threshold:     ${chalk.cyan(config.detection.ddos.packetsPerSecondThreshold)} pps`);
    console.log(`  Time Window:   ${chalk.cyan(config.detection.ddos.timeWindow)}s`);
    console.log(`  Status:        ${config.detection.ddos.enabled ? chalk.green('✓ Enabled') : chalk.red('✗ Disabled')}`);
    
    console.log(chalk.bold('\nPort Scan Detection:'));
    console.log(`  Threshold:     ${chalk.cyan(config.detection.portScanning.distinctPortsThreshold)} ports`);
    console.log(`  Time Window:   ${chalk.cyan(config.detection.portScanning.timeWindow)}s`);
    console.log(`  Status:        ${config.detection.portScanning.enabled ? chalk.green('✓ Enabled') : chalk.red('✗ Disabled')}`);
    
    console.log(chalk.bold('\nIP Spoofing Detection:'));
    console.log(`  TTL Threshold: ${chalk.cyan(config.detection.ipSpoofing.ttlVarianceThreshold)} hops`);
    console.log(`  TTL Check:     ${config.detection.ipSpoofing.checkTTL ? chalk.green('✓ Enabled') : chalk.red('✗ Disabled')}`);
    console.log(`  Status:        ${config.detection.ipSpoofing.enabled ? chalk.green('✓ Enabled') : chalk.red('✗ Disabled')}`);
    
    console.log('\n');
}

// Create CLI program
const program = new Command();

program
    .name('snifferx')
    .description('Network Threat Detection & Analysis Tool')
    .version(config.app.version);

// Monitor command
program
    .command('monitor')
    .description('Start real-time network monitoring and threat detection')
    .option('-i, --interface <id>', 'Network interface ID to monitor')
    .action((options) => {
        if (!options.interface) {
            console.log(chalk.red('\n✗ Error: Interface ID required\n'));
            console.log(chalk.white('Use: ') + chalk.cyan('snifferx interfaces') + chalk.white(' to list available interfaces'));
            console.log(chalk.white('Then: ') + chalk.cyan('snifferx monitor -i <id>\n'));
            process.exit(1);
        }
        startMonitoring(options.interface, options);
    });

// Interfaces command
program
    .command('interfaces')
    .alias('list')
    .description('List available network interfaces')
    .action(listInterfaces);

// Config command
program
    .command('config')
    .description('Display current detection configuration')
    .action(showConfig);

// Parse arguments
program.parse(process.argv);

// Show help if no command
if (process.argv.length === 2) {
    displayBanner();
    console.log(chalk.yellow('⚠️  No command specified\n'));
    program.help();
}
