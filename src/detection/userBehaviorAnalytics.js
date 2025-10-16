/**
 * User Behavior Analytics (UBA) Detector
 * Tracks and profiles user/device network behavior to detect anomalies
 * 
 * Detects:
 * - Unusual login times
 * - Abnormal data transfer volumes
 * - Access to unusual destinations
 * - Lateral movement
 * - Data exfiltration patterns
 */

const utils = require('../../utils');
const chalk = require('chalk');

class UserBehaviorAnalytics {
    constructor(config) {
        this.config = config.detection.userBehavior || this.getDefaultConfig();
        this.enabled = this.config.enabled;
        
        // User/Device profiles
        this.profiles = new Map();              // IP -> Profile object
        this.alerts = [];                       // Alert history
        this.learningMode = true;               // Start in learning mode
        this.learningStartTime = Date.now();
        this.learningPeriod = this.config.learningPeriod || 3600000; // 1 hour default
        
        utils.log('info', '👤 User Behavior Analytics initialized');
        utils.log('info', `📚 Learning mode active for ${this.learningPeriod / 60000} minutes`);
    }

    /**
     * Get default configuration
     */
    getDefaultConfig() {
        return {
            enabled: true,
            learningPeriod: 3600000,        // 1 hour learning period
            dataThresholdMultiplier: 3,      // Alert if data > 3x normal
            connectionThresholdMultiplier: 2.5, // Alert if connections > 2.5x normal
            unusualTimeWindow: 120,          // Minutes for unusual time detection
            minPacketsForProfile: 100,       // Minimum packets to create profile
            riskScoreThreshold: 70,          // Alert if risk score > 70
            exfiltrationThreshold: 10485760  // 10MB in short time = potential exfiltration
        };
    }

    /**
     * Analyze packet for behavioral anomalies
     * @param {Packet} packet - The packet to analyze
     * @returns {Object|null} Alert object if anomaly detected
     */
    analyze(packet) {
        if (!this.enabled) return null;

        const srcIP = packet.srcIP;
        if (!srcIP || srcIP === 'unknown' || srcIP === 'N/A') {
            return null;
        }

        // Check if still in learning mode
        if (this.learningMode) {
            const elapsed = Date.now() - this.learningStartTime;
            if (elapsed >= this.learningPeriod) {
                this.learningMode = false;
                this.finalizeProfiles();
                utils.log('success', '✅ Learning complete - UBA detection active');
            }
        }

        // Update or create profile
        this.updateProfile(srcIP, packet);

        // Skip detection during learning
        if (this.learningMode) {
            return null;
        }

        // Detect anomalies
        return this.detectAnomalies(srcIP, packet);
    }

    /**
     * Update user/device profile
     */
    updateProfile(ip, packet) {
        if (!this.profiles.has(ip)) {
            this.profiles.set(ip, this.createNewProfile(ip));
        }

        const profile = this.profiles.get(ip);
        const now = Date.now();

        // Update activity metrics
        profile.totalPackets++;
        profile.lastSeen = now;
        profile.bytesTransferred += packet.length || 0;
        profile.connections++;

        // Track active hours (hour of day)
        const hour = new Date().getHours();
        profile.activeHours[hour] = (profile.activeHours[hour] || 0) + 1;

        // Track destination IPs
        if (packet.dstIP && packet.dstIP !== 'unknown') {
            profile.destinations.add(packet.dstIP);
            
            // Track per-destination data
            if (!profile.dataPerDestination.has(packet.dstIP)) {
                profile.dataPerDestination.set(packet.dstIP, 0);
            }
            profile.dataPerDestination.set(
                packet.dstIP, 
                profile.dataPerDestination.get(packet.dstIP) + (packet.length || 0)
            );
        }

        // Track protocols
        if (packet.protocol) {
            profile.protocols[packet.protocol] = (profile.protocols[packet.protocol] || 0) + 1;
        }

        // Track ports accessed
        if (packet.dstPort) {
            profile.portsAccessed.add(packet.dstPort);
        }

        // Update time windows for recent activity
        profile.recentActivity.push({
            timestamp: now,
            bytes: packet.length || 0,
            destination: packet.dstIP,
            port: packet.dstPort
        });

        // Keep only last 5 minutes of activity
        const fiveMinutesAgo = now - 300000;
        profile.recentActivity = profile.recentActivity.filter(
            act => act.timestamp >= fiveMinutesAgo
        );
    }

    /**
     * Create new user profile
     */
    createNewProfile(ip) {
        return {
            ip: ip,
            firstSeen: Date.now(),
            lastSeen: Date.now(),
            totalPackets: 0,
            bytesTransferred: 0,
            connections: 0,
            destinations: new Set(),
            activeHours: {},                 // Hour -> packet count
            protocols: {},                    // Protocol -> count
            portsAccessed: new Set(),
            dataPerDestination: new Map(),   // IP -> bytes
            recentActivity: [],              // Recent 5-min activity
            baseline: null,                   // Will be set after learning
            riskScore: 0,
            anomalyCount: 0
        };
    }

    /**
     * Finalize profiles after learning period
     */
    finalizeProfiles() {
        for (const [ip, profile] of this.profiles.entries()) {
            if (profile.totalPackets >= this.config.minPacketsForProfile) {
                profile.baseline = this.calculateBaseline(profile);
                utils.log('info', `📊 Profile created for ${ip}: ${profile.totalPackets} packets, ${profile.destinations.size} destinations`);
            }
        }
    }

    /**
     * Calculate baseline behavior from learned data
     */
    calculateBaseline(profile) {
        const duration = profile.lastSeen - profile.firstSeen;
        const durationMinutes = duration / 60000;

        return {
            avgPacketsPerMinute: profile.totalPackets / Math.max(durationMinutes, 1),
            avgBytesPerMinute: profile.bytesTransferred / Math.max(durationMinutes, 1),
            avgConnectionsPerMinute: profile.connections / Math.max(durationMinutes, 1),
            normalDestinations: new Set(profile.destinations),
            normalHours: this.identifyNormalHours(profile.activeHours),
            normalProtocols: Object.keys(profile.protocols),
            normalPorts: new Set(profile.portsAccessed)
        };
    }

    /**
     * Identify normal active hours (where activity > 10% of peak)
     */
    identifyNormalHours(activeHours) {
        const maxActivity = Math.max(...Object.values(activeHours));
        const threshold = maxActivity * 0.1;
        
        return Object.entries(activeHours)
            .filter(([hour, count]) => count >= threshold)
            .map(([hour]) => parseInt(hour));
    }

    /**
     * Detect behavioral anomalies
     */
    detectAnomalies(ip, packet) {
        const profile = this.profiles.get(ip);
        
        if (!profile || !profile.baseline) {
            return null;
        }

        const anomalies = [];
        let riskScore = 0;

        // 1. Check unusual time access
        const currentHour = new Date().getHours();
        if (!profile.baseline.normalHours.includes(currentHour)) {
            anomalies.push('Unusual time access');
            riskScore += 20;
        }

        // 2. Check data exfiltration (high data transfer in short time)
        const recentBytes = profile.recentActivity.reduce((sum, act) => sum + act.bytes, 0);
        if (recentBytes > this.config.exfiltrationThreshold) {
            anomalies.push('Potential data exfiltration');
            riskScore += 40;
        }

        // 3. Check abnormal data volume
        const now = Date.now();
        const recentMinutes = (now - profile.lastSeen) / 60000;
        const currentBytesPerMin = profile.recentActivity.reduce((sum, act) => sum + act.bytes, 0) / 5;
        
        if (currentBytesPerMin > profile.baseline.avgBytesPerMinute * this.config.dataThresholdMultiplier) {
            anomalies.push('Abnormal data volume');
            riskScore += 25;
        }

        // 4. Check access to unusual destinations
        const newDestinations = [...profile.destinations].filter(
            dest => !profile.baseline.normalDestinations.has(dest)
        );
        
        if (newDestinations.length > 0 && profile.totalPackets > 200) {
            anomalies.push(`Access to ${newDestinations.length} new destination(s)`);
            riskScore += 15;
        }

        // 5. Check lateral movement (internal IP scanning)
        const internalDests = [...profile.destinations].filter(ip => this.isInternalIP(ip));
        if (internalDests.length > 10) {
            anomalies.push('Potential lateral movement');
            riskScore += 35;
        }

        // 6. Check unusual protocol usage
        const currentProtocol = packet.protocol;
        if (currentProtocol && !profile.baseline.normalProtocols.includes(currentProtocol)) {
            anomalies.push(`Unusual protocol: ${currentProtocol}`);
            riskScore += 10;
        }

        // 7. Check connection rate anomaly
        const currentConnPerMin = profile.recentActivity.length / 5;
        if (currentConnPerMin > profile.baseline.avgConnectionsPerMinute * this.config.connectionThresholdMultiplier) {
            anomalies.push('Abnormal connection rate');
            riskScore += 20;
        }

        // Update risk score
        profile.riskScore = Math.min(riskScore, 100);

        // Generate alert if anomalies detected and risk score high enough
        if (anomalies.length > 0 && riskScore >= this.config.riskScoreThreshold) {
            profile.anomalyCount++;
            
            const alert = {
                type: 'user_behavior',
                severity: this.getSeverity(riskScore),
                timestamp: new Date(),
                srcIP: ip,
                reason: 'Behavioral anomaly detected',
                details: {
                    anomalies: anomalies,
                    riskScore: riskScore,
                    recentDataTransfer: this.formatBytes(recentBytes),
                    newDestinations: newDestinations.slice(0, 5),
                    currentHour: currentHour,
                    normalHours: profile.baseline.normalHours
                },
                message: this.formatAlertMessage(ip, anomalies, riskScore)
            };

            this.alerts.push(alert);
            return alert;
        }

        return null;
    }

    /**
     * Check if IP is internal/private
     */
    isInternalIP(ip) {
        if (!ip || typeof ip !== 'string') return false;
        
        const parts = ip.split('.');
        if (parts.length !== 4) return false;
        
        const first = parseInt(parts[0]);
        const second = parseInt(parts[1]);
        
        return (
            first === 10 ||
            first === 127 ||
            (first === 172 && second >= 16 && second <= 31) ||
            (first === 192 && second === 168) ||
            (first === 169 && second === 254)
        );
    }

    /**
     * Get severity based on risk score
     */
    getSeverity(riskScore) {
        if (riskScore >= 90) return 'critical';
        if (riskScore >= 70) return 'high';
        if (riskScore >= 50) return 'medium';
        return 'low';
    }

    /**
     * Format alert message
     */
    formatAlertMessage(ip, anomalies, riskScore) {
        const severityColor = riskScore >= 90 ? 'red' : riskScore >= 70 ? 'yellow' : 'cyan';
        const severityText = riskScore >= 90 ? 'CRITICAL' : riskScore >= 70 ? 'HIGH' : 'MEDIUM';
        
        return `⚠️  ${severityText}: Behavioral anomaly from ${chalk[severityColor](ip)} - Risk Score: ${riskScore}/100\n` +
               `   Anomalies: ${anomalies.join(', ')}`;
    }

    /**
     * Format bytes for display
     */
    formatBytes(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / 1048576).toFixed(2) + ' MB';
    }

    /**
     * Get statistics
     */
    getStatistics() {
        const totalProfiles = this.profiles.size;
        const profilesWithBaseline = [...this.profiles.values()].filter(p => p.baseline).length;
        const highRiskUsers = [...this.profiles.values()].filter(p => p.riskScore >= 70).length;
        const totalAnomalies = [...this.profiles.values()].reduce((sum, p) => sum + p.anomalyCount, 0);

        return {
            totalProfiles: totalProfiles,
            profilesWithBaseline: profilesWithBaseline,
            learningMode: this.learningMode,
            highRiskUsers: highRiskUsers,
            totalAnomalies: totalAnomalies,
            totalAlerts: this.alerts.length
        };
    }

    /**
     * Get user profile details
     */
    getUserProfile(ip) {
        const profile = this.profiles.get(ip);
        if (!profile) return null;

        return {
            ip: profile.ip,
            firstSeen: new Date(profile.firstSeen).toLocaleString(),
            lastSeen: new Date(profile.lastSeen).toLocaleString(),
            totalPackets: profile.totalPackets,
            bytesTransferred: this.formatBytes(profile.bytesTransferred),
            destinations: profile.destinations.size,
            protocols: Object.keys(profile.protocols).join(', '),
            riskScore: profile.riskScore,
            anomalyCount: profile.anomalyCount,
            hasBaseline: !!profile.baseline
        };
    }

    /**
     * Reset learning mode (for testing or retraining)
     */
    resetLearning() {
        this.learningMode = true;
        this.learningStartTime = Date.now();
        this.profiles.clear();
        this.alerts = [];
        utils.log('info', '🔄 UBA learning mode reset');
    }
}

module.exports = UserBehaviorAnalytics;
