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
const UserBehaviorAnalytics = require('./src/detection/userBehaviorAnalytics');
const AudioAlertSystem = require('./src/audio/audioAlertSystem');
const utils = require('./utils');

// Utility: Format uptime in human-readable format
function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
    
    return parts.join(' ');
}

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
    sessionId: null,
    interfaceName: null,
    alerts: {
        ddos: 0,
        portScan: 0,
        ipSpoofing: 0,
        userBehavior: 0
    },
    protocols: {},
    topTalkers: {},
    threatHistory: [], // Store last 10 threats for visualization
    peakPacketsPerSecond: 0,
    averagePacketSize: 0
};

// Threat history management
function addThreatToHistory(threatType, severity, sourceIP, details) {
    const threat = {
        type: threatType,
        severity: severity,
        source: sourceIP,
        details: details,
        timestamp: new Date().toLocaleTimeString()
    };
    
    stats.threatHistory.unshift(threat);
    
    // Keep only last 10 threats
    if (stats.threatHistory.length > 10) {
        stats.threatHistory.pop();
    }
}

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
    console.log(chalk.bold.green('System Status'));
    console.log(chalk.gray('───────────────────────────────────────────────────────────'));
    console.log(`  ${chalk.white('Total Packets:')}  ${chalk.cyan(stats.totalPackets.toLocaleString())}`);
    console.log(`  ${chalk.white('Packet Rate:')}   ${chalk.cyan(pps)} ${chalk.gray('pps')}`);
    console.log(`  ${chalk.white('Uptime:')}        ${chalk.cyan(formatUptime(uptime))}`);
    console.log(`  ${chalk.white('Status:')}        ${chalk.green('ACTIVE')}`);
    
    // Threat Alerts
    const totalAlerts = stats.alerts.ddos + stats.alerts.portScan + stats.alerts.ipSpoofing + stats.alerts.userBehavior;
    console.log(chalk.bold.red('\nThreat Detection'));
    console.log(chalk.gray('───────────────────────────────────────────────────────────'));
    console.log(`  ${chalk.white('Total Alerts:')}   ${totalAlerts > 0 ? chalk.red(totalAlerts) : chalk.green('0')}`);
    console.log(`  ${chalk.white('DDoS Attacks:')}   ${stats.alerts.ddos > 0 ? chalk.red(stats.alerts.ddos) : chalk.gray('0')}`);
    console.log(`  ${chalk.white('Port Scans:')}     ${stats.alerts.portScan > 0 ? chalk.red(stats.alerts.portScan) : chalk.gray('0')}`);
    console.log(`  ${chalk.white('IP Spoofing:')}    ${stats.alerts.ipSpoofing > 0 ? chalk.red(stats.alerts.ipSpoofing) : chalk.gray('0')}`);
    console.log(`  ${chalk.white('User Anomalies:')} ${stats.alerts.userBehavior > 0 ? chalk.red(stats.alerts.userBehavior) : chalk.gray('0')}`);
    
    // Protocol Distribution
    const protocols = Object.entries(stats.protocols)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    if (protocols.length > 0) {
        console.log(chalk.bold.blue('\nProtocol Distribution'));
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
        console.log(chalk.bold.magenta('\nTop Source IPs'));
        console.log(chalk.gray('───────────────────────────────────────────────────────────'));
        talkers.forEach(([ip, count], index) => {
            console.log(`  ${chalk.gray(`${index + 1}.`)} ${chalk.cyan(ip.padEnd(15))} ${chalk.gray('→')} ${chalk.white(count)} ${chalk.gray('packets')}`);
        });
    }
    
    // Threat History (NEW FEATURE!)
    if (stats.threatHistory.length > 0) {
        console.log(chalk.bold.yellow('\nRecent Threat Activity'));
        console.log(chalk.gray('───────────────────────────────────────────────────────────'));
        
        stats.threatHistory.slice(0, 5).forEach((threat, index) => {
            let icon = '[!]';
            let color = chalk.yellow;
            
            // Color code by severity
            if (threat.severity === 'critical') {
                icon = '[CRIT]';
                color = chalk.red.bold;
            } else if (threat.severity === 'high') {
                icon = '[HIGH]';
                color = chalk.red;
            } else if (threat.severity === 'medium') {
                icon = '[MED]';
                color = chalk.yellow;
            } else {
                icon = '[LOW]';
                color = chalk.cyan;
            }
            
            const typeLabel = threat.type === 'ddos' ? 'DDoS' : 
                            threat.type === 'port_scan' ? 'Port Scan' :
                            threat.type === 'ip_spoofing' ? 'IP Spoof' : 'Behavior';
            
            console.log(`  ${icon} ${color(`[${threat.timestamp}]`)} ${color.bold(typeLabel)} from ${chalk.cyan(threat.source)}`);
            console.log(`     ${chalk.gray('-> ' + threat.details)}`);
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
    
    // Track packet size for averages
    if (packet.length) {
        const currentAvg = stats.averagePacketSize;
        stats.averagePacketSize = ((currentAvg * (stats.totalPackets - 1)) + packet.length) / stats.totalPackets;
    }
    
    // Track peak packets per second
    if (stats.startTime) {
        const uptime = Math.floor((Date.now() - stats.startTime) / 1000);
        if (uptime > 0) {
            const currentPps = stats.totalPackets / uptime;
            if (currentPps > stats.peakPacketsPerSecond) {
                stats.peakPacketsPerSecond = Math.floor(currentPps);
            }
        }
    }
    
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
    const userBehaviorAlert = detectors.userBehavior.analyze(packet);
    
    // Handle alerts
    if (ddosAlert) {
        stats.alerts.ddos++;
        
        // Add to threat history
        addThreatToHistory(
            'ddos',
            ddosAlert.severity,
            packet.srcIP || 'Unknown',
            `${ddosAlert.packetsPerSecond} pps detected`
        );
        
        // PLAY AUDIO ALERT!
        if (global.audioSystem) {
            global.audioSystem.playAlert('ddos', ddosAlert.severity);
        }
        
        console.log('\n' + chalk.red.bold('[!] THREAT DETECTED!'));
        console.log(chalk.red('─'.repeat(70)));
        console.log(ddosAlert.message);
        console.log(chalk.gray(`Time: ${utils.getFormattedTimestamp()}`));
        console.log(chalk.red('─'.repeat(70)));
    }
    
    if (portScanAlert) {
        stats.alerts.portScan++;
        
        // Add to threat history
        addThreatToHistory(
            'port_scan',
            portScanAlert.severity,
            packet.srcIP || 'Unknown',
            `Scanning ${portScanAlert.portsScanned || 'multiple'} ports`
        );
        
        // PLAY AUDIO ALERT!
        if (global.audioSystem) {
            global.audioSystem.playAlert('port_scan', portScanAlert.severity);
        }
        
        console.log('\n' + chalk.yellow.bold('[!] SUSPICIOUS ACTIVITY!'));
        console.log(chalk.yellow('─'.repeat(70)));
        console.log(portScanAlert.message);
        console.log(chalk.gray(`Time: ${utils.getFormattedTimestamp()}`));
        console.log(chalk.yellow('─'.repeat(70)));
    }
    
    if (spoofingAlert) {
        stats.alerts.ipSpoofing++;
        
        // Add to threat history
        addThreatToHistory(
            'ip_spoofing',
            spoofingAlert.severity,
            packet.srcIP || 'Unknown',
            `TTL anomaly detected`
        );
        
        // PLAY AUDIO ALERT!
        if (global.audioSystem) {
            global.audioSystem.playAlert('ip_spoofing', spoofingAlert.severity);
        }
        
        console.log('\n' + chalk.magenta.bold('[!] ANOMALY DETECTED!'));
        console.log(chalk.magenta('─'.repeat(70)));
        console.log(spoofingAlert.message);
        console.log(chalk.gray(`Time: ${utils.getFormattedTimestamp()}`));
        console.log(chalk.magenta('─'.repeat(70)));
    }
    
    if (userBehaviorAlert) {
        stats.alerts.userBehavior++;
        
        // Add to threat history
        addThreatToHistory(
            'user_behavior',
            userBehaviorAlert.severity,
            userBehaviorAlert.user || 'Unknown',
            `Risk score: ${userBehaviorAlert.riskScore || 'N/A'}`
        );
        
        // PLAY AUDIO ALERT!
        if (global.audioSystem) {
            global.audioSystem.playAlert('user_behavior', userBehaviorAlert.severity);
        }
        
        console.log('\n' + chalk.cyan.bold('[!] BEHAVIORAL ANOMALY!'));
        console.log(chalk.cyan('─'.repeat(70)));
        console.log(userBehaviorAlert.message);
        console.log(chalk.gray(`Time: ${utils.getFormattedTimestamp()}`));
        console.log(chalk.cyan('─'.repeat(70)));
    }
}

/**
 * Start monitoring mode
 */
async function startMonitoring(interfaceId, options) {
    displayBanner();
    
    // Generate session ID
    stats.sessionId = `snx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    stats.interfaceName = interfaceId;
    
    console.log(chalk.cyan.bold('Starting Network Threat Detection\n'));
    console.log(chalk.gray('Session ID: ') + chalk.cyan(stats.sessionId));
    console.log(chalk.gray('Interface ID: ') + chalk.cyan(interfaceId));
    console.log(chalk.gray('Time: ') + chalk.white(utils.getFormattedTimestamp()));
    console.log(chalk.gray('Audio Alerts: ') + (config.audio.enabled ? chalk.green('Enabled') : chalk.yellow('Disabled')));
    console.log();
    
    // Initialize Audio Alert System (UNIQUE FEATURE!)
    global.audioSystem = new AudioAlertSystem(config);
    if (config.audio.playOnStartup) {
        global.audioSystem.playStartupSound();
    }
    
    console.log(chalk.cyan.bold('Loading Detection Engines...\n'));
    
    // Initialize detectors
    const detectors = {
        ddos: new DDoSDetector(config),
        portScan: new PortScanDetector(config),
        ipSpoofing: new IPSpoofingDetector(config),
        userBehavior: new UserBehaviorAnalytics(config)
    };
    
    console.log(chalk.green('  [+] DDoS Attack Detection'));
    console.log(chalk.green('  [+] Port Scanning Detection'));
    console.log(chalk.green('  [+] IP Spoofing Detection'));
    console.log(chalk.green('  [+] User Behavior Analytics'));
    console.log(chalk.green('  [+] Audio Alert System'));
    
    console.log(chalk.cyan.bold('\nStarting Packet Capture...\n'));
    
    // Initialize capture manager
    const manager = new CaptureManager(config);
    
    // Set up packet handler
    manager.onPacket((packet) => {
        handlePacket(packet, detectors);
    });
    
    // Start capture
    try {
        stats.startTime = Date.now();
        manager.start(interfaceId);
        
        console.log(chalk.green('  [+] Capture started successfully'));
        console.log(chalk.gray(`  [+] Monitoring interface ${interfaceId}\n`));
        console.log(chalk.cyan('─'.repeat(70)));
        console.log(chalk.white.bold('  STATUS: ') + chalk.green('MONITORING ACTIVE'));
        console.log(chalk.gray('  Press ') + chalk.cyan('Ctrl+C') + chalk.gray(' to stop and view final report'));
        console.log(chalk.cyan('─'.repeat(70)) + '\n');
        
    } catch (error) {
        console.log(chalk.red('\n[!] Failed to start capture\n'));
        console.log(chalk.yellow('Possible causes:'));
        console.log(chalk.white('  - Invalid interface ID'));
        console.log(chalk.white('  - Insufficient permissions (try running as Administrator/sudo)'));
        console.log(chalk.white('  - Wireshark/tshark not installed correctly\n'));
        console.log(chalk.white('Run ') + chalk.cyan('snifferx interfaces') + chalk.white(' to see available interfaces\n'));
        process.exit(1);
    }
    
    // Display dashboard every 3 seconds
    const dashboardInterval = setInterval(() => {
        displayDashboard();
    }, 3000);
    
    // Handle Ctrl+C
    process.on('SIGINT', () => {
        clearInterval(dashboardInterval);
        console.log(chalk.yellow('\n\n[!] Stopping capture...\n'));
        
        // Play shutdown sound
        if (global.audioSystem && config.audio.playOnShutdown) {
            global.audioSystem.playShutdownSound();
        }
        
        const captureStats = manager.stop();
        
        // Final report
        console.log(chalk.cyan.bold('═══════════════════════════════════════════════════════════'));
        console.log(chalk.cyan.bold('                      FINAL REPORT'));
        console.log(chalk.cyan.bold('═══════════════════════════════════════════════════════════\n'));
        
        console.log(chalk.white('Session Summary:'));
        console.log(chalk.gray('  Duration:        ') + chalk.cyan(captureStats.duration));
        console.log(chalk.gray('  Total Packets:   ') + chalk.cyan(captureStats.totalPackets.toLocaleString()));
        console.log(chalk.gray('  Average Rate:    ') + chalk.cyan(captureStats.packetsPerSecond + ' pps'));
        
        const totalAlerts = stats.alerts.ddos + stats.alerts.portScan + stats.alerts.ipSpoofing + stats.alerts.userBehavior;
        console.log(chalk.white('\nThreat Summary:'));
        console.log(chalk.gray('  Total Alerts:    ') + (totalAlerts > 0 ? chalk.red(totalAlerts) : chalk.green('0')));
        console.log(chalk.gray('  DDoS Attacks:    ') + (stats.alerts.ddos > 0 ? chalk.red(stats.alerts.ddos) : chalk.green('0')));
        console.log(chalk.gray('  Port Scans:      ') + (stats.alerts.portScan > 0 ? chalk.red(stats.alerts.portScan) : chalk.green('0')));
        console.log(chalk.gray('  IP Spoofing:     ') + (stats.alerts.ipSpoofing > 0 ? chalk.red(stats.alerts.ipSpoofing) : chalk.green('0')));
        console.log(chalk.gray('  User Anomalies:  ') + (stats.alerts.userBehavior > 0 ? chalk.red(stats.alerts.userBehavior) : chalk.green('0')));
        
        console.log(chalk.cyan.bold('\n═══════════════════════════════════════════════════════════\n'));
        
        // Export session data
        try {
            const fs = require('fs');
            const path = require('path');
            
            // Create exports directory if it doesn't exist
            const exportDir = path.join(__dirname, 'exports');
            if (!fs.existsSync(exportDir)) {
                fs.mkdirSync(exportDir, { recursive: true });
            }
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const sessionData = {
                session: {
                    id: stats.sessionId || `session-${timestamp}`,
                    startTime: new Date(stats.startTime).toISOString(),
                    endTime: new Date().toISOString(),
                    duration: captureStats.duration,
                    interface: stats.interfaceName || interfaceId,
                    snifferxVersion: config.app.version,
                    platform: process.platform,
                    nodeVersion: process.version
                },
                statistics: {
                    totalPackets: captureStats.totalPackets,
                    packetsPerSecond: captureStats.packetsPerSecond,
                    peakPacketsPerSecond: stats.peakPacketsPerSecond,
                    averagePacketSize: stats.averagePacketSize,
                    totalAlerts: totalAlerts,
                    alertsByType: stats.alerts,
                    alertRate: (totalAlerts / (captureStats.totalPackets || 1) * 100).toFixed(2) + '%'
                },
                threats: stats.threatHistory,
                protocols: stats.protocols,
                topTalkers: stats.topTalkers,
                metadata: {
                    exportedAt: new Date().toISOString(),
                    exportFormat: 'json',
                    dataIntegrity: 'complete'
                }
            };
            
            // Save as JSON
            const jsonFile = path.join(exportDir, `session-${timestamp}.json`);
            fs.writeFileSync(jsonFile, JSON.stringify(sessionData, null, 2));
            
            // Save as CSV
            const csvFile = path.join(exportDir, `threats-${timestamp}.csv`);
            let csvContent = 'Timestamp,Type,Severity,Source IP,Details\n';
            stats.threatHistory.forEach(threat => {
                csvContent += `${threat.timestamp},${threat.type},${threat.severity},${threat.source},"${threat.details}"\n`;
            });
            fs.writeFileSync(csvFile, csvContent);
            
            console.log(chalk.green('[+] Session data exported'));
            console.log(chalk.gray('  JSON: ') + chalk.cyan(jsonFile));
            console.log(chalk.gray('  CSV:  ') + chalk.cyan(csvFile));
            console.log();
        } catch (error) {
            console.log(chalk.yellow('[!] Failed to export session data: ' + error.message + '\n'));
        }
        
        console.log(chalk.green('[+] Session ended successfully\n'));
        
        process.exit(0);
    });
}

/**
 * List available network interfaces
 */
async function listInterfaces() {
    displayBanner();
    
    console.log(chalk.cyan.bold('Available Network Interfaces\n'));
    
    try {
        const interfaces = await CaptureManager.listInterfaces();
        
        console.log(chalk.gray('─'.repeat(70)));
        interfaces.forEach(iface => {
            console.log(`  ${chalk.cyan(iface.id.padEnd(3))} ${chalk.white('|')} ${chalk.green(iface.description || iface.name)}`);
        });
        console.log(chalk.gray('─'.repeat(70)));
        
        console.log(chalk.yellow('\nUsage: ') + chalk.white('snifferx monitor -i <interface-id>'));
        console.log(chalk.gray('   Example: ') + chalk.cyan('snifferx monitor -i 7\n'));
        
    } catch (error) {
        console.log(chalk.red('[!] Failed to list interfaces: ' + error.message + '\n'));
        process.exit(1);
    }
}

/**
 * Display configuration
 */
function showConfig() {
    displayBanner();
    
    console.log(chalk.cyan.bold('Detection Configuration\n'));
    
    console.log(chalk.bold('DDoS Detection:'));
    console.log(`  Threshold:     ${chalk.cyan(config.detection.ddos.packetsPerSecondThreshold)} pps`);
    console.log(`  Time Window:   ${chalk.cyan(config.detection.ddos.timeWindow)}s`);
    console.log(`  Status:        ${config.detection.ddos.enabled ? chalk.green('[+] Enabled') : chalk.red('[-] Disabled')}`);
    
    console.log(chalk.bold('\nPort Scan Detection:'));
    console.log(`  Threshold:     ${chalk.cyan(config.detection.portScanning.distinctPortsThreshold)} ports`);
    console.log(`  Time Window:   ${chalk.cyan(config.detection.portScanning.timeWindow)}s`);
    console.log(`  Status:        ${config.detection.portScanning.enabled ? chalk.green('[+] Enabled') : chalk.red('[-] Disabled')}`);
    
    console.log(chalk.bold('\nIP Spoofing Detection:'));
    console.log(`  TTL Threshold: ${chalk.cyan(config.detection.ipSpoofing.ttlVarianceThreshold)} hops`);
    console.log(`  TTL Check:     ${config.detection.ipSpoofing.checkTTL ? chalk.green('[+] Enabled') : chalk.red('[-] Disabled')}`);
    console.log(`  Status:        ${config.detection.ipSpoofing.enabled ? chalk.green('[+] Enabled') : chalk.red('[-] Disabled')}`);
    
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
    .option('-q, --quiet', 'Reduce output verbosity')
    .option('--no-audio', 'Disable audio alerts')
    .action(async (options) => {
        if (!options.interface) {
            displayBanner();
            console.log(chalk.red('[!] Error: Network interface not specified\n'));
            console.log(chalk.white.bold('How to fix:\n'));
            console.log(chalk.white('  1. Run ') + chalk.cyan('snifferx interfaces') + chalk.white(' to see available interfaces'));
            console.log(chalk.white('  2. Then run ') + chalk.cyan('snifferx monitor -i <id>') + chalk.white(' with your interface ID\n'));
            console.log(chalk.yellow('Quick start: ') + chalk.cyan('snifferx auto') + chalk.white(' to auto-detect your interface\n'));
            process.exit(1);
        }
        
        // Disable audio if --no-audio flag is used
        if (options.audio === false) {
            config.audio.enabled = false;
        }
        
        startMonitoring(options.interface, options);
    });

// Interfaces command
program
    .command('interfaces')
    .alias('list')
    .alias('ls')
    .description('List all available network interfaces on your computer')
    .action(listInterfaces);

// Config command
program
    .command('config')
    .alias('settings')
    .description('Display current threat detection configuration')
    .action(showConfig);

// Export history command
program
    .command('exports')
    .alias('history')
    .description('View exported session history and threat reports')
    .action(() => {
        displayBanner();
        console.log(chalk.cyan.bold('Exported Session History\n'));
        
        const fs = require('fs');
        const path = require('path');
        const exportDir = path.join(__dirname, 'exports');
        
        try {
            if (!fs.existsSync(exportDir)) {
                console.log(chalk.yellow('No exported sessions found.\n'));
                console.log(chalk.gray('Sessions are automatically exported when you stop monitoring.\n'));
                return;
            }
            
            const files = fs.readdirSync(exportDir)
                .filter(f => f.endsWith('.json'))
                .sort()
                .reverse();
            
            if (files.length === 0) {
                console.log(chalk.yellow('No exported sessions found.\n'));
                return;
            }
            
            console.log(chalk.gray('─'.repeat(70)));
            files.slice(0, 10).forEach((file, index) => {
                const filePath = path.join(exportDir, file);
                const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                const stats = fs.statSync(filePath);
                
                console.log(chalk.cyan(`\n${index + 1}. ${file}`));
                console.log(chalk.gray('   Date: ') + chalk.white(new Date(data.session.startTime).toLocaleString()));
                console.log(chalk.gray('   Duration: ') + chalk.white(data.session.duration));
                console.log(chalk.gray('   Packets: ') + chalk.white(data.statistics.totalPackets.toLocaleString()));
                console.log(chalk.gray('   Threats: ') + (data.statistics.totalAlerts > 0 ? chalk.red(data.statistics.totalAlerts) : chalk.green('0')));
                console.log(chalk.gray('   Size: ') + chalk.white((stats.size / 1024).toFixed(2) + ' KB'));
            });
            console.log(chalk.gray('\n─'.repeat(70)));
            console.log(chalk.gray(`\nShowing ${Math.min(files.length, 10)} of ${files.length} sessions`));
            console.log(chalk.gray('Location: ') + chalk.cyan(exportDir) + '\n');
            
        } catch (error) {
            console.log(chalk.red('[!] Error reading exports: ' + error.message + '\n'));
        }
    });

program
    .command('test-audio')
    .alias('audio-test')
    .description('Test audio alert system - plays all threat sounds')
    .action(() => {
        displayBanner();
        console.log(chalk.cyan.bold('Audio Alert System Test\n'));
        
        const audioSystem = new AudioAlertSystem(config);
        
        console.log(chalk.yellow('Testing all audio patterns...\n'));
        
        // Test startup sound
        console.log(chalk.white('1. Startup Sound (Musical Chord)'));
        audioSystem.playStartupSound();
        
        setTimeout(() => {
            console.log(chalk.white('\n2. DDoS Alert (Rapid Beeps - High Severity)'));
            audioSystem.playAlert('ddos', 'high');
        }, 2000);
        
        setTimeout(() => {
            console.log(chalk.white('\n3. Port Scan Alert (Medium Beeps - Medium Severity)'));
            audioSystem.playAlert('port_scan', 'medium');
        }, 5000);
        
        setTimeout(() => {
            console.log(chalk.white('\n4. IP Spoofing Alert (Warbling Pattern - High Severity)'));
            audioSystem.playAlert('ip_spoofing', 'high');
        }, 8000);
        
        setTimeout(() => {
            console.log(chalk.white('\n5. User Behavior Alert (Soft Beeps - Low Severity)'));
            audioSystem.playAlert('user_behavior', 'low');
        }, 11000);
        
        setTimeout(() => {
            console.log(chalk.white('\n6. Emergency Alarm (Siren Pattern - Multiple Threats)'));
            audioSystem.playEmergencyAlarm();
        }, 14000);
        
        setTimeout(() => {
            console.log(chalk.white('\n7. Shutdown Sound (Descending Melody)'));
            audioSystem.playShutdownSound();
            
            console.log(chalk.green.bold('\n[+] Audio test complete!\n'));
            console.log(chalk.gray('If you heard all the sounds, the audio system is working correctly.'));
            console.log(chalk.gray('Note: Some systems may not support audio beeps.\n'));
        }, 17000);
    });

// Quick Start command (interactive mode)
program
    .command('start')
    .description('Quick start with guided setup (recommended for first-time users)')
    .action(async () => {
        displayBanner();
        console.log(chalk.cyan.bold('Quick Start - Guided Setup\n'));
        
        console.log(chalk.white('This wizard will help you get started with SnifferX.\n'));
        
        // Step 1: List interfaces
        console.log(chalk.cyan('Step 1: ') + chalk.white('Select your network interface\n'));
        
        try {
            const interfaces = await CaptureManager.listInterfaces();
            
            console.log(chalk.gray('─'.repeat(70)));
            interfaces.forEach(iface => {
                console.log(`  ${chalk.cyan(iface.id.padEnd(3))} ${chalk.white('|')} ${chalk.green(iface.description || iface.name)}`);
            });
            console.log(chalk.gray('─'.repeat(70)));
            
            console.log(chalk.yellow('\nTip: ') + chalk.white('Usually, interface ') + chalk.cyan('7') + chalk.white(' or ') + chalk.cyan('8') + chalk.white(' is your main network adapter'));
            console.log(chalk.white('\nTo start monitoring, run: ') + chalk.cyan('snifferx monitor -i <id>'));
            console.log(chalk.gray('Example: ') + chalk.cyan('snifferx monitor -i 7\n'));
            
        } catch (error) {
            console.log(chalk.red('[!] Error: ' + error.message + '\n'));
        }
    });

// Auto-detect and monitor
program
    .command('auto')
    .description('Automatically detect and monitor the primary network interface')
    .action(async () => {
        displayBanner();
        console.log(chalk.cyan.bold('Auto-detecting network interface...\n'));
        
        try {
            const interfaces = await CaptureManager.listInterfaces();
            
            // Try to find the most likely interface (usually the one with the highest ID or "Ethernet"/"Wi-Fi" in name)
            const primaryInterface = interfaces.find(i => 
                i.description?.toLowerCase().includes('ethernet') || 
                i.description?.toLowerCase().includes('wi-fi') ||
                i.description?.toLowerCase().includes('wireless')
            ) || interfaces[interfaces.length - 1];
            
            if (primaryInterface) {
                console.log(chalk.green('[+] Found interface: ') + chalk.cyan(primaryInterface.description || primaryInterface.name));
                console.log(chalk.white('  Interface ID: ') + chalk.cyan(primaryInterface.id) + '\n');
                
                console.log(chalk.yellow('Starting monitoring in 3 seconds... (Press Ctrl+C to cancel)\n'));
                
                setTimeout(() => {
                    startMonitoring(primaryInterface.id, {});
                }, 3000);
            } else {
                console.log(chalk.red('[!] No network interfaces found\n'));
                console.log(chalk.white('Please run: ') + chalk.cyan('snifferx interfaces') + chalk.white(' to see available interfaces\n'));
            }
        } catch (error) {
            console.log(chalk.red('[!] Error: ' + error.message + '\n'));
        }
    });

// Help command with examples
program
    .command('help')
    .description('Show detailed help with examples')
    .action(() => {
        displayBanner();
        console.log(chalk.cyan.bold('SnifferX Help & Examples\n'));
        
        console.log(chalk.white.bold('QUICK START:\n'));
        console.log(chalk.gray('  For first-time users:'));
        console.log(chalk.cyan('    snifferx start') + chalk.gray('           # Guided setup wizard'));
        console.log(chalk.cyan('    snifferx auto') + chalk.gray('            # Auto-detect and start\n'));
        
        console.log(chalk.white.bold('BASIC COMMANDS:\n'));
        console.log(chalk.cyan('    snifferx interfaces') + chalk.gray('    # List network adapters'));
        console.log(chalk.cyan('    snifferx monitor -i 7') + chalk.gray('   # Monitor interface 7'));
        console.log(chalk.cyan('    snifferx config') + chalk.gray('         # Show detection settings'));
        console.log(chalk.cyan('    snifferx test-audio') + chalk.gray('     # Test audio alerts\n'));
        
        console.log(chalk.white.bold('EXAMPLES:\n'));
        console.log(chalk.gray('  Monitor your Wi-Fi adapter:'));
        console.log(chalk.cyan('    snifferx monitor -i 7\n'));
        
        console.log(chalk.gray('  List all network interfaces:'));
        console.log(chalk.cyan('    snifferx interfaces\n'));
        
        console.log(chalk.gray('  Test if audio alerts work:'));
        console.log(chalk.cyan('    snifferx test-audio\n'));
        
        console.log(chalk.white.bold('NEED HELP?\n'));
        console.log(chalk.gray('  Documentation: ') + chalk.cyan('https://github.com/Vyomkhurana/SnifferX'));
        console.log(chalk.gray('  Issues: ') + chalk.cyan('https://github.com/Vyomkhurana/SnifferX/issues\n'));
    });

// Show friendly welcome if no command - Interactive Mode
if (process.argv.length === 2) {
    const readline = require('readline');
    
    displayBanner();
    console.log(chalk.cyan.bold('Welcome to SnifferX - Interactive Mode\n'));
    console.log(chalk.white('A professional network threat detection tool.\n'));
    
    console.log(chalk.white.bold('AVAILABLE COMMANDS:\n'));
    console.log(chalk.cyan('  start') + chalk.gray('           # Guided setup (recommended for beginners)'));
    console.log(chalk.cyan('  auto') + chalk.gray('            # Auto-detect and start monitoring'));
    console.log(chalk.cyan('  interfaces') + chalk.gray('    # List available network interfaces'));
    console.log(chalk.cyan('  config') + chalk.gray('         # Show detection configuration'));
    console.log(chalk.cyan('  exports') + chalk.gray('        # View exported session history'));
    console.log(chalk.cyan('  test-audio') + chalk.gray('     # Test audio alert system'));
    console.log(chalk.cyan('  help') + chalk.gray('           # Show detailed help'));
    console.log(chalk.cyan('  stats') + chalk.gray('          # Show quick statistics'));
    console.log(chalk.cyan('  clear') + chalk.gray('          # Clear screen'));
    console.log(chalk.cyan('  exit') + chalk.gray('           # Exit SnifferX'));
    console.log(chalk.gray('\n  Tip: Press Ctrl+C to exit at any time\n'));
    
    const commandHistory = [];
    let historyIndex = -1;
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: chalk.cyan('snifferx> '),
        historySize: 50
    });
    
    rl.prompt();
    
    rl.on('line', async (line) => {
        const input = line.trim();
        
        if (!input) {
            rl.prompt();
            return;
        }
        
        const args = ['node', 'snifferx'].concat(input.split(' '));
        
        const command = input.split(' ')[0];
        
        // Handle exit commands
        if (command === 'exit' || command === 'quit') {
            console.log(chalk.yellow('\nExiting SnifferX. Stay secure!\n'));
            rl.close();
            process.exit(0);
        }
        
        // Handle clear command
        if (command === 'clear' || command === 'cls') {
            displayBanner();
            rl.prompt();
            return;
        }
        
        // Handle stats command
        if (command === 'stats') {
            console.log(chalk.cyan.bold('\nQuick Statistics:\n'));
            console.log(chalk.white('  Version: ') + chalk.cyan(config.app.version));
            console.log(chalk.white('  Node: ') + chalk.cyan(process.version));
            console.log(chalk.white('  Platform: ') + chalk.cyan(process.platform));
            console.log(chalk.white('  Memory Usage: ') + chalk.cyan((process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + ' MB'));
            console.log(chalk.white('  Uptime: ') + chalk.cyan(formatUptime(process.uptime())));
            console.log('');
            rl.prompt();
            return;
        }
        
        // Handle version command
        if (command === 'version' || command === '-v' || command === '--version') {
            console.log(chalk.cyan('\nSnifferX v' + config.app.version + '\n'));
            rl.prompt();
            return;
        }
        
        // Execute command
        try {
            // Save the original argv
            const originalArgv = process.argv;
            
            // Set new argv for commander
            process.argv = args;
            
            // Create new program instance for this command
            const { Command } = require('commander');
            const subProgram = new Command();
            
            subProgram
                .name('snifferx')
                .exitOverride() // Prevent process.exit()
                .configureOutput({
                    writeOut: (str) => process.stdout.write(str),
                    writeErr: (str) => process.stderr.write(str)
                });
            
            // Copy all commands from main program
            subProgram
                .command('start')
                .description('Quick start with guided setup')
                .action(async () => {
                    rl.close();
                    await quickStart();
                });
            
            subProgram
                .command('auto')
                .description('Auto-detect interface and start monitoring')
                .action(async () => {
                    rl.close();
                    await autoDetectAndStart();
                });
            
            subProgram
                .command('interfaces')
                .description('List available network interfaces')
                .action(async () => {
                    await listInterfaces();
                    console.log('');
                    rl.prompt();
                });
            
            subProgram
                .command('config')
                .description('Display detection configuration')
                .action(() => {
                    showConfig();
                    rl.prompt();
                });
            
            subProgram
                .command('exports')
                .alias('history')
                .description('View exported session history')
                .action(() => {
                    // Inline exports display
                    displayBanner();
                    console.log(chalk.cyan.bold('Exported Session History\n'));
                    
                    const fs = require('fs');
                    const path = require('path');
                    const exportDir = path.join(__dirname, 'exports');
                    
                    try {
                        if (!fs.existsSync(exportDir)) {
                            console.log(chalk.yellow('No exported sessions found.\n'));
                            console.log(chalk.gray('Sessions are automatically exported when you stop monitoring.\n'));
                            rl.prompt();
                            return;
                        }
                        
                        const files = fs.readdirSync(exportDir)
                            .filter(f => f.endsWith('.json'))
                            .sort()
                            .reverse();
                        
                        if (files.length === 0) {
                            console.log(chalk.yellow('No exported sessions found.\n'));
                            rl.prompt();
                            return;
                        }
                        
                        console.log(chalk.gray('─'.repeat(70)));
                        files.slice(0, 10).forEach((file, index) => {
                            const filePath = path.join(exportDir, file);
                            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                            const stats = fs.statSync(filePath);
                            
                            console.log(chalk.cyan(`\n${index + 1}. ${file}`));
                            console.log(chalk.gray('   Date: ') + chalk.white(new Date(data.session.startTime).toLocaleString()));
                            console.log(chalk.gray('   Duration: ') + chalk.white(data.session.duration));
                            console.log(chalk.gray('   Packets: ') + chalk.white(data.statistics.totalPackets.toLocaleString()));
                            console.log(chalk.gray('   Threats: ') + (data.statistics.totalAlerts > 0 ? chalk.red(data.statistics.totalAlerts) : chalk.green('0')));
                            console.log(chalk.gray('   Size: ') + chalk.white((stats.size / 1024).toFixed(2) + ' KB'));
                        });
                        console.log(chalk.gray('\n─'.repeat(70)));
                        console.log(chalk.gray(`\nShowing ${Math.min(files.length, 10)} of ${files.length} sessions`));
                        console.log(chalk.gray('Location: ') + chalk.cyan(exportDir) + '\n');
                        
                    } catch (error) {
                        console.log(chalk.red('[!] Error reading exports: ' + error.message + '\n'));
                    }
                    rl.prompt();
                });
            
            subProgram
                .command('test-audio')
                .description('Test audio alert system')
                .action(() => {
                    displayBanner();
                    console.log(chalk.cyan.bold('Audio Alert System Test\n'));
                    
                    const audioSystem = new AudioAlertSystem(config);
                    
                    console.log(chalk.yellow('Testing all audio patterns...\n'));
                    
                    console.log(chalk.white('1. Startup Sound (Musical Chord)'));
                    audioSystem.playStartupSound();
                    
                    setTimeout(() => {
                        console.log(chalk.white('\n2. DDoS Alert (Rapid Beeps - High Severity)'));
                        audioSystem.playAlert('ddos', 'high');
                    }, 2000);
                    
                    setTimeout(() => {
                        console.log(chalk.white('\n3. Port Scan Alert (Medium Beeps - Medium Severity)'));
                        audioSystem.playAlert('port_scan', 'medium');
                    }, 5000);
                    
                    setTimeout(() => {
                        console.log(chalk.white('\n4. IP Spoofing Alert (Warbling Pattern - High Severity)'));
                        audioSystem.playAlert('ip_spoofing', 'high');
                    }, 8000);
                    
                    setTimeout(() => {
                        console.log(chalk.white('\n5. User Behavior Alert (Soft Beeps - Low Severity)'));
                        audioSystem.playAlert('user_behavior', 'low');
                    }, 11000);
                    
                    setTimeout(() => {
                        console.log(chalk.white('\n6. Emergency Alarm (Siren Pattern - Multiple Threats)'));
                        audioSystem.playEmergencyAlarm();
                    }, 14000);
                    
                    setTimeout(() => {
                        console.log(chalk.white('\n7. Shutdown Sound (Descending Melody)'));
                        audioSystem.playShutdownSound();
                        
                        console.log(chalk.green.bold('\n[+] Audio test complete!\n'));
                        console.log(chalk.gray('If you heard all the sounds, the audio system is working correctly.'));
                        console.log(chalk.gray('Note: Some systems may not support audio beeps.\n'));
                        rl.prompt();
                    }, 17000);
                });
            
            subProgram
                .command('help')
                .description('Show help')
                .action(() => {
                    showHelp();
                    rl.prompt();
                });
            
            await subProgram.parseAsync(args);
            
            // Restore original argv
            process.argv = originalArgv;
            
        } catch (error) {
            if (error.code === 'commander.unknownCommand') {
                console.log(chalk.red(`\n[!] Unknown command: ${command}`));
                console.log(chalk.white('Type ') + chalk.cyan('help') + chalk.white(' to see available commands\n'));
            } else if (error.code !== 'commander.help' && error.code !== 'commander.helpDisplayed') {
                console.log(chalk.red('\n[!] Error: ' + error.message + '\n'));
                
                // Suggest similar commands
                const availableCommands = ['start', 'auto', 'interfaces', 'config', 'exports', 'test-audio', 'help', 'stats', 'clear', 'exit'];
                const suggestions = availableCommands.filter(cmd => 
                    cmd.includes(command.toLowerCase()) || command.toLowerCase().includes(cmd)
                );
                
                if (suggestions.length > 0) {
                    console.log(chalk.yellow('Did you mean: ') + chalk.cyan(suggestions.join(', ')) + '?\n');
                }
            }
            rl.prompt();
        }
    });
    
    rl.on('close', () => {
        console.log(chalk.yellow('\nExiting SnifferX. Stay secure!\n'));
        process.exit(0);
    });
    
} else {
    // Parse arguments normally when commands are provided
    program.parse(process.argv);
}
