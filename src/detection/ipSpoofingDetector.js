/**
 * IP Spoofing Detector
 * Detects spoofed IP addresses by analyzing TTL and other packet characteristics
 */

const utils = require('../../utils');
const chalk = require('chalk');

class IPSpoofingDetector {
    constructor(config) {
        this.config = config.detection.ipSpoofing;
        this.enabled = this.config.enabled;
        
        // Tracking data structures
        this.ttlByIP = new Map();                // IP -> [TTL values]
        this.baselineTTL = new Map();            // IP -> baseline TTL value
        this.packetCountByIP = new Map();        // IP -> packet count
        this.alerts = [];                        // Alert history
        this.suspiciousIPs = new Set();          // IPs flagged as spoofed
        this.lastAlertTime = new Map();          // IP -> last alert timestamp
        
        // Minimum packets needed to establish baseline
        this.minPacketsForBaseline = 20;         // Increased from 5 to 20 for better baseline
        this.alertCooldown = 60000;              // 60 seconds between alerts for same IP
        
        utils.log('info', '🎭 IP Spoofing Detector initialized');
    }

    /**
     * Analyze a packet for IP spoofing indicators
     * @param {Packet} packet - The packet to analyze
     * @returns {Object|null} Alert object if spoofing detected, null otherwise
     */
    analyze(packet) {
        if (!this.enabled) return null;

        const srcIP = packet.srcIP;
        const ttl = packet.ttl;

        // Skip invalid packets
        if (!srcIP || srcIP === 'unknown' || srcIP === 'N/A' || ttl === 0) {
            return null;
        }

        // Skip multicast, broadcast, and local addresses
        if (this.isSpecialAddress(srcIP) || this.isLocalAddress(srcIP)) {
            return null;
        }
        
        // Skip packets from private networks (they have unpredictable TTLs)
        if (this.isPrivateNetwork(srcIP)) {
            return null;
        }

        // Initialize tracking for this IP if needed
        if (!this.ttlByIP.has(srcIP)) {
            this.ttlByIP.set(srcIP, []);
            this.packetCountByIP.set(srcIP, 0);
        }

        // Increment packet count
        this.packetCountByIP.set(srcIP, this.packetCountByIP.get(srcIP) + 1);

        // Store TTL value
        const ttlValues = this.ttlByIP.get(srcIP);
        ttlValues.push(ttl);

        // Keep only last 100 TTL values per IP
        if (ttlValues.length > 100) {
            ttlValues.shift();
        }

        // Establish baseline TTL after collecting enough packets
        if (!this.baselineTTL.has(srcIP) && ttlValues.length >= this.minPacketsForBaseline) {
            const baseline = this.calculateBaselineTTL(ttlValues);
            this.baselineTTL.set(srcIP, baseline);
        }

        // Check for spoofing if baseline exists
        if (this.baselineTTL.has(srcIP)) {
            const alert = this.checkForSpoofing(srcIP, ttl, packet);
            
            if (alert) {
                this.suspiciousIPs.add(srcIP);
                this.alerts.push(alert);
                return alert;
            }
        }

        return null;
    }

    /**
     * Calculate baseline TTL for an IP address
     * @param {Array} ttlValues - Array of TTL values
     * @returns {number} Baseline TTL value
     */
    calculateBaselineTTL(ttlValues) {
        // Use median for robustness against outliers
        const sorted = [...ttlValues].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 
            ? (sorted[mid - 1] + sorted[mid]) / 2 
            : sorted[mid];
    }

    /**
     * Check if packet shows signs of IP spoofing
     * @param {string} srcIP - Source IP address
     * @param {number} currentTTL - Current packet TTL
     * @param {Packet} packet - The packet being analyzed
     * @returns {Object|null} Alert object or null
     */
    checkForSpoofing(srcIP, currentTTL, packet) {
        const baselineTTL = this.baselineTTL.get(srcIP);
        const ttlDifference = Math.abs(currentTTL - baselineTTL);
        
        // Check alert cooldown (don't spam alerts for same IP)
        const lastAlert = this.lastAlertTime.get(srcIP);
        if (lastAlert && (Date.now() - lastAlert < this.alertCooldown)) {
            return null; // Still in cooldown period
        }

        // Check TTL variance - MUCH stricter threshold now
        // Only alert if difference is VERY large (indicates actual spoofing)
        if (this.config.checkTTL && ttlDifference > 40) {  // Changed from 10 to 40
            const ttlValues = this.ttlByIP.get(srcIP);
            const variance = this.calculateVariance(ttlValues);
            
            // Record alert time
            this.lastAlertTime.set(srcIP, Date.now());

            return {
                type: 'ip_spoofing',
                severity: ttlDifference > 60 ? 'critical' : 'high',  // Changed from 30 to 60
                timestamp: new Date(),
                srcIP: srcIP,
                dstIP: packet.dstIP,
                reason: 'TTL variance exceeds threshold',
                details: {
                    currentTTL: currentTTL,
                    baselineTTL: Math.round(baselineTTL),
                    difference: ttlDifference,
                    threshold: 40,  // Using hardcoded stricter threshold
                    variance: Math.round(variance * 100) / 100,
                    totalPackets: this.packetCountByIP.get(srcIP)
                },
                message: `⚠️  ${ttlDifference > 60 ? 'CRITICAL' : 'HIGH'}: Possible IP spoofing from ${chalk.red(srcIP)} - TTL: ${currentTTL} (expected: ~${Math.round(baselineTTL)}, diff: ${ttlDifference})`
            };
        }

        // Check for impossible TTL values
        if (currentTTL > 255 || currentTTL < 1) {
            return {
                type: 'ip_spoofing',
                severity: 'critical',
                timestamp: new Date(),
                srcIP: srcIP,
                dstIP: packet.dstIP,
                reason: 'Invalid TTL value',
                details: {
                    currentTTL: currentTTL,
                    reason: 'TTL outside valid range (1-255)'
                },
                message: `⚠️  CRITICAL: Invalid TTL from ${chalk.red(srcIP)} - TTL: ${currentTTL} (invalid range)`
            };
        }

        // REMOVED: Common OS defaults check - too many false positives
        // Normal TTL variation due to routing is not spoofing

        return null;
    }

    /**
     * Calculate variance of TTL values
     * @param {Array} values - Array of TTL values
     * @returns {number} Variance
     */
    calculateVariance(values) {
        if (values.length === 0) return 0;
        
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
        return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    }

    /**
     * Check if IP is from a private network
     * @param {string} ip - IP address
     * @returns {boolean} True if private network
     */
    isPrivateNetwork(ip) {
        const parts = ip.split('.').map(p => parseInt(p));
        if (parts.length !== 4) return false;
        
        // 10.0.0.0/8
        if (parts[0] === 10) return true;
        
        // 172.16.0.0/12
        if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
        
        // 192.168.0.0/16
        if (parts[0] === 192 && parts[1] === 168) return true;
        
        return false;
    }
    
    /**
     * Check if IP is a local/loopback address
     * @param {string} ip - IP address
     * @returns {boolean} True if local address
     */
    isLocalAddress(ip) {
        if (ip.startsWith('127.')) return true;  // Loopback
        if (ip.startsWith('169.254.')) return true;  // Link-local
        if (ip === '0.0.0.0' || ip === '255.255.255.255') return true;
        return false;
    }

    /**
     * Check if IP is a special address (multicast, broadcast, etc.)
     * @param {string} ip - IP address
     * @returns {boolean} True if special address
     */
    isSpecialAddress(ip) {
        const parts = ip.split('.');
        if (parts.length !== 4) return true;

        const firstOctet = parseInt(parts[0]);
        
        // Multicast (224.0.0.0 - 239.255.255.255)
        if (firstOctet >= 224 && firstOctet <= 239) return true;
        
        // Broadcast
        if (ip === '255.255.255.255') return true;
        
        // Reserved/Private ranges (we still want to analyze these but with context)
        // 0.0.0.0/8, 10.0.0.0/8, 169.254.0.0/16, 192.168.0.0/16
        
        return false;
    }

    /**
     * Get statistics about detected spoofing
     * @returns {Object} Statistics object
     */
    getStatistics() {
        const suspiciousIPs = Array.from(this.suspiciousIPs).map(ip => ({
            ip,
            baselineTTL: Math.round(this.baselineTTL.get(ip) || 0),
            currentTTL: this.ttlByIP.get(ip)?.slice(-1)[0] || 0,
            packets: this.packetCountByIP.get(ip) || 0,
            ttlValues: this.ttlByIP.get(ip) || []
        }));

        const analyzedIPs = Array.from(this.baselineTTL.entries()).map(([ip, baseline]) => ({
            ip,
            baselineTTL: Math.round(baseline),
            packets: this.packetCountByIP.get(ip) || 0,
            suspicious: this.suspiciousIPs.has(ip)
        }));

        return {
            totalAlertsGenerated: this.alerts.length,
            suspiciousIPCount: this.suspiciousIPs.size,
            uniqueIPsTracked: this.ttlByIP.size,
            ipsWithBaseline: this.baselineTTL.size,
            suspiciousIPs: suspiciousIPs,
            analyzedIPs: analyzedIPs.slice(0, 20), // Top 20
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
        this.ttlByIP.clear();
        this.baselineTTL.clear();
        this.packetCountByIP.clear();
        this.alerts = [];
        this.suspiciousIPs.clear();
        utils.log('info', 'IP Spoofing Detector reset');
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
     * Get TTL baseline for an IP
     * @param {string} ip - IP address
     * @returns {number|null} Baseline TTL or null if not established
     */
    getBaselineTTL(ip) {
        return this.baselineTTL.get(ip) || null;
    }

    /**
     * Display statistics to console
     */
    displayStats() {
        const stats = this.getStatistics();
        
        console.log(chalk.bold.yellow('\n🎭 IP Spoofing Detection Statistics:'));
        console.log(chalk.gray('─'.repeat(60)));
        console.log(`  Total Alerts: ${chalk.cyan(stats.totalAlertsGenerated)}`);
        console.log(`  Critical: ${chalk.red(stats.criticalAlerts)} | High: ${chalk.yellow(stats.highAlerts)} | Medium: ${chalk.cyan(stats.mediumAlerts)}`);
        console.log(`  Suspicious IPs: ${chalk.red(stats.suspiciousIPCount)}`);
        console.log(`  IPs with Baseline: ${chalk.cyan(stats.ipsWithBaseline)}`);
        console.log(`  Unique IPs Tracked: ${chalk.cyan(stats.uniqueIPsTracked)}`);
        
        if (stats.suspiciousIPs.length > 0) {
            console.log(chalk.bold('\n  Suspicious IPs (Possible Spoofing):'));
            stats.suspiciousIPs.slice(0, 5).forEach((item, index) => {
                const ttlRange = `Baseline: ${item.baselineTTL}, Current: ${item.currentTTL}`;
                console.log(`  ${index + 1}. ${chalk.red(item.ip.padEnd(16))} - ${chalk.cyan(item.packets)} packets`);
                console.log(`     ${chalk.gray(`TTL: ${ttlRange}`)}`);
            });
        }
        console.log(chalk.gray('─'.repeat(60)));
    }
}

module.exports = IPSpoofingDetector;
