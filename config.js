/**
 * SnifferX Configuration File
 * Settings and configuration for network traffic analysis
 */

const path = require('path');

const config = {
    // Application Information
    app: {
        name: 'SnifferX',
        version: '1.3.0',
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
            packetsPerSecondThreshold: 300,  // Lowered from 500 for easier testing
            connectionThreshold: 200,        // Lowered from 300 for easier testing
            timeWindow: 5,                   // Shortened from 60 to 5 seconds for faster detection
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
        },
        userBehavior: {
            enabled: true,
            learningPeriod: 3600000,            // 1 hour learning period (in milliseconds)
            dataThresholdMultiplier: 3,         // Alert if data > 3x normal
            connectionThresholdMultiplier: 2.5, // Alert if connections > 2.5x normal
            unusualTimeWindow: 120,             // Minutes for unusual time detection
            minPacketsForProfile: 100,          // Minimum packets to create profile
            riskScoreThreshold: 70,             // Alert if risk score > 70
            exfiltrationThreshold: 10485760     // 10MB in short time = potential exfiltration
        }
    },

    // Audio Alert System (UNIQUE FEATURE!)
    audio: {
        enabled: true,              // Enable/disable audio alerts
        volume: 0.7,                // Volume level (0.0 - 1.0)
        cooldown: 5000,             // Milliseconds between same alert sounds
        playOnStartup: true,        // Play sound when SnifferX starts
        playOnShutdown: true,       // Play sound when SnifferX stops
        emergencyThreshold: 5       // Play emergency alarm if 5+ alerts in 10 seconds
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
    },

    // Backend Integration (NEW IN v1.3.0)
    backend: {
        enabled: false,                     // Enable/disable backend integration
        apiKey: '',                         // API key for authentication (set via environment variable)
        retryAttempts: 3,                   // Number of retry attempts for failed requests
        timeout: 5000,                      // Request timeout in milliseconds
        endpoints: {
            alerts: '',                     // Webhook URL for threat alerts
            stats: '',                      // Endpoint for session statistics
            threats: '',                    // Endpoint for threat detection events
            stream: ''                      // Endpoint for real-time packet streaming (optional)
        }
    }
};

module.exports = config;
