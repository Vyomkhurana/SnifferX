/**
 * SnifferX Utility Functions
 * Helper functions for network analysis
 */

/**
 * Get current timestamp in formatted string
 * @returns {string} Formatted timestamp
 */
const getTimestamp = () => {
    const now = new Date();
    return now.toISOString();
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
 * Log message with timestamp
 * @param {string} level - Log level (info, warn, error)
 * @param {string} message - Message to log
 */
const log = (level, message) => {
    const timestamp = getTimestamp();
    const prefix = {
        info: 'ℹ️ ',
        warn: '⚠️ ',
        error: '❌',
        success: '✅'
    };
    console.log(`[${timestamp}] ${prefix[level] || ''} ${message}`);
};

module.exports = {
    getTimestamp,
    formatBytes,
    isValidIP,
    log
};
