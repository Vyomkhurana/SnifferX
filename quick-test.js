/**
 * Quick Capture Test - Captures on Wi-Fi or Ethernet
 */

const chalk = require('chalk');
const CaptureManager = require('./src/capture/captureManager');
const config = require('./config');
const utils = require('./utils');

console.log(chalk.cyan.bold('\n╔════════════════════════════════════════╗'));
console.log(chalk.cyan.bold('║   SnifferX - Quick Capture Test       ║'));
console.log(chalk.cyan.bold('╚════════════════════════════════════════╝\n'));

async function main() {
    try {
        // Use interface 6 (Wi-Fi) - change this if you're on Ethernet
        const interfaceId = '6'; // Wi-Fi
        
        utils.log('info', `Starting capture on interface ${interfaceId} (Wi-Fi)...`);
        utils.log('warn', 'Press Ctrl+C to stop\n');
        utils.log('info', 'Try opening a website in your browser to generate traffic!\n');

        const captureManager = new CaptureManager(config);
        
        let packetTypes = {
            TCP: 0,
            UDP: 0,
            ICMP: 0,
            OTHER: 0
        };

        captureManager.onPacket((packet) => {
            // Count packet types
            if (packet.protocol === 'TCP') packetTypes.TCP++;
            else if (packet.protocol === 'UDP') packetTypes.UDP++;
            else if (packet.protocol === 'ICMP') packetTypes.ICMP++;
            else packetTypes.OTHER++;

            const count = captureManager.packetCount;
            
            // Show first 10 packets in detail
            if (count <= 10) {
                const timestamp = packet.timestamp.toISOString().substr(11, 12);
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
            }
            
            // Show summary every 25 packets after first 10
            if (count > 10 && count % 25 === 0) {
                console.log(chalk.cyan(`\n📊 ${count} packets captured...`));
                console.log(chalk.white(`   TCP: ${chalk.blue(packetTypes.TCP)} | UDP: ${chalk.green(packetTypes.UDP)} | ICMP: ${chalk.yellow(packetTypes.ICMP)}`));
                
                const stats = captureManager.getStatistics();
                console.log(chalk.white(`   Rate: ${chalk.green(stats.packetsPerSecond + ' pps')} | Duration: ${chalk.gray(stats.duration)}\n`));
            }
        });

        captureManager.onEnd((stats) => {
            console.log(chalk.cyan.bold('\n\n╔════════════════════════════════════════╗'));
            console.log(chalk.cyan.bold('║       Capture Complete! 🎉             ║'));
            console.log(chalk.cyan.bold('╚════════════════════════════════════════╝\n'));
            
            console.log(chalk.white(`  📦 Total Packets: ${chalk.green(stats.totalPackets)}`));
            console.log(chalk.white(`  📊 Protocol Breakdown:`));
            console.log(chalk.blue(`     • TCP:   ${packetTypes.TCP}`));
            console.log(chalk.green(`     • UDP:   ${packetTypes.UDP}`));
            console.log(chalk.yellow(`     • ICMP:  ${packetTypes.ICMP}`));
            console.log(chalk.gray(`     • Other: ${packetTypes.OTHER}`));
            console.log(chalk.white(`  ⚡ Average Rate: ${chalk.green(stats.packetsPerSecond + ' packets/sec')}`));
            console.log(chalk.white(`  ⏱️  Duration: ${chalk.green(stats.duration)}`));
            console.log('');
        });

        // Start capture on Wi-Fi interface
        captureManager.start(interfaceId);

        // Handle Ctrl+C
        process.on('SIGINT', () => {
            console.log(chalk.yellow('\n\n⏹️  Stopping capture...\n'));
            captureManager.stop();
            setTimeout(() => process.exit(0), 1000);
        });

    } catch (error) {
        utils.log('error', `Error: ${error.message}`);
        console.error(error);
        process.exit(1);
    }
}

main();
