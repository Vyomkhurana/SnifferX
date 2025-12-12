#!/usr/bin/env node

/**
 * SnifferX - Network Traffic Analysis & Threat Detection Tool
 * Professional CLI for real-time network security monitoring
 * 
 * @author Vyom Khurana
 * @version 1.3.0
 * @license ISC
 */

// Dependency checks with graceful error handling
function checkDependencies() {
    const required = ['chalk', 'commander', 'fs-extra', 'pcap-parser', 'play-sound', 'simple-statistics'];
    const missing = [];
    
    for (const dep of required) {
        try {
            require.resolve(dep);
        } catch (e) {
            missing.push(dep);
        }
    }
    
    if (missing.length > 0) {
        console.error('\x1b[31m✗ Missing dependencies:\x1b[0m', missing.join(', '));
        console.error('\x1b[33m→ Run: npm install\x1b[0m');
        process.exit(1);
    }
}

checkDependencies();

const chalk = require('chalk');
const { Command } = require('commander');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// Load configuration and modules with error handling
let config, CaptureManager, DDoSDetector, PortScanDetector, IPSpoofingDetector, 
    UserBehaviorAnalytics, AudioAlertSystem, BackendIntegration, utils;

try {
    config = require('./config');
    CaptureManager = require('./src/capture/captureManager');
    DDoSDetector = require('./src/detection/ddosDetector');
    PortScanDetector = require('./src/detection/portScanDetector');
    IPSpoofingDetector = require('./src/detection/ipSpoofingDetector');
    UserBehaviorAnalytics = require('./src/detection/userBehaviorAnalytics');
    AudioAlertSystem = require('./src/audio/audioAlertSystem');
    BackendIntegration = require('./src/integrations/backendIntegration');
    utils = require('./utils');
} catch (error) {
    console.error(chalk.red('✗ Failed to load modules:'), error.message);
    console.error(chalk.yellow('→ Ensure all files are present and properly configured'));
    process.exit(1);
}

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

// Utility: Loading spinner for async operations
function showSpinner(message, duration = 2000) {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let i = 0;
    const interval = setInterval(() => {
        process.stdout.write(`\r${chalk.cyan(frames[i % frames.length])} ${chalk.white(message)}`);
        i++;
    }, 80);
    
    return () => {
        clearInterval(interval);
        process.stdout.write('\r' + ' '.repeat(message.length + 3) + '\r');
    };
}

// Utility: Success/error message helpers
function showSuccess(message) {
    console.log(chalk.green('✓') + ' ' + chalk.white(message));
}

function showError(message, details = '') {
    console.log(chalk.red('✗') + ' ' + chalk.white(message));
    if (details) {
        console.log(chalk.gray('  └─ ') + chalk.yellow(details));
    }
}

function showInfo(message) {
    console.log(chalk.blue('ℹ') + ' ' + chalk.white(message));
}

function showWarning(message) {
    console.log(chalk.yellow('⚠') + ' ' + chalk.white(message));
}

// Utility: Loading spinner for async operations
function showSpinner(message, duration = 2000) {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let i = 0;
    const interval = setInterval(() => {
        process.stdout.write(`\r${chalk.cyan(frames[i % frames.length])} ${chalk.white(message)}`);
        i++;
    }, 80);
    
    return () => {
        clearInterval(interval);
        process.stdout.write('\r' + ' '.repeat(message.length + 3) + '\r');
    };
}

// Utility: Progress bar for visual feedback
function showProgress(current, total, label = 'Progress') {
    const percentage = Math.floor((current / total) * 100);
    const filled = Math.floor(percentage / 2);
    const empty = 50 - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    
    process.stdout.write(`\r${chalk.cyan(label)}: [${chalk.green(bar)}] ${chalk.white(percentage + '%')}`);
    
    if (current === total) {
        console.log(); // New line when complete
    }
}

// Enhanced ASCII Art Banner with gradient effect
const displayBanner = () => {
    console.clear();
    const bannerLines = [
        '    ███████╗███╗   ██╗██╗███████╗███████╗███████╗██████╗ ██╗  ██╗',
        '    ██╔════╝████╗  ██║██║██╔════╝██╔════╝██╔════╝██╔══██╗╚██╗██╔╝',
        '    ███████╗██╔██╗ ██║██║█████╗  █████╗  █████╗  ██████╔╝ ╚███╔╝ ',
        '    ╚════██║██║╚██╗██║██║██╔══╝  ██╔══╝  ██╔══╝  ██╔══██╗ ██╔██╗ ',
        '    ███████║██║ ╚████║██║██║     ██║     ███████╗██║  ██║██╔╝ ██╗',
        '    ╚══════╝╚═╝  ╚═══╝╚═╝╚═╝     ╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝'
    ];
    const gradient = ['#6dd5ed', '#2193b0', '#0f7fd6', '#155799'];
    bannerLines.forEach((line, idx) => {
        const color = chalk.hex(gradient[idx % gradient.length]);
        console.log(color.bold(line));
    });
    console.log(chalk.gray('    ╔' + '═'.repeat(63) + '╗'));
    console.log(chalk.white.bold(`    ║  Network Threat Detection & Analysis ${chalk.cyan('v' + config.app.version.padEnd(4))}           ║`));
    console.log(chalk.gray('    ╠' + '═'.repeat(63) + '╣'));
    const metaRows = [
        { label: 'Author', value: config.app.author },
        { label: 'GitHub', value: config.app.github },
        { label: 'Platform', value: process.platform.toUpperCase() },
        { label: 'Interactive', value: 'node snifferx.js' }
    ];
    metaRows.forEach(row => {
        const label = chalk.white(row.label + ':').padEnd(14);
        const value = chalk.cyan(row.value.padEnd(44));
        console.log(chalk.gray(`    ║  ${label} ${value} ║`));
    });
    console.log(chalk.gray('    ╚' + '═'.repeat(63) + '╝'));
    console.log(chalk.gray('       Tip: Run "stats" anytime in interactive mode for quick health info\n'));
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
    console.log('\n' + chalk.bold.cyan('╔═══════════════════════════════════════════════════════════╗'));
    console.log(chalk.bold.cyan('║              LIVE MONITORING DASHBOARD                    ║'));
    console.log(chalk.bold.cyan('╚═══════════════════════════════════════════════════════════╝\n'));
    
    // System Status with enhanced visuals
    console.log(chalk.bgGreen.black.bold(' SYSTEM STATUS ') + chalk.green(' ▼'));
    console.log(chalk.gray('───────────────────────────────────────────────────────────'));
    console.log(`  ${chalk.white.bold('Total Packets:')}  ${chalk.cyan.bold(stats.totalPackets.toLocaleString())}`);
    console.log(`  ${chalk.white.bold('Packet Rate:')}   ${chalk.cyan.bold(pps)} ${chalk.gray('packets/sec')}`);
    console.log(`  ${chalk.white.bold('Uptime:')}        ${chalk.cyan.bold(formatUptime(uptime))}`);
    console.log(`  ${chalk.white.bold('Status:')}        ${chalk.green.bold('● ACTIVE')}`);
    
    // Threat Alerts with severity indicators
    const totalAlerts = stats.alerts.ddos + stats.alerts.portScan + stats.alerts.ipSpoofing + stats.alerts.userBehavior;
    const statusColor = totalAlerts === 0 ? chalk.bgGreen : totalAlerts < 5 ? chalk.bgYellow : chalk.bgRed;
    console.log('\n' + statusColor.black.bold(' THREAT DETECTION ') + (totalAlerts === 0 ? chalk.green(' ▼') : chalk.red(' ▼')));
    console.log(chalk.gray('───────────────────────────────────────────────────────────'));
    console.log(`  ${chalk.white.bold('Total Alerts:')}   ${totalAlerts > 0 ? chalk.red.bold(totalAlerts) : chalk.green.bold('0 - All Clear')}`);
    console.log(`  ${chalk.white.bold('DDoS Attacks:')}   ${stats.alerts.ddos > 0 ? chalk.red.bold('● ' + stats.alerts.ddos) : chalk.gray('○ 0')}`);
    console.log(`  ${chalk.white.bold('Port Scans:')}     ${stats.alerts.portScan > 0 ? chalk.red.bold('● ' + stats.alerts.portScan) : chalk.gray('○ 0')}`);
    console.log(`  ${chalk.white.bold('IP Spoofing:')}    ${stats.alerts.ipSpoofing > 0 ? chalk.red.bold('● ' + stats.alerts.ipSpoofing) : chalk.gray('○ 0')}`);
    console.log(`  ${chalk.white.bold('User Anomalies:')} ${stats.alerts.userBehavior > 0 ? chalk.red.bold('● ' + stats.alerts.userBehavior) : chalk.gray('○ 0')}`);
    
    // Protocol Distribution
    const protocols = Object.entries(stats.protocols)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    if (protocols.length > 0) {
        console.log('\n' + chalk.bgBlue.black.bold(' PROTOCOL DISTRIBUTION ') + chalk.blue(' ▼'));
        console.log(chalk.gray('───────────────────────────────────────────────────────────'));
        protocols.forEach(([proto, count]) => {
            const percentage = ((count / stats.totalPackets) * 100).toFixed(1);
            const barLength = Math.floor(percentage / 2);
            const bar = '█'.repeat(barLength) + '░'.repeat(25 - barLength);
            console.log(`  ${chalk.white.bold(proto.padEnd(8))} ${chalk.cyan(bar)} ${chalk.yellow(percentage + '%')}`);
        });
    }
    
    // Top Talkers with enhanced display
    const talkers = Object.entries(stats.topTalkers)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    if (talkers.length > 0) {
        console.log('\n' + chalk.bgMagenta.black.bold(' TOP SOURCE IPs ') + chalk.magenta(' ▼'));
        console.log(chalk.gray('───────────────────────────────────────────────────────────'));
        talkers.forEach(([ip, count], index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : ' ';
            console.log(`  ${chalk.yellow.bold(`#${index + 1}`)} ${chalk.cyan.bold(ip.padEnd(15))} ${chalk.gray('→')} ${chalk.white.bold(count.toLocaleString())} ${chalk.gray('packets')}`);
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
    
    // Backend Integration Status
    if (global.backendIntegration && config.backend && config.backend.enabled) {
        try {
            const backendStats = global.backendIntegration.getStats();
            console.log('\n' + chalk.bgCyan.black.bold(' BACKEND INTEGRATION ') + chalk.cyan(' ▼'));
            console.log(chalk.gray('───────────────────────────────────────────────────────────'));
            console.log(`  ${chalk.white.bold('Status:')}         ${chalk.green.bold('● CONNECTED')}`);
            console.log(`  ${chalk.white.bold('Alerts Sent:')}    ${chalk.cyan.bold(backendStats.sent)}`);
            console.log(`  ${chalk.white.bold('Failed:')}         ${chalk.yellow.bold(backendStats.failed)}`);
            console.log(`  ${chalk.white.bold('Queued:')}         ${chalk.gray.bold(backendStats.queued)}`);
            console.log(`  ${chalk.white.bold('Success Rate:')}   ${chalk.green.bold(backendStats.successRate)}`);
        } catch (error) {
            console.log('\n' + chalk.bgRed.black.bold(' BACKEND INTEGRATION ') + chalk.red(' ▼'));
            console.log(chalk.gray('───────────────────────────────────────────────────────────'));
            console.log(`  ${chalk.white.bold('Status:')}         ${chalk.red.bold('● ERROR')}`);
            console.log(`  ${chalk.gray('Error: ' + error.message)}`);
        }
    }
    
    console.log(chalk.gray('\n╔═══════════════════════════════════════════════════════════╗'));
    console.log(chalk.gray('║ ') + chalk.yellow.bold('Press Ctrl+C to stop monitoring') + chalk.gray('                        ║'));
    console.log(chalk.gray('╚═══════════════════════════════════════════════════════════╝\n'));
}

/**
 * Environment diagnostics (doctor) command
 */
async function runDiagnostics() {
    displayBanner();
    console.log(chalk.cyan.bold('SnifferX Diagnostics\n'));
    console.log(chalk.white('Checking your environment to ensure SnifferX can capture packets reliably.\n'));

    const results = [];
    const record = (label, status, message) => results.push({ label, status, message });

    // Node.js version check
    const nodeMajor = parseInt(process.versions.node.split('.')[0], 10);
    record('Node.js Version', nodeMajor >= 18 ? 'pass' : 'warn', `Detected ${process.version}, recommended >= 18.x`);

    // Privilege check
    if (process.platform === 'win32') {
        record('Administrator Rights', 'warn', 'Run PowerShell as Administrator for full packet capture access');
    } else {
        const isRoot = typeof process.getuid === 'function' && process.getuid() === 0;
        record('Root Privileges', isRoot ? 'pass' : 'warn', isRoot ? 'Running as root user' : 'Use sudo for reliable capture access');
    }

    // TShark availability
    const tsharkResult = spawnSync('tshark', ['-v'], { shell: true, encoding: 'utf8' });
    const tsharkAvailable = tsharkResult.status === 0;
    record(
        'TShark Installation',
        tsharkAvailable ? 'pass' : 'fail',
        tsharkAvailable
            ? (tsharkResult.stdout.split('\n')[0] || tsharkResult.stderr.split('\n')[0] || 'tshark detected in PATH')
            : 'TShark not found. Install Wireshark/TShark and ensure it is in your PATH'
    );

    // Export directory check
    const exportDir = path.join(__dirname, 'exports');
    try {
        if (!fs.existsSync(exportDir)) {
            fs.mkdirSync(exportDir, { recursive: true });
        }
        fs.accessSync(exportDir, fs.constants.W_OK);
        record('Export Directory', 'pass', `Writable: ${exportDir}`);
    } catch (error) {
        record('Export Directory', 'fail', `Cannot write to ${exportDir}: ${error.message}`);
    }

    // Audio support hint
    const audioHint = process.platform === 'darwin'
        ? 'macOS detected: using afplay for alerts'
        : process.platform === 'win32'
            ? 'Windows detected: PowerShell beep API will be used'
            : 'Linux detected: ensure "beep" package is installed for audio alerts';
    record('Audio Alerts', 'pass', audioHint);

    const icon = {
        pass: chalk.green('[OK]'),
        warn: chalk.yellow('[WARN]'),
        fail: chalk.red('[FAIL]')
    };

    results.forEach(item => {
        console.log(`${icon[item.status]} ${chalk.white(item.label)} ${chalk.gray('→')} ${chalk.white(item.message)}`);
    });

    const failures = results.filter(r => r.status === 'fail');
    const warnings = results.filter(r => r.status === 'warn');

    console.log('\n' + chalk.gray('Summary:'));
    console.log(chalk.white(`  ${chalk.green(results.length - warnings.length - failures.length)} ok, ${chalk.yellow(warnings.length)} warnings, ${chalk.red(failures.length)} failures`));

    if (failures.length === 0) {
        console.log(chalk.green('\nEnvironment looks good! You are ready to capture traffic.'));
    } else {
        console.log(chalk.yellow('\nResolve the above issues before running SnifferX for the best experience.'));
    }

    console.log();
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
        
        // Send to backend
        if (global.backendIntegration) {
            global.backendIntegration.sendThreatEvent({
                type: 'ddos',
                severity: ddosAlert.severity,
                source: packet.srcIP || 'Unknown',
                details: ddosAlert.message,
                confidence: 'high',
                packetsPerSecond: ddosAlert.packetsPerSecond
            });
        }
        
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
        
        // Send to backend
        if (global.backendIntegration) {
            global.backendIntegration.sendThreatEvent({
                type: 'port_scan',
                severity: portScanAlert.severity,
                source: packet.srcIP || 'Unknown',
                details: portScanAlert.message,
                confidence: 'medium',
                portsScanned: portScanAlert.portsScanned
            });
        }
        
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
        
        // Send to backend
        if (global.backendIntegration) {
            global.backendIntegration.sendThreatEvent({
                type: 'ip_spoofing',
                severity: spoofingAlert.severity,
                source: packet.srcIP || 'Unknown',
                details: spoofingAlert.message,
                confidence: 'high'
            });
        }
        
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
        
        // Send to backend
        if (global.backendIntegration) {
            global.backendIntegration.sendThreatEvent({
                type: 'user_behavior',
                severity: userBehaviorAlert.severity,
                source: userBehaviorAlert.user || 'Unknown',
                details: userBehaviorAlert.message,
                confidence: 'medium',
                riskScore: userBehaviorAlert.riskScore
            });
        }
        
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
    console.log(chalk.gray('Backend Integration: ') + (config.backend.enabled ? chalk.green('Enabled') : chalk.gray('Disabled')));
    console.log();
    
    // Initialize Audio Alert System (UNIQUE FEATURE!)
    global.audioSystem = new AudioAlertSystem(config);
    if (config.audio && config.audio.playOnStartup) {
        global.audioSystem.playStartupSound();
    }
    
    // Initialize Backend Integration
    try {
        global.backendIntegration = new BackendIntegration(config);
        
        if (config.backend && config.backend.enabled) {
            console.log(chalk.cyan('[Backend] Testing connection...'));
            const testResult = await global.backendIntegration.testConnection();
            if (testResult.success) {
                console.log(chalk.green('[Backend] ✓ Connected successfully\n'));
            } else {
                console.log(chalk.yellow(`[Backend] ⚠ ${testResult.message}\n`));
            }
        }
    } catch (error) {
        console.log(chalk.red(`[Backend] Failed to initialize: ${error.message}`));
        console.log(chalk.gray('[Backend] Continuing without backend integration\n'));
        global.backendIntegration = null;
    }
    
    console.log(chalk.cyan.bold('\n⚡ Initializing Detection Engines...\n'));
    
    const engines = [
        { name: 'DDoS Attack Detection', icon: '🛡️' },
        { name: 'Port Scan Detection', icon: '🔍' },
        { name: 'IP Spoofing Detection', icon: '🎭' },
        { name: 'User Behavior Analytics', icon: '👤' }
    ];
    
    // Initialize with progress
    engines.forEach((engine, index) => {
        setTimeout(() => {
            console.log(chalk.green('  ✓') + ` ${engine.icon}  ${chalk.white(engine.name)}`);
        }, index * 200);
    });
    
    await new Promise(resolve => setTimeout(resolve, engines.length * 200 + 300));
    
    // Initialize detectors
    const detectors = {
        ddos: new DDoSDetector(config),
        portScan: new PortScanDetector(config),
        ipSpoofing: new IPSpoofingDetector(config),
        userBehavior: new UserBehaviorAnalytics(config)
    };
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
        
        // Final report with enhanced visuals
        console.log(chalk.bgCyan.black.bold('\n' + ' '.repeat(67)));
        console.log(chalk.bgCyan.black.bold('                     📊 FINAL SESSION REPORT                        '));
        console.log(chalk.bgCyan.black.bold(' '.repeat(67) + '\n'));
        
        const totalAlerts = stats.alerts.ddos + stats.alerts.portScan + stats.alerts.ipSpoofing + stats.alerts.userBehavior;
        const sessionStatus = totalAlerts === 0 ? chalk.green.bold('✓ CLEAN SESSION') : totalAlerts < 5 ? chalk.yellow.bold('⚠ MINOR THREATS') : chalk.red.bold('⚠ THREATS DETECTED');
        
        console.log(chalk.white.bold('  Session Summary'));
        console.log(chalk.gray('  ├─ ') + chalk.white('Duration:       ') + chalk.cyan.bold(captureStats.duration));
        console.log(chalk.gray('  ├─ ') + chalk.white('Total Packets:  ') + chalk.cyan.bold(captureStats.totalPackets.toLocaleString()));
        console.log(chalk.gray('  ├─ ') + chalk.white('Average Rate:   ') + chalk.cyan.bold(captureStats.packetsPerSecond + ' pps'));
        console.log(chalk.gray('  └─ ') + chalk.white('Status:         ') + sessionStatus);
        
        console.log(chalk.white.bold('\n  Threat Analysis'));
        console.log(chalk.gray('  ├─ ') + chalk.white('Total Alerts:   ') + (totalAlerts > 0 ? chalk.red.bold(totalAlerts) : chalk.green.bold('0 - All Clear')));
        console.log(chalk.gray('  ├─ ') + chalk.white('DDoS Attacks:   ') + (stats.alerts.ddos > 0 ? chalk.red.bold('● ' + stats.alerts.ddos) : chalk.gray('○ 0')));
        console.log(chalk.gray('  ├─ ') + chalk.white('Port Scans:     ') + (stats.alerts.portScan > 0 ? chalk.yellow.bold('● ' + stats.alerts.portScan) : chalk.gray('○ 0')));
        console.log(chalk.gray('  ├─ ') + chalk.white('IP Spoofing:    ') + (stats.alerts.ipSpoofing > 0 ? chalk.magenta.bold('● ' + stats.alerts.ipSpoofing) : chalk.gray('○ 0')));
        console.log(chalk.gray('  └─ ') + chalk.white('User Anomalies: ') + (stats.alerts.userBehavior > 0 ? chalk.cyan.bold('● ' + stats.alerts.userBehavior) : chalk.gray('○ 0')));
        
        console.log(chalk.gray('\n' + '─'.repeat(70)));
        
        // Export session data
        try {
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
    
    const stopSpinner = showSpinner('Scanning network interfaces...');
    
    try {
        const interfaces = await CaptureManager.listInterfaces();
        stopSpinner();
        
        console.log(chalk.cyan.bold('\n╔══════════════════════════════════════════════════════════════════╗'));
        console.log(chalk.cyan.bold('║            Available Network Interfaces                          ║'));
        console.log(chalk.cyan.bold('╚══════════════════════════════════════════════════════════════════╝\n'));
        
        interfaces.forEach((iface, index) => {
            const isEthernet = iface.description?.toLowerCase().includes('ethernet') || 
                              iface.description?.toLowerCase().includes('wi-fi');
            const icon = isEthernet ? '🌐' : '🔌';
            const color = isEthernet ? chalk.green : chalk.gray;
            
            console.log(`  ${chalk.cyan.bold(iface.id.toString().padStart(2))}  ${icon}  ${color(iface.description || iface.name)}`);
        });
        
        console.log(chalk.gray('\n' + '─'.repeat(70)));
        console.log(chalk.white('\n  Quick Start:'));
        console.log(chalk.cyan('    snifferx monitor -i <id>') + chalk.gray('  →  Start monitoring a specific interface'));
        console.log(chalk.cyan('    snifferx auto') + chalk.gray('              →  Auto-detect and start immediately'));
        console.log(chalk.gray('\n  Example: ') + chalk.green('snifferx monitor -i 7') + chalk.gray(' (monitors interface 7)\n'));
        
    } catch (error) {
        stopSpinner();
        console.log(chalk.red.bold('\n✗ Error: ') + chalk.white('Failed to list interfaces'));
        console.log(chalk.gray('  Reason: ') + chalk.yellow(error.message));
        console.log(chalk.gray('\n  Troubleshooting:'));
        console.log(chalk.white('    1. Run ') + chalk.cyan('snifferx doctor') + chalk.white(' to check your setup'));
        console.log(chalk.white('    2. Ensure TShark/Wireshark is installed'));
        console.log(chalk.white('    3. Run with administrator/root privileges\n'));
        process.exit(1);
    }
}

/**
 * Display configuration
 */
function showConfig() {
    displayBanner();
    
    console.log(chalk.cyan.bold('╔════════════════════════════════════════════════════════════════╗'));
    console.log(chalk.cyan.bold('║              Detection Configuration                           ║'));
    console.log(chalk.cyan.bold('╚════════════════════════════════════════════════════════════════╝\n'));
    
    const detectionEngines = [
        {
            name: '🛡️  DDoS Attack Detection',
            config: config.detection.ddos,
            settings: [
                { label: 'Threshold', value: config.detection.ddos.packetsPerSecondThreshold + ' pps' },
                { label: 'Time Window', value: config.detection.ddos.timeWindow + 's' },
            ]
        },
        {
            name: '🔍 Port Scan Detection',
            config: config.detection.portScanning,
            settings: [
                { label: 'Threshold', value: config.detection.portScanning.distinctPortsThreshold + ' ports' },
                { label: 'Time Window', value: config.detection.portScanning.timeWindow + 's' },
            ]
        },
        {
            name: '🎭 IP Spoofing Detection',
            config: config.detection.ipSpoofing,
            settings: [
                { label: 'TTL Threshold', value: config.detection.ipSpoofing.ttlVarianceThreshold + ' hops' },
                { label: 'TTL Check', value: config.detection.ipSpoofing.checkTTL ? 'Enabled' : 'Disabled' },
            ]
        },
        {
            name: '👤 User Behavior Analytics',
            config: config.detection.userBehavior,
            settings: [
                { label: 'Learning Period', value: (config.detection.userBehavior.learningPeriod / 3600000) + ' hours' },
                { label: 'Risk Threshold', value: config.detection.userBehavior.riskScoreThreshold },
            ]
        }
    ];
    
    detectionEngines.forEach(engine => {
        const status = engine.config.enabled ? chalk.green.bold('✓ ACTIVE') : chalk.red('✗ DISABLED');
        console.log(chalk.white.bold(engine.name) + '  ' + status);
        console.log(chalk.gray('  ├─ ') + chalk.white(engine.settings[0].label.padEnd(15)) + chalk.cyan(engine.settings[0].value));
        engine.settings.slice(1).forEach((setting, index) => {
            const prefix = index === engine.settings.length - 2 ? '  └─ ' : '  ├─ ';
            console.log(chalk.gray(prefix) + chalk.white(setting.label.padEnd(15)) + chalk.cyan(setting.value));
        });
        console.log();
    });
    
    console.log(chalk.gray('─'.repeat(68)));
    console.log(chalk.yellow('\n  Audio Alerts: ') + (config.audio.enabled ? chalk.green('🔊 Enabled') : chalk.gray('🔇 Disabled')));
    console.log(chalk.white('  Test audio: ') + chalk.cyan('snifferx test-audio\n'));
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

program
    .command('test-backend')
    .alias('backend-test')
    .description('Test backend integration connectivity')
    .action(async () => {
        displayBanner();
        console.log(chalk.cyan.bold('Backend Integration Test\n'));
        
        if (!config.backend.enabled) {
            console.log(chalk.yellow('[!] Backend integration is disabled in config.js\n'));
            console.log(chalk.gray('To enable it, update your config.js:\n'));
            console.log(chalk.white('  backend: {'));
            console.log(chalk.white('    enabled: true,'));
            console.log(chalk.white('    apiKey: "your-api-key",'));
            console.log(chalk.white('    endpoints: {'));
            console.log(chalk.white('      alerts: "https://your-backend.com/api/alerts"'));
            console.log(chalk.white('    }'));
            console.log(chalk.white('  }\n'));
            return;
        }
        
        const backend = new BackendIntegration(config);
        
        console.log(chalk.white('Testing connection to backend...\n'));
        console.log(chalk.gray('Configuration:'));
        console.log(chalk.gray('  Alerts Endpoint:  ') + chalk.cyan(config.backend.endpoints.alerts || 'Not configured'));
        console.log(chalk.gray('  Stats Endpoint:   ') + chalk.cyan(config.backend.endpoints.stats || 'Not configured'));
        console.log(chalk.gray('  Threats Endpoint: ') + chalk.cyan(config.backend.endpoints.threats || 'Not configured'));
        console.log(chalk.gray('  Stream Endpoint:  ') + chalk.cyan(config.backend.endpoints.stream || 'Not configured'));
        console.log();
        
        const stopSpinner = showSpinner('Connecting to backend...');
        const result = await backend.testConnection();
        stopSpinner();
        
        if (result.success) {
            console.log(chalk.green.bold('\n✓ Connection successful!\n'));
            console.log(chalk.white('Backend is reachable and ready to receive threat data.\n'));
        } else {
            console.log(chalk.red.bold('\n✗ Connection failed\n'));
            console.log(chalk.yellow('Error: ') + chalk.white(result.message + '\n'));
            console.log(chalk.gray('Troubleshooting:'));
            console.log(chalk.white('  1. Verify endpoint URLs are correct'));
            console.log(chalk.white('  2. Check your API key is valid'));
            console.log(chalk.white('  3. Ensure backend server is running'));
            console.log(chalk.white('  4. Verify network connectivity\n'));
        }
    });

program
    .command('doctor')
    .description('Run diagnostics to verify environment and dependencies')
    .action(runDiagnostics);

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
    console.log(chalk.cyan.bold('╔════════════════════════════════════════════════════════════════╗'));
    console.log(chalk.cyan.bold('║           Welcome to Interactive Mode - v' + config.app.version + '               ║'));
    console.log(chalk.cyan.bold('╚════════════════════════════════════════════════════════════════╝\n'));
    console.log(chalk.white('  Real-time network threat detection with audio alerts and analytics\n'));
    
    console.log(chalk.yellow.bold('  QUICK START:\n'));
    console.log(chalk.green('    start') + chalk.gray('     → Guided setup wizard (easiest way to begin)'));
    console.log(chalk.green('    auto') + chalk.gray('      → Auto-detect interface and start immediately\n'));
    
    console.log(chalk.white.bold('  ALL COMMANDS:\n'));
    console.log(chalk.cyan('    interfaces') + chalk.gray('  → List all network interfaces'));
    console.log(chalk.cyan('    config') + chalk.gray('      → Show detection configuration'));
    console.log(chalk.cyan('    exports') + chalk.gray('     → View session history and reports'));
    console.log(chalk.cyan('    test-audio') + chalk.gray('  → Test audio alert system'));
    console.log(chalk.cyan('    test-backend') + chalk.gray('→ Test backend integration'));
    console.log(chalk.cyan('    doctor') + chalk.gray('      → Run environment diagnostics'));
    console.log(chalk.cyan('    stats') + chalk.gray('       → Show system statistics'));
    console.log(chalk.cyan('    help') + chalk.gray('        → Detailed help with examples'));
    console.log(chalk.cyan('    clear') + chalk.gray('       → Clear screen'));
    console.log(chalk.cyan('    exit') + chalk.gray('        → Exit SnifferX'));
    console.log(chalk.gray('\n  Tips: Use Up/Down arrows for command history | Press Ctrl+C to exit\n'));
    
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
        
        // Handle doctor command
        if (command === 'doctor') {
            await runDiagnostics();
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
                .command('test-backend')
                .description('Test backend integration connectivity')
                .action(async () => {
                    displayBanner();
                    console.log(chalk.cyan.bold('Backend Integration Test\n'));
                    
                    if (!config.backend.enabled) {
                        console.log(chalk.yellow('[!] Backend integration is disabled in config.js\n'));
                        console.log(chalk.gray('To enable it, update your config.js:\n'));
                        console.log(chalk.white('  backend: {'));
                        console.log(chalk.white('    enabled: true,'));
                        console.log(chalk.white('    apiKey: "your-api-key",'));
                        console.log(chalk.white('    endpoints: {'));
                        console.log(chalk.white('      alerts: "https://your-backend.com/api/alerts"'));
                        console.log(chalk.white('    }'));
                        console.log(chalk.white('  }\n'));
                        rl.prompt();
                        return;
                    }
                    
                    const backend = new BackendIntegration(config);
                    
                    console.log(chalk.white('Testing connection to backend...\n'));
                    console.log(chalk.gray('Configuration:'));
                    console.log(chalk.gray('  Alerts Endpoint:  ') + chalk.cyan(config.backend.endpoints.alerts || 'Not configured'));
                    console.log(chalk.gray('  Stats Endpoint:   ') + chalk.cyan(config.backend.endpoints.stats || 'Not configured'));
                    console.log(chalk.gray('  Threats Endpoint: ') + chalk.cyan(config.backend.endpoints.threats || 'Not configured'));
                    console.log(chalk.gray('  Stream Endpoint:  ') + chalk.cyan(config.backend.endpoints.stream || 'Not configured'));
                    console.log();
                    
                    const stopSpinner = showSpinner('Connecting to backend...');
                    const result = await backend.testConnection();
                    stopSpinner();
                    
                    if (result.success) {
                        console.log(chalk.green.bold('\n✓ Connection successful!\n'));
                        console.log(chalk.white('Backend is reachable and ready to receive threat data.\n'));
                    } else {
                        console.log(chalk.red.bold('\n✗ Connection failed\n'));
                        console.log(chalk.yellow('Error: ') + chalk.white(result.message + '\n'));
                        console.log(chalk.gray('Troubleshooting:'));
                        console.log(chalk.white('  1. Verify endpoint URLs are correct'));
                        console.log(chalk.white('  2. Check your API key is valid'));
                        console.log(chalk.white('  3. Ensure backend server is running'));
                        console.log(chalk.white('  4. Verify network connectivity\n'));
                    }
                    rl.prompt();
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
                const availableCommands = ['start', 'auto', 'interfaces', 'config', 'exports', 'test-audio', 'test-backend', 'doctor', 'help', 'stats', 'clear', 'exit'];
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
