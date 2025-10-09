/**
 * SnifferX Utility Functions
 * Helper functions for network analysis
 */

const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');

/**
 * Get current timestamp in formatted string
 * @returns {string} Formatted timestamp
 */
const getTimestamp = () => {
    const now = new Date();
    return now.toISOString();
};

/**
 * Get formatted timestamp for display
 * @returns {string} Formatted timestamp (YYYY-MM-DD HH:mm:ss)
 */
const getFormattedTimestamp = () => {
    const now = new Date();
    return now.toISOString().replace('T', ' ').substr(0, 19);
};

/**
 * Calculate time difference in milliseconds
 * @param {Date} start - Start time
 * @param {Date} end - End time
 * @returns {number} Time difference in ms
 */
const getTimeDiff = (start, end) => {
    return end.getTime() - start.getTime();
};

/**
 * Format bytes to human readable format
 * @param {number} bytes - Number of bytes
 * @returns {string} Formatted string (e.g., "1.5 MB")
 */
const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Validate IP address format
 * @param {string} ip - IP address to validate
 * @returns {boolean} True if valid IP address
 */
const isValidIP = (ip) => {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip)) return false;
    
    const parts = ip.split('.');
    return parts.every(part => {
        const num = parseInt(part, 10);
        return num >= 0 && num <= 255;
    });
};

/**
 * Validate MAC address format
 * @param {string} mac - MAC address to validate
 * @returns {boolean} True if valid MAC address
 */
const isValidMAC = (mac) => {
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    return macRegex.test(mac);
};

/**
 * Convert IP address to integer
 * @param {string} ip - IP address
 * @returns {number} Integer representation
 */
const ipToInt = (ip) => {
    const parts = ip.split('.');
    return ((parseInt(parts[0]) << 24) +
            (parseInt(parts[1]) << 16) +
            (parseInt(parts[2]) << 8) +
            parseInt(parts[3])) >>> 0;
};

/**
 * Convert integer to IP address
 * @param {number} int - Integer value
 * @returns {string} IP address
 */
const intToIp = (int) => {
    return [
        (int >>> 24) & 0xFF,
        (int >>> 16) & 0xFF,
        (int >>> 8) & 0xFF,
        int & 0xFF
    ].join('.');
};

/**
 * Log message with timestamp and colors
 * @param {string} level - Log level (info, warn, error, success, debug)
 * @param {string} message - Message to log
 */
const log = (level, message) => {
    const timestamp = getFormattedTimestamp();
    const prefix = {
        info: chalk.blue('ℹ️  INFO'),
        warn: chalk.yellow('⚠️  WARN'),
        error: chalk.red('❌ ERROR'),
        success: chalk.green('✅ SUCCESS'),
        debug: chalk.gray('🔍 DEBUG')
    };
    
    const levelText = prefix[level] || chalk.white('LOG');
    console.log(`${chalk.gray(`[${timestamp}]`)} ${levelText}: ${message}`);
};

/**
 * Create directory if it doesn't exist
 * @param {string} dirPath - Directory path
 */
const ensureDir = async (dirPath) => {
    try {
        await fs.ensureDir(dirPath);
    } catch (error) {
        log('error', `Failed to create directory ${dirPath}: ${error.message}`);
    }
};

/**
 * Write data to JSON file
 * @param {string} filePath - File path
 * @param {Object} data - Data to write
 */
const writeJsonFile = async (filePath, data) => {
    try {
        await fs.writeJson(filePath, data, { spaces: 2 });
        log('success', `Data written to ${filePath}`);
    } catch (error) {
        log('error', `Failed to write file ${filePath}: ${error.message}`);
    }
};

/**
 * Display a colored banner
 * @param {string} text - Text to display
 * @param {string} color - Color name (optional)
 */
const displayBanner = (text, color = 'cyan') => {
    const colorFn = chalk[color] || chalk.cyan;
    console.log(colorFn.bold(text));
};

/**
 * Format duration in milliseconds to human readable
 * @param {number} ms - Milliseconds
 * @returns {string} Formatted duration
 */
const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
};

/**
 * Calculate packet rate (packets per second)
 * @param {number} packetCount - Total packets
 * @param {number} duration - Duration in milliseconds
 * @returns {number} Packets per second
 */
const calculatePacketRate = (packetCount, duration) => {
    return Math.round((packetCount / (duration / 1000)) * 100) / 100;
};

module.exports = {
    getTimestamp,
    getFormattedTimestamp,
    getTimeDiff,
    formatBytes,
    formatDuration,
    isValidIP,
    isValidMAC,
    ipToInt,
    intToIp,
    log,
    ensureDir,
    writeJsonFile,
    displayBanner,
    calculatePacketRate
};
