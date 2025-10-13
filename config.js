/**
 * SnifferX Configuration File
 * Settings and configuration for network traffic analysis
 */

const path = require('path');

const config = {
    // Application Information
    app: {
        name: 'SnifferX',
        version: '1.0.0',
        author: 'Vyom Khurana',
        description: 'Network Traffic Analyzer',
        github: 'https://github.com/Vyomkhurana/SnifferX'
    },

    // Network Settings (to be implemented)
    network: {
        defaultInterface: 'eth0',
        captureTimeout: 60000, // milliseconds
        maxPackets: 10000,
        promiscuousMode: true,
        bufferSize: 10 * 1024 * 1024, // 10MB
        snapshotLength: 65535 // Max packet size to capture
    },

    // Detection Thresholds
    detection: {
        ddos: {
            enabled: true,
            packetsPerSecondThreshold: 500,  // Lowered from 1000 to 500 for easier testing
            connectionThreshold: 300,         // Lowered from 500 to 300 for easier testing
            timeWindow: 60, // seconds
            sourceIPThreshold: 100 // connections from same source
        },
        ipSpoofing: {
            enabled: true,
            checkTTL: true,
            checkSequence: true,
            ttlVarianceThreshold: 40  // Increased from 10 to 40 - only flag major anomalies
        },
        portScanning: {
            enabled: true,
            portsPerMinuteThreshold: 100,
            distinctPortsThreshold: 20,
            timeWindow: 60 // seconds
        },
        suspiciousActivity: {
            enabled: true,
            monitorProtocols: ['TCP', 'UDP', 'ICMP'],
            checkPayloadSize: true,
            unusualPortsAlert: true
        }
    },

    // Logging Settings
    logging: {
        enabled: true,
        level: 'info', // 'debug', 'info', 'warn', 'error'
        outputDir: path.join(__dirname, 'logs'),
        maxFileSize: '10MB',
        maxFiles: 5,
        timestampFormat: 'YYYY-MM-DD HH:mm:ss',
        logToFile: true,
        logToConsole: true
    },

    // Alert Settings
    alerts: {
        enabled: true,
        methods: ['console', 'file'], // future: 'email', 'webhook'
        severity: ['high', 'critical'],
        colorCoded: true,
        soundAlert: false
    },

    // Analysis Settings
    analysis: {
        realTimeMonitoring: true,
        statisticsInterval: 5000, // milliseconds
        saveRawPackets: false,
        exportFormat: 'json', // 'json', 'csv', 'pcap'
        exportDir: path.join(__dirname, 'exports')
    },

    // Security Settings
    security: {
        requireElevatedPrivileges: true,
        maxConcurrentCaptures: 1,
        autoStopOnError: true
    }
};

module.exports = config;
