/**
 * SnifferX Configuration File
 * Settings and configuration for network traffic analysis
 */

const config = {
    // Application Information
    app: {
        name: 'SnifferX',
        version: '1.0.0',
        author: 'Vyom Khurana',
        description: 'Network Traffic Analyzer'
    },

    // Network Settings (to be implemented)
    network: {
        defaultInterface: 'eth0',
        captureTimeout: 60000, // milliseconds
        maxPackets: 10000,
        promiscuousMode: true
    },

    // Detection Thresholds
    detection: {
        ddos: {
            enabled: true,
            packetsPerSecondThreshold: 1000,
            connectionThreshold: 500
        },
        ipSpoofing: {
            enabled: true,
            checkTTL: true,
            checkSequence: true
        },
        portScanning: {
            enabled: true,
            portsPerMinuteThreshold: 100
        }
    },

    // Logging Settings
    logging: {
        enabled: true,
        level: 'info', // 'debug', 'info', 'warn', 'error'
        outputDir: './logs',
        maxFileSize: '10MB'
    },

    // Alert Settings
    alerts: {
        enabled: true,
        methods: ['console', 'file'], // future: 'email', 'webhook'
        severity: ['high', 'critical']
    }
};

module.exports = config;
