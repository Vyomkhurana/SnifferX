/**
 * Debug Test - See raw tshark output
 */

const { spawn } = require('child_process');

const tsharkPath = 'C:\\Program Files\\Wireshark\\tshark.exe';

const args = [
    '-i', '6',  // Wi-Fi interface
    '-c', '5',  // Capture only 5 packets
    '-l',
    '-T', 'fields',
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
    '-E', 'occurrence=f'
];

console.log('Starting tshark debug capture (5 packets)...\n');

const process = spawn(tsharkPath, args);

let count = 0;

process.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
        if (line.trim()) {
            count++;
            console.log(`\nPacket ${count}:`);
            console.log('Raw: ' + line);
            console.log('---');
            
            const fields = line.split('|');
            fields.forEach((field, index) => {
                console.log(`  Field ${index}: "${field}"`);
            });
        }
    });
});

process.stderr.on('data', (data) => {
    console.log('tshark info:', data.toString());
});

process.on('close', (code) => {
    console.log(`\nCapture complete! Exit code: ${code}`);
});
