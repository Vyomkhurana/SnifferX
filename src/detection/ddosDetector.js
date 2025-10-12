/**
 * DDoS Detector
 * Detects Distributed Denial of Service attacks by monitoring traffic patterns
 */

const utils = require('../../utils');
const chalk = require('chalk');

class DDoSDetector {
    constructor(config) {
        this.config = config.detection.ddos;
        this.enabled = this.config.enabled;
        
        // Tracking data structures
        this.packetsByIP = new Map();           // IP -> packet count
        this.connectionsByIP = new Map();       // IP -> connection count
        this.packetTimestamps = new Map();      // IP -> [timestamps]
        this.alerts = [];                       // Alert history
        this.suspiciousIPs = new Set();         // IPs flagged as suspicious
        
        // Time window in milliseconds
        this.timeWindow = this.config.timeWindow * 1000;
        
        utils.log('info', '🛡️  DDoS Detector initialized');
    }

    /**
     * Analyze a packet for DDoS patterns
     * @param {Packet} packet - The packet to analyze
     * @returns {Object|null} Alert object if threat detected, null otherwise
     */
    analyze(packet) {
        if (!this.enabled) return null;

        const srcIP = packet.srcIP;
        if (!srcIP || srcIP === 'unknown' || srcIP === 'N/A') {
            return null;
        }

        const now = Date.now();

        // Initialize tracking for this IP if needed
        if (!this.packetsByIP.has(srcIP)) {
            this.packetsByIP.set(srcIP, 0);
            this.connectionsByIP.set(srcIP, 0);
            this.packetTimestamps.set(srcIP, []);
        }

        // Increment packet count
        this.packetsByIP.set(srcIP, this.packetsByIP.get(srcIP) + 1);

        // Track timestamp
        const timestamps = this.packetTimestamps.get(srcIP);
        timestamps.push(now);

        // Remove old timestamps outside time window
        const cutoffTime = now - this.timeWindow;
        const recentTimestamps = timestamps.filter(ts => ts >= cutoffTime);
        this.packetTimestamps.set(srcIP, recentTimestamps);

        // Count connections (SYN packets indicate new connections)
        if (packet.isSYN()) {
            this.connectionsByIP.set(srcIP, this.connectionsByIP.get(srcIP) + 1);
        }

        // Check for DDoS patterns
        const alert = this.checkForDDoS(srcIP, recentTimestamps.length);
        
        if (alert) {
            this.suspiciousIPs.add(srcIP);
            this.alerts.push(alert);
            return alert;
        }

        return null;
    }

    /**
     * Check if IP exhibits DDoS behavior
     * @param {string} srcIP - Source IP address
     * @param {number} recentPacketCount - Packets in time window
     * @returns {Object|null} Alert object or null
     */
    checkForDDoS(srcIP, recentPacketCount) {
        const packetsPerSecond = recentPacketCount / (this.timeWindow / 1000);
        const connections = this.connectionsByIP.get(srcIP) || 0;

        // Check packets per second threshold
        if (packetsPerSecond >= this.config.packetsPerSecondThreshold) {
            return {
                type: 'ddos',
                severity: 'critical',
                timestamp: new Date(),
                srcIP: srcIP,
                reason: 'High packet rate detected',
                details: {
                    packetsPerSecond: Math.round(packetsPerSecond * 100) / 100,
                    threshold: this.config.packetsPerSecondThreshold,
                    totalPackets: this.packetsByIP.get(srcIP),
                    connections: connections
                },
                message: `⚠️  CRITICAL: DDoS attack detected from ${chalk.red(srcIP)} - ${Math.round(packetsPerSecond)} packets/sec (threshold: ${this.config.packetsPerSecondThreshold})`
            };
        }

        // Check connection threshold
        if (connections >= this.config.connectionThreshold) {
            return {
                type: 'ddos',
                severity: 'high',
                timestamp: new Date(),
                srcIP: srcIP,
                reason: 'Excessive connection attempts',
                details: {
                    connections: connections,
                    threshold: this.config.connectionThreshold,
                    packetsPerSecond: Math.round(packetsPerSecond * 100) / 100
                },
                message: `⚠️  HIGH: Potential SYN flood from ${chalk.yellow(srcIP)} - ${connections} connection attempts (threshold: ${this.config.connectionThreshold})`
            };
        }

        // Check source IP threshold (multiple connections from same IP)
        if (connections >= this.config.sourceIPThreshold) {
            return {
                type: 'ddos',
                severity: 'medium',
                timestamp: new Date(),
                srcIP: srcIP,
                reason: 'High connection count from single source',
                details: {
                    connections: connections,
                    threshold: this.config.sourceIPThreshold,
                    packetsPerSecond: Math.round(packetsPerSecond * 100) / 100
                },
                message: `⚠️  MEDIUM: Suspicious activity from ${chalk.cyan(srcIP)} - ${connections} connections`
            };
        }

        return null;
    }

    /**
     * Get statistics about detected threats
     * @returns {Object} Statistics object
     */
    getStatistics() {
        const topIPs = Array.from(this.packetsByIP.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([ip, count]) => ({
                ip,
                packets: count,
                connections: this.connectionsByIP.get(ip) || 0,
                suspicious: this.suspiciousIPs.has(ip)
            }));

        return {
            totalAlertsGenerated: this.alerts.length,
            suspiciousIPCount: this.suspiciousIPs.size,
            uniqueIPsTracked: this.packetsByIP.size,
            topTalkers: topIPs,
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
        this.packetsByIP.clear();
        this.connectionsByIP.clear();
        this.packetTimestamps.clear();
        this.alerts = [];
        this.suspiciousIPs.clear();
        utils.log('info', 'DDoS Detector reset');
    }

    /**
     * Get list of suspicious IPs
     * @returns {Array} Array of suspicious IP addresses
     */
    getSuspiciousIPs() {
        return Array.from(this.suspiciousIPs);
    }

    /**
     * Check if an IP is flagged as suspicious
     * @param {string} ip - IP address to check
     * @returns {boolean} True if IP is suspicious
     */
    isSuspicious(ip) {
        return this.suspiciousIPs.has(ip);
    }

    /**
     * Display statistics to console
     */
    displayStats() {
        const stats = this.getStatistics();
        
        console.log(chalk.bold.yellow('\n📊 DDoS Detection Statistics:'));
        console.log(chalk.gray('─'.repeat(60)));
        console.log(`  Total Alerts: ${chalk.cyan(stats.totalAlertsGenerated)}`);
        console.log(`  Critical: ${chalk.red(stats.criticalAlerts)} | High: ${chalk.yellow(stats.highAlerts)} | Medium: ${chalk.cyan(stats.mediumAlerts)}`);
        console.log(`  Suspicious IPs: ${chalk.red(stats.suspiciousIPCount)}`);
        console.log(`  Unique IPs Tracked: ${chalk.cyan(stats.uniqueIPsTracked)}`);
        
        if (stats.topTalkers.length > 0) {
            console.log(chalk.bold('\n  Top Traffic Sources:'));
            stats.topTalkers.slice(0, 5).forEach((item, index) => {
                const status = item.suspicious ? chalk.red('⚠ SUSPICIOUS') : chalk.green('✓ Normal');
                console.log(`  ${index + 1}. ${chalk.white(item.ip.padEnd(16))} - ${chalk.cyan(item.packets)} packets, ${chalk.cyan(item.connections)} connections ${status}`);
            });
        }
        console.log(chalk.gray('─'.repeat(60)));
    }
}

module.exports = DDoSDetector;
