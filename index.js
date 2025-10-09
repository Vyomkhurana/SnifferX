/**
 * SnifferX - Network Traffic Analyzer
 * A cybersecurity tool for capturing and analyzing network traffic
 * Features: Packet capture, DDoS detection, IP spoofing detection, and more
 * 
 * @author Vyom Khurana
 * @version 1.0.0
 */

const chalk = require('chalk');
const { Command } = require('commander');
const config = require('./config');
const utils = require('./utils');
const fs = require('fs-extra');

// Create CLI program
const program = new Command();

/**
 * Display ASCII banner
 */
const displayBanner = () => {
    console.log(chalk.cyan.bold('\n╔════════════════════════════════════════════════════════╗'));
    console.log(chalk.cyan.bold('║                                                        ║'));
    console.log(chalk.cyan.bold('║    ███████╗███╗   ██╗██╗███████╗███████╗███████╗██████╗ ║'));
    console.log(chalk.cyan.bold('║    ██╔════╝████╗  ██║██║██╔════╝██╔════╝██╔════╝██╔══██╗║'));
    console.log(chalk.cyan.bold('║    ███████╗██╔██╗ ██║██║█████╗  █████╗  █████╗  ██████╔╝║'));
    console.log(chalk.cyan.bold('║    ╚════██║██║╚██╗██║██║██╔══╝  ██╔══╝  ██╔══╝  ██╔══██╗║'));
    console.log(chalk.cyan.bold('║    ███████║██║ ╚████║██║██║     ██║     ███████╗██║  ██║║'));
    console.log(chalk.cyan.bold('║    ╚══════╝╚═╝  ╚═══╝╚═╝╚═╝     ╚═╝     ╚══════╝╚═╝  ╚═╝║'));
    console.log(chalk.cyan.bold('║                                                        ║'));
    console.log(chalk.cyan.bold('║           Network Traffic Analyzer v1.0.0            ║'));
    console.log(chalk.cyan.bold('╚════════════════════════════════════════════════════════╝\n'));
    
    console.log(chalk.gray(`  Version: ${config.app.version}`));
    console.log(chalk.gray(`  Author: ${config.app.author}`));
    console.log(chalk.gray(`  GitHub: ${config.app.github}`));
    console.log(chalk.green('  Status: ✓ Project Initialized'));
    console.log(chalk.gray(`  Started: ${utils.getFormattedTimestamp()}\n`));
};

/**
 * Display planned features
 */
const displayFeatures = () => {
    console.log(chalk.yellow.bold('🔍 Planned Features:\n'));
    
    const features = [
        { icon: '📡', name: 'Network packet capture', status: 'planned' },
        { icon: '⚡', name: 'Real-time traffic analysis', status: 'planned' },
        { icon: '🛡️', name: 'DDoS attack detection', status: 'planned' },
        { icon: '🎭', name: 'IP spoofing detection', status: 'planned' },
        { icon: '⚠️', name: 'Suspicious activity monitoring', status: 'planned' },
        { icon: '📊', name: 'Traffic visualization', status: 'planned' },
        { icon: '🔍', name: 'Port scanning detection', status: 'planned' },
        { icon: '🔬', name: 'Protocol analysis', status: 'planned' }
    ];
    
    features.forEach(feature => {
        const statusText = feature.status === 'active' 
            ? chalk.green('✓ Active') 
            : chalk.yellow('○ Planned');
        console.log(`  ${feature.icon}  ${chalk.white(feature.name.padEnd(35))} ${statusText}`);
    });
    console.log('');
};

/**
 * Display current configuration
 */
const displayConfiguration = () => {
    console.log(chalk.magenta.bold('⚙️  Configuration:\n'));
    
    const configItems = [
        { 
            name: 'DDoS Detection', 
            enabled: config.detection.ddos.enabled,
            details: `Threshold: ${config.detection.ddos.packetsPerSecondThreshold} pps`
        },
        { 
            name: 'IP Spoofing Detection', 
            enabled: config.detection.ipSpoofing.enabled,
            details: `TTL Check: ${config.detection.ipSpoofing.checkTTL ? 'Yes' : 'No'}`
        },
        { 
            name: 'Port Scanning Detection', 
            enabled: config.detection.portScanning.enabled,
            details: `Threshold: ${config.detection.portScanning.portsPerMinuteThreshold} ports/min`
        },
        { 
            name: 'Suspicious Activity', 
            enabled: config.detection.suspiciousActivity.enabled,
            details: `Protocols: ${config.detection.suspiciousActivity.monitorProtocols.join(', ')}`
        },
        { 
            name: 'Logging', 
            enabled: config.logging.enabled,
            details: `Level: ${config.logging.level}`
        }
    ];
    
    configItems.forEach(item => {
        const status = item.enabled 
            ? chalk.green('✓ Enabled') 
            : chalk.red('✗ Disabled');
        console.log(`  → ${chalk.white(item.name.padEnd(30))} ${status}`);
        console.log(chalk.gray(`     ${item.details}`));
    });
    console.log('');
};

/**
 * Display system requirements and setup info
 */
const displaySystemInfo = () => {
    console.log(chalk.blue.bold('💻 System Information:\n'));
    console.log(chalk.gray(`  → Node Version: ${process.version}`));
    console.log(chalk.gray(`  → Platform: ${process.platform}`));
    console.log(chalk.gray(`  → Architecture: ${process.arch}`));
    console.log('');
};

/**
 * Display usage instructions
 */
const displayUsage = () => {
    console.log(chalk.cyan.bold('📖 Usage:\n'));
    console.log(chalk.white('  Run in standard mode:'));
    console.log(chalk.gray('    npm start\n'));
    console.log(chalk.white('  View help:'));
    console.log(chalk.gray('    node index.js --help\n'));
    console.log(chalk.white('  Check version:'));
    console.log(chalk.gray('    node index.js --version\n'));
};

/**
 * Initialize application directories
 */
const initializeDirectories = async () => {
    utils.log('info', 'Initializing application directories...');
    
    try {
        await utils.ensureDir(config.logging.outputDir);
        await utils.ensureDir(config.analysis.exportDir);
        utils.log('success', 'All directories created successfully');
    } catch (error) {
        utils.log('error', `Failed to initialize directories: ${error.message}`);
        throw error;
    }
};

/**
 * Display disclaimer
 */
const displayDisclaimer = () => {
    console.log(chalk.red.bold('\n⚠️  IMPORTANT DISCLAIMER:\n'));
    console.log(chalk.yellow('  This tool is for EDUCATIONAL and AUTHORIZED security testing purposes only.'));
    console.log(chalk.yellow('  Unauthorized network monitoring or packet capture may be illegal.'));
    console.log(chalk.yellow('  Always obtain proper authorization before use.'));
    console.log(chalk.yellow('  The author is not responsible for misuse of this software.\n'));
};

/**
 * Main application entry point
 */
const main = async () => {
    try {
        // Display welcome screen
        displayBanner();
        displaySystemInfo();
        displayFeatures();
        displayConfiguration();
        displayUsage();
        
        // Initialize directories
        await initializeDirectories();
        
        // Display success message
        utils.log('success', 'SnifferX initialized successfully!');
        utils.log('info', 'All systems operational and ready');
        
        // Display disclaimer
        displayDisclaimer();
        
        // Ready for next development phase
        console.log(chalk.green.bold('✓ Ready for implementation phase\n'));
        console.log(chalk.cyan('Next steps:'));
        console.log(chalk.gray('  1. Implement packet capture module'));
        console.log(chalk.gray('  2. Add detection algorithms'));
        console.log(chalk.gray('  3. Create analysis engine'));
        console.log(chalk.gray('  4. Build visualization dashboard\n'));
        
    } catch (error) {
        utils.log('error', `Failed to initialize: ${error.message}`);
        process.exit(1);
    }
};

// Configure CLI
program
    .name('snifferx')
    .description('Network Traffic Analyzer for cybersecurity analysis')
    .version(config.app.version);

program
    .command('start')
    .description('Start SnifferX in monitoring mode')
    .action(() => {
        main();
    });

// Default action
if (process.argv.length === 2) {
    main();
} else {
    program.parse(process.argv);
}
