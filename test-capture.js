/**
 * Test Packet Capture
 * Simple script to test our packet capture functionality
 */

const chalk = require('chalk');
const CaptureManager = require('./src/capture/captureManager');
const config = require('./config');
const utils = require('./utils');

// Display banner
console.log(chalk.cyan.bold('\n╔════════════════════════════════════════╗'));
console.log(chalk.cyan.bold('║   SnifferX - Packet Capture Test      ║'));
console.log(chalk.cyan.bold('╚════════════════════════════════════════╝\n'));

async function main() {
    try {
        // List available network interfaces
        utils.log('info', 'Listing available network interfaces...\n');
        
        const interfaces = await CaptureManager.listInterfaces();
        
        if (interfaces.length === 0) {
            utils.log('error', 'No network interfaces found!');
            process.exit(1);
        }

        console.log(chalk.yellow('Available Interfaces:'));
        interfaces.forEach(iface => {
            console.log(chalk.white(`  ${iface.id}. ${chalk.cyan(iface.name)}`));
            if (iface.description) {
                console.log(chalk.gray(`     ${iface.description}`));
            }
        });
        
        console.log('');
        utils.log('info', 'Starting capture on default interface...');
        utils.log('warn', 'Press Ctrl+C to stop capture\n');

        // Create capture manager
        const captureManager = new CaptureManager(config);
        
        let displayCount = 0;
        const maxDisplay = 20; // Show only first 20 packets in detail

        // Register packet callback
        captureManager.onPacket((packet) => {
            displayCount++;
            
            if (displayCount <= maxDisplay) {
                // Display packet details
                const timestamp = packet.timestamp.toISOString().substr(11, 8);
                const protocol = packet.protocol.padEnd(6);
                const srcIP = packet.srcIP.padEnd(15);
                const dstIP = packet.dstIP.padEnd(15);
                
                let portInfo = '';
                if (packet.srcPort && packet.dstPort) {
                    portInfo = chalk.gray(` [${packet.srcPort} → ${packet.dstPort}]`);
                }
                
                const protocolColor = 
                    packet.protocol === 'TCP' ? chalk.blue :
                    packet.protocol === 'UDP' ? chalk.green :
                    packet.protocol === 'ICMP' ? chalk.yellow :
                    chalk.white;

                console.log(
                    chalk.gray(`[${timestamp}]`) +
                    ` ${protocolColor(protocol)} ` +
                    chalk.cyan(srcIP) +
                    ' → ' +
                    chalk.magenta(dstIP) +
                    portInfo +
                    chalk.gray(` | ${packet.length} bytes`)
                );
            } else if (displayCount === maxDisplay + 1) {
                console.log(chalk.yellow('\n... (Showing stats only, packet details hidden) ...\n'));
            }

            // Show stats every 50 packets
            if (displayCount % 50 === 0) {
                const stats = captureManager.getStatistics();
                console.log(chalk.cyan.bold(`\n📊 Statistics:`));
                console.log(chalk.white(`   Total Packets: ${chalk.green(stats.totalPackets)}`));
                console.log(chalk.white(`   Packets/sec:   ${chalk.green(stats.packetsPerSecond)}`));
                console.log(chalk.white(`   Duration:      ${chalk.green(stats.duration)}\n`));
            }
        });

        // Register end callback
        captureManager.onEnd((stats) => {
            console.log(chalk.cyan.bold('\n\n╔════════════════════════════════════════╗'));
            console.log(chalk.cyan.bold('║       Capture Session Summary          ║'));
            console.log(chalk.cyan.bold('╚════════════════════════════════════════╝\n'));
            
            console.log(chalk.white(`  Total Packets Captured: ${chalk.green(stats.totalPackets)}`));
            console.log(chalk.white(`  Average Rate:           ${chalk.green(stats.packetsPerSecond + ' packets/sec')}`));
            console.log(chalk.white(`  Duration:               ${chalk.green(stats.duration)}`));
            console.log('');
        });

        // Start capture (default interface, no filter)
        captureManager.start();

        // Handle Ctrl+C gracefully
        process.on('SIGINT', () => {
            console.log(chalk.yellow('\n\n⚠️  Stopping capture...\n'));
            captureManager.stop();
            setTimeout(() => process.exit(0), 1000);
        });

    } catch (error) {
        utils.log('error', `Test failed: ${error.message}`);
        console.error(error);
        process.exit(1);
    }
}

// Run the test
main();
