/**
 * Port Scan Detector
 * Detects port scanning attempts by monitoring connection patterns
 */

const utils = require('../../utils');
const chalk = require('chalk');

class PortScanDetector {
    constructor(config) {
        this.config = config.detection.portScanning;
        this.enabled = this.config.enabled;
        
        // Tracking data structures
        this.portsByIP = new Map();              // IP -> Set of ports accessed
        this.portTimestamps = new Map();         // IP -> [{port, timestamp}]
        this.synPacketsByIP = new Map();         // IP -> count of SYN packets
        this.alerts = [];                        // Alert history
        this.scanners = new Set();               // IPs flagged as scanners
        
        // Time window in milliseconds
        this.timeWindow = this.config.timeWindow * 1000;
        
        utils.log('info', '🔍 Port Scan Detector initialized');
    }

    /**
     * Analyze a packet for port scanning patterns
     * @param {Packet} packet - The packet to analyze
     * @returns {Object|null} Alert object if scan detected, null otherwise
     */
    analyze(packet) {
        if (!this.enabled) return null;

        const srcIP = packet.srcIP;
        if (!srcIP || srcIP === 'unknown' || srcIP === 'N/A') {
            return null;
        }

        // Only analyze TCP packets with destination ports
        if (!packet.isTCP() || !packet.dstPort) {
            return null;
        }

        const now = Date.now();

        // Initialize tracking for this IP if needed
        if (!this.portsByIP.has(srcIP)) {
            this.portsByIP.set(srcIP, new Set());
            this.portTimestamps.set(srcIP, []);
            this.synPacketsByIP.set(srcIP, 0);
        }

        // Track the port being accessed
        this.portsByIP.get(srcIP).add(packet.dstPort);

        // Track timestamp with port
        const timestamps = this.portTimestamps.get(srcIP);
        timestamps.push({ port: packet.dstPort, timestamp: now });

        // Remove old timestamps outside time window
        const cutoffTime = now - this.timeWindow;
        const recentActivity = timestamps.filter(item => item.timestamp >= cutoffTime);
        this.portTimestamps.set(srcIP, recentActivity);

        // Count SYN packets (connection attempts)
        if (packet.isSYN()) {
            this.synPacketsByIP.set(srcIP, this.synPacketsByIP.get(srcIP) + 1);
        }

        // Get unique ports accessed in time window
        const recentPorts = new Set(recentActivity.map(item => item.port));
        const portsPerMinute = (recentActivity.length / (this.timeWindow / 1000)) * 60;

        // Check for port scan patterns
        const alert = this.checkForPortScan(srcIP, recentPorts.size, portsPerMinute, packet.dstIP);
        
        if (alert) {
            this.scanners.add(srcIP);
            this.alerts.push(alert);
            return alert;
        }

        return null;
    }

    /**
     * Check if IP exhibits port scanning behavior
     * @param {string} srcIP - Source IP address
     * @param {number} distinctPorts - Number of distinct ports accessed
     * @param {number} portsPerMinute - Rate of port access
     * @param {string} targetIP - Target IP being scanned
     * @returns {Object|null} Alert object or null
     */
    checkForPortScan(srcIP, distinctPorts, portsPerMinute, targetIP) {
        const synCount = this.synPacketsByIP.get(srcIP) || 0;
        const totalPortsAccessed = this.portsByIP.get(srcIP).size;

        // Check ports per minute threshold
        if (portsPerMinute >= this.config.portsPerMinuteThreshold) {
            return {
                type: 'port_scan',
                severity: 'critical',
                timestamp: new Date(),
                srcIP: srcIP,
                targetIP: targetIP,
                reason: 'Rapid port scanning detected',
                details: {
                    portsPerMinute: Math.round(portsPerMinute * 100) / 100,
                    threshold: this.config.portsPerMinuteThreshold,
                    distinctPorts: distinctPorts,
                    synPackets: synCount,
                    totalPortsAccessed: totalPortsAccessed
                },
                message: `⚠️  CRITICAL: Fast port scan from ${chalk.red(srcIP)} → ${chalk.yellow(targetIP)} - ${Math.round(portsPerMinute)} ports/min (threshold: ${this.config.portsPerMinuteThreshold})`
            };
        }

        // Check distinct ports threshold
        if (distinctPorts >= this.config.distinctPortsThreshold) {
            return {
                type: 'port_scan',
                severity: 'high',
                timestamp: new Date(),
                srcIP: srcIP,
                targetIP: targetIP,
                reason: 'Multiple port access detected',
                details: {
                    distinctPorts: distinctPorts,
                    threshold: this.config.distinctPortsThreshold,
                    portsPerMinute: Math.round(portsPerMinute * 100) / 100,
                    synPackets: synCount,
                    totalPortsAccessed: totalPortsAccessed
                },
                message: `⚠️  HIGH: Port scan from ${chalk.yellow(srcIP)} → ${chalk.yellow(targetIP)} - ${distinctPorts} distinct ports accessed (threshold: ${this.config.distinctPortsThreshold})`
            };
        }

        // Check for sequential port scanning (common pattern)
        if (distinctPorts >= 10 && this.isSequentialScan(srcIP)) {
            return {
                type: 'port_scan',
                severity: 'medium',
                timestamp: new Date(),
                srcIP: srcIP,
                targetIP: targetIP,
                reason: 'Sequential port scanning pattern detected',
                details: {
                    distinctPorts: distinctPorts,
                    pattern: 'sequential',
                    synPackets: synCount
                },
                message: `⚠️  MEDIUM: Sequential port scan from ${chalk.cyan(srcIP)} → ${chalk.yellow(targetIP)} - ${distinctPorts} ports`
            };
        }

        return null;
    }

    /**
     * Check if ports are being scanned sequentially
     * @param {string} srcIP - Source IP address
     * @returns {boolean} True if sequential pattern detected
     */
    isSequentialScan(srcIP) {
        const ports = Array.from(this.portsByIP.get(srcIP)).sort((a, b) => a - b);
        
        if (ports.length < 5) return false;

        let sequentialCount = 0;
        for (let i = 1; i < ports.length; i++) {
            if (ports[i] - ports[i - 1] === 1) {
                sequentialCount++;
            }
        }

        // If more than 50% of ports are sequential, it's likely a scan
        return sequentialCount / ports.length > 0.5;
    }

    /**
     * Get statistics about detected scans
     * @returns {Object} Statistics object
     */
    getStatistics() {
        const scannersList = Array.from(this.scanners).map(ip => ({
            ip,
            portsAccessed: this.portsByIP.get(ip).size,
            synPackets: this.synPacketsByIP.get(ip) || 0,
            ports: Array.from(this.portsByIP.get(ip)).slice(0, 20) // First 20 ports
        }));

        return {
            totalAlertsGenerated: this.alerts.length,
            scannersDetected: this.scanners.size,
            uniqueIPsTracked: this.portsByIP.size,
            scanners: scannersList,
            recentAlerts: this.alerts.slice(-10),
            criticalAlerts: this.alerts.filter(a => a.severity === 'critical').length,
            highAlerts: this.alerts.filter(a => a.severity === 'high').length,
            mediumAlerts: this.alerts.filter(a => a.severity === 'medium').length
        };
    }

    /**
     * Reset all tracking data
     */
    reset() {
        this.portsByIP.clear();
        this.portTimestamps.clear();
        this.synPacketsByIP.clear();
        this.alerts = [];
        this.scanners.clear();
        utils.log('info', 'Port Scan Detector reset');
    }

    /**
     * Get list of detected scanners
     * @returns {Array} Array of scanner IP addresses
     */
    getScanners() {
        return Array.from(this.scanners);
    }

    /**
     * Check if an IP is flagged as a scanner
     * @param {string} ip - IP address to check
     * @returns {boolean} True if IP is a scanner
     */
    isScanner(ip) {
        return this.scanners.has(ip);
    }

    /**
     * Get ports accessed by a specific IP
     * @param {string} ip - IP address
     * @returns {Array} Array of port numbers
     */
    getPortsAccessedBy(ip) {
        if (!this.portsByIP.has(ip)) return [];
        return Array.from(this.portsByIP.get(ip));
    }

    /**
     * Display statistics to console
     */
    displayStats() {
        const stats = this.getStatistics();
        
        console.log(chalk.bold.yellow('\n🔍 Port Scan Detection Statistics:'));
        console.log(chalk.gray('─'.repeat(60)));
        console.log(`  Total Alerts: ${chalk.cyan(stats.totalAlertsGenerated)}`);
        console.log(`  Critical: ${chalk.red(stats.criticalAlerts)} | High: ${chalk.yellow(stats.highAlerts)} | Medium: ${chalk.cyan(stats.mediumAlerts)}`);
        console.log(`  Scanners Detected: ${chalk.red(stats.scannersDetected)}`);
        console.log(`  Unique IPs Tracked: ${chalk.cyan(stats.uniqueIPsTracked)}`);
        
        if (stats.scanners.length > 0) {
            console.log(chalk.bold('\n  Detected Scanners:'));
            stats.scanners.slice(0, 5).forEach((item, index) => {
                const portList = item.ports.slice(0, 10).join(', ');
                const moreText = item.ports.length > 10 ? `, +${item.ports.length - 10} more` : '';
                console.log(`  ${index + 1}. ${chalk.red(item.ip.padEnd(16))} - ${chalk.cyan(item.portsAccessed)} ports, ${chalk.cyan(item.synPackets)} SYN packets`);
                console.log(`     ${chalk.gray(`Ports: ${portList}${moreText}`)}`);
            });
        }
        console.log(chalk.gray('─'.repeat(60)));
    }
}

module.exports = PortScanDetector;
