/**
 * Packet Data Model
 * Represents a captured network packet
 */

class Packet {
    constructor(data) {
        this.timestamp = data.timestamp || new Date();
        this.frameNumber = data.frameNumber || 0;
        this.frameLength = data.frameLength || 0;
        
        // Ethernet Layer
        this.srcMAC = data.srcMAC || 'unknown';
        this.dstMAC = data.dstMAC || 'unknown';
        
        // IP Layer
        this.srcIP = data.srcIP || 'unknown';
        this.dstIP = data.dstIP || 'unknown';
        this.protocol = data.protocol || 'unknown'; // TCP, UDP, ICMP, etc.
        this.ttl = data.ttl || 0;
        this.ipVersion = data.ipVersion || 4;
        
        // Transport Layer
        this.srcPort = data.srcPort || null;
        this.dstPort = data.dstPort || null;
        this.tcpFlags = data.tcpFlags || null; // SYN, ACK, FIN, etc.
        
        // Additional Info
        this.length = data.length || 0;
        this.info = data.info || '';
        this.raw = data.raw || null; // Raw packet data if available
    }

    /**
     * Check if packet is TCP
     */
    isTCP() {
        return this.protocol.toUpperCase() === 'TCP';
    }

    /**
     * Check if packet is UDP
     */
    isUDP() {
        return this.protocol.toUpperCase() === 'UDP';
    }

    /**
     * Check if packet is ICMP
     */
    isICMP() {
        return this.protocol.toUpperCase() === 'ICMP';
    }

    /**
     * Check if packet is a SYN packet (connection attempt)
     */
    isSYN() {
        return this.isTCP() && this.tcpFlags && this.tcpFlags.includes('SYN');
    }

    /**
     * Check if port is commonly used
     */
    isCommonPort() {
        const commonPorts = [
            20, 21,    // FTP
            22,        // SSH
            23,        // Telnet
            25,        // SMTP
            53,        // DNS
            80,        // HTTP
            110,       // POP3
            143,       // IMAP
            443,       // HTTPS
            3306,      // MySQL
            3389,      // RDP
            5432,      // PostgreSQL
            8080, 8443 // Alt HTTP/HTTPS
        ];
        
        return commonPorts.includes(this.srcPort) || commonPorts.includes(this.dstPort);
    }

    /**
     * Get connection key (for tracking connections)
     */
    getConnectionKey() {
        return `${this.srcIP}:${this.srcPort}->${this.dstIP}:${this.dstPort}`;
    }

    /**
     * Format packet info for display
     */
    toString() {
        let portInfo = '';
        if (this.srcPort && this.dstPort) {
            portInfo = ` [${this.srcPort} → ${this.dstPort}]`;
        }
        
        return `[${this.protocol}] ${this.srcIP} → ${this.dstIP}${portInfo} | ${this.length} bytes`;
    }

    /**
     * Convert to JSON for storage
     */
    toJSON() {
        return {
            timestamp: this.timestamp,
            frameNumber: this.frameNumber,
            srcMAC: this.srcMAC,
            dstMAC: this.dstMAC,
            srcIP: this.srcIP,
            dstIP: this.dstIP,
            protocol: this.protocol,
            ttl: this.ttl,
            srcPort: this.srcPort,
            dstPort: this.dstPort,
            tcpFlags: this.tcpFlags,
            length: this.length,
            info: this.info
        };
    }
}

module.exports = Packet;
