/**
 * Capture Manager
 * Manages packet capture using tshark (Wireshark command-line tool)
 */

const { spawn } = require('child_process');
const Packet = require('../models/Packet');
const utils = require('../../utils');
const chalk = require('chalk');

class CaptureManager {
    constructor(config) {
        this.config = config;
        this.captureProcess = null;
        this.isCapturing = false;
        this.packetCount = 0;
        this.startTime = null;
        this.packets = [];
        
        // Auto-detect tshark path based on platform
        if (process.platform === 'win32') {
            // Windows
            this.tsharkPath = 'C:\\Program Files\\Wireshark\\tshark.exe';
        } else if (process.platform === 'darwin') {
            // macOS
            this.tsharkPath = '/usr/local/bin/tshark';
        } else {
            // Linux
            this.tsharkPath = '/usr/bin/tshark';
        }
        
        this.callbacks = {
            onPacket: null,
            onError: null,
            onEnd: null
        };
    }

    /**
     * Start packet capture
     * @param {string} interfaceId - Network interface to capture on (optional)
     * @param {string} filter - BPF filter string (optional)
     */
    start(interfaceId = null, filter = null) {
        if (this.isCapturing) {
            throw new Error('Capture is already running');
        }

        utils.log('info', 'Starting packet capture...');
        
        // Build tshark command arguments
        const args = [
            '-l',  // Line-buffered output
            '-T', 'fields',  // Output in fields format
            '-e', 'frame.number',
            '-e', 'frame.time_epoch',
            '-e', 'frame.len',
            '-e', 'eth.src',
            '-e', 'eth.dst',
            '-e', 'ip.src',
            '-e', 'ip.dst',
            '-e', 'ip.proto',
            '-e', 'ip.ttl',
            '-e', 'tcp.srcport',
            '-e', 'tcp.dstport',
            '-e', 'udp.srcport',
            '-e', 'udp.dstport',
            '-e', 'tcp.flags.str',
            '-e', '_ws.col.Protocol',
            '-e', '_ws.col.Info',
            '-E', 'separator=|',
            '-E', 'quote=d',
            '-E', 'occurrence=f'  // Only first occurrence of each field
        ];

        // Add interface if specified
        if (interfaceId) {
            args.unshift('-i', interfaceId);
        }

        // Add filter if specified
        if (filter) {
            args.push(filter);
        }

        // Spawn tshark process
        try {
            this.captureProcess = spawn(this.tsharkPath, args);
            this.isCapturing = true;
            this.startTime = new Date();
            this.packetCount = 0;

            utils.log('success', 'Packet capture started successfully!');
            utils.log('info', `Interface: ${interfaceId || 'default'}`);
            if (filter) {
                utils.log('info', `Filter: ${filter}`);
            }

            // Handle stdout (packet data)
            this.captureProcess.stdout.on('data', (data) => {
                this.handlePacketData(data);
            });

            // Handle stderr (errors and info)
            this.captureProcess.stderr.on('data', (data) => {
                const message = data.toString();
                // tshark outputs info to stderr, so don't log everything as error
                if (message.includes('error') || message.includes('Error')) {
                    utils.log('warn', `Capture warning: ${message.trim()}`);
                }
            });

            // Handle process exit
            this.captureProcess.on('close', (code) => {
                this.isCapturing = false;
                utils.log('info', `Capture stopped. Exit code: ${code}`);
                
                if (this.callbacks.onEnd) {
                    this.callbacks.onEnd(this.getStatistics());
                }
            });

            // Handle errors
            this.captureProcess.on('error', (error) => {
                utils.log('error', `Capture error: ${error.message}`);
                this.isCapturing = false;
                
                if (this.callbacks.onError) {
                    this.callbacks.onError(error);
                }
            });

        } catch (error) {
            utils.log('error', `Failed to start capture: ${error.message}`);
            throw error;
        }
    }

    /**
     * Handle incoming packet data from tshark
     */
    handlePacketData(data) {
        const lines = data.toString().split('\n');
        
        lines.forEach(line => {
            if (line.trim()) {
                try {
                    const packet = this.parsePacketLine(line);
                    if (packet) {
                        this.packetCount++;
                        this.packets.push(packet);
                        
                        // Keep only last 10000 packets in memory
                        if (this.packets.length > this.config.network.maxPackets) {
                            this.packets.shift();
                        }
                        
                        // Callback for each packet
                        if (this.callbacks.onPacket) {
                            this.callbacks.onPacket(packet);
                        }
                    }
                } catch (error) {
                    // Silently skip malformed packets
                }
            }
        });
    }

    /**
     * Parse a line of tshark output into a Packet object
     */
    parsePacketLine(line) {
        const fields = line.split('|');
        
        if (fields.length < 10) {
            return null; // Invalid packet line
        }

        // Helper function to clean quotes from tshark output
        const clean = (str) => {
            if (!str) return '';
            return str.replace(/^"(.*)"$/, '$1').trim();
        };

        // Parse basic fields
        const frameNumber = parseInt(clean(fields[0])) || 0;
        const timestamp = new Date(parseFloat(clean(fields[1])) * 1000);
        const frameLength = parseInt(clean(fields[2])) || 0;
        const srcMAC = clean(fields[3]) || 'unknown';
        const dstMAC = clean(fields[4]) || 'unknown';
        const srcIP = clean(fields[5]) || 'unknown';
        const dstIP = clean(fields[6]) || 'unknown';
        const ipProto = parseInt(clean(fields[7])) || 0;
        const ttl = parseInt(clean(fields[8])) || 0;
        
        // Parse ports (TCP or UDP)
        const tcpSrcPort = parseInt(clean(fields[9])) || null;
        const tcpDstPort = parseInt(clean(fields[10])) || null;
        const udpSrcPort = parseInt(clean(fields[11])) || null;
        const udpDstPort = parseInt(clean(fields[12])) || null;
        
        const srcPort = tcpSrcPort || udpSrcPort;
        const dstPort = tcpDstPort || udpDstPort;
        
        const tcpFlags = clean(fields[13]) || null;
        const protocolName = clean(fields[14]) || 'unknown';
        const info = clean(fields[15]) || '';
        
        // Determine protocol from protocol name field
        let protocol = protocolName.toUpperCase();
        
        // If protocol name is unclear, determine from IP protocol number
        if (!protocol || protocol === 'UNKNOWN' || protocol.length === 0) {
            if (ipProto === 6) protocol = 'TCP';
            else if (ipProto === 17) protocol = 'UDP';
            else if (ipProto === 1) protocol = 'ICMP';
            else if (ipProto > 0) protocol = `IP(${ipProto})`;
            else protocol = 'OTHER';
        }
        
        // Skip non-IP packets if srcIP is empty (like ARP)
        if (!srcIP || srcIP === 'unknown' || srcIP.length === 0) {
            // For ARP and other non-IP protocols
            protocol = protocolName.toUpperCase() || 'NON-IP';
        }

        const packet = new Packet({
            frameNumber,
            timestamp,
            frameLength,
            srcMAC,
            dstMAC,
            srcIP: srcIP || 'N/A',
            dstIP: dstIP || 'N/A',
            ttl,
            srcPort,
            dstPort,
            tcpFlags,
            protocol,
            info,
            length: frameLength
        });

        return packet;
    }

    /**
     * Stop packet capture
     */
    stop() {
        if (!this.isCapturing) {
            utils.log('warn', 'No capture is currently running');
            return;
        }

        utils.log('info', 'Stopping packet capture...');
        
        if (this.captureProcess) {
            this.captureProcess.kill('SIGINT');
            this.captureProcess = null;
        }
        
        this.isCapturing = false;
        const stats = this.getStatistics();
        
        utils.log('success', 'Capture stopped successfully');
        utils.log('info', `Total packets captured: ${chalk.cyan(stats.totalPackets)}`);
        utils.log('info', `Duration: ${chalk.cyan(stats.duration)}`);
        
        return stats;
    }

    /**
     * Get capture statistics
     */
    getStatistics() {
        const duration = this.startTime 
            ? new Date() - this.startTime 
            : 0;
        
        const packetsPerSecond = duration > 0 
            ? Math.round((this.packetCount / (duration / 1000)) * 100) / 100 
            : 0;

        return {
            totalPackets: this.packetCount,
            duration: utils.formatDuration(duration),
            durationMs: duration,
            packetsPerSecond: packetsPerSecond,
            isCapturing: this.isCapturing,
            startTime: this.startTime
        };
    }

    /**
     * Get recent packets
     */
    getPackets(count = 100) {
        return this.packets.slice(-count);
    }

    /**
     * Clear captured packets from memory
     */
    clearPackets() {
        this.packets = [];
        this.packetCount = 0;
        utils.log('info', 'Cleared all captured packets from memory');
    }

    /**
     * Register callback for when packet is captured
     */
    onPacket(callback) {
        this.callbacks.onPacket = callback;
    }

    /**
     * Register callback for capture errors
     */
    onError(callback) {
        this.callbacks.onError = callback;
    }

    /**
     * Register callback for capture end
     */
    onEnd(callback) {
        this.callbacks.onEnd = callback;
    }

    /**
     * List available network interfaces
     */
    static async listInterfaces() {
        return new Promise((resolve, reject) => {
            const tsharkPath = 'C:\\Program Files\\Wireshark\\tshark.exe';
            const process = spawn(tsharkPath, ['-D']);
            
            let output = '';
            
            process.stdout.on('data', (data) => {
                output += data.toString();
            });
            
            process.on('close', (code) => {
                if (code === 0) {
                    const interfaces = output.trim().split('\n').map(line => {
                        const match = line.match(/^(\d+)\.\s+(.+?)(?:\s+\((.+)\))?$/);
                        if (match) {
                            return {
                                id: match[1],
                                name: match[2].trim(),
                                description: match[3] || ''
                            };
                        }
                        return null;
                    }).filter(i => i !== null);
                    
                    resolve(interfaces);
                } else {
                    reject(new Error('Failed to list interfaces'));
                }
            });
        });
    }
}

module.exports = CaptureManager;
