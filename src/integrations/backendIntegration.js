/**
 * Backend Integration Module for SnifferX
 * Supports webhooks, REST APIs, and real-time data streaming
 * Enhanced with robust error handling, validation, and monitoring
 */

const https = require('https');
const http = require('http');
const chalk = require('chalk');
const EventEmitter = require('events');

class BackendIntegration extends EventEmitter {
    constructor(config) {
        super();
        this.config = config;
        this.enabled = config.backend?.enabled || false;
        this.endpoints = config.backend?.endpoints || {};
        this.apiKey = config.backend?.apiKey || '';
        this.retryAttempts = config.backend?.retryAttempts || 3;
        this.timeout = config.backend?.timeout || 5000;
        this.queue = [];
        this.isProcessing = false;
        this.maxQueueSize = 1000; // Prevent memory overflow
        this.batchSize = 10;
        this.batchDelay = 1000;
        this.stats = {
            sent: 0,
            failed: 0,
            queued: 0,
            retried: 0,
            dropped: 0,
            startTime: Date.now()
        };
        
        // Validate configuration on initialization
        this._validateConfig();
        
        if (this.enabled) {
            console.log(chalk.green('[Backend] Integration enabled and initialized'));
            this.emit('initialized');
        }
    }

    /**
     * Validate backend configuration
     */
    _validateConfig() {
        if (!this.enabled) return;

        const warnings = [];
        
        if (!this.apiKey) {
            warnings.push('No API key configured - authentication may fail');
        }
        
        if (Object.keys(this.endpoints).length === 0) {
            warnings.push('No endpoints configured');
            this.enabled = false;
        }
        
        // Validate endpoint URLs
        Object.entries(this.endpoints).forEach(([key, url]) => {
            if (url && !this._isValidUrl(url)) {
                warnings.push(`Invalid URL for ${key}: ${url}`);
            }
        });
        
        if (warnings.length > 0) {
            console.log(chalk.yellow('[Backend] Configuration warnings:'));
            warnings.forEach(w => console.log(chalk.yellow(`  - ${w}`)));
        }
    }

    /**
     * Validate URL format
     */
    _isValidUrl(urlString) {
        try {
            const url = new URL(urlString);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch {
            return false;
        }
    }

    /**
     * Send alert to backend webhook
     */
    async sendAlert(alertData) {
        if (!this.enabled) return { success: false, reason: 'Integration disabled' };

        try {
            // Validate required fields
            if (!alertData || !alertData.threatType || !alertData.severity) {
                throw new Error('Invalid alert data: missing required fields');
            }

            const payload = {
                type: 'alert',
                timestamp: new Date().toISOString(),
                sessionId: alertData.sessionId || `session-${Date.now()}`,
                threat: {
                    type: alertData.threatType,
                    severity: alertData.severity,
                    source: alertData.source || 'unknown',
                    details: alertData.details || {},
                    timestamp: alertData.timestamp || new Date().toISOString()
                },
                metadata: {
                    snifferxVersion: alertData.version || this.config.app?.version || '1.3.0',
                    platform: process.platform,
                    interface: alertData.interface || 'default',
                    hostname: require('os').hostname()
                }
            };

            const result = await this._sendToWebhook('alerts', payload);
            this.emit('alert:sent', payload);
            return result;
        } catch (error) {
            console.log(chalk.red(`[Backend] Failed to send alert: ${error.message}`));
            this.emit('alert:failed', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send session statistics to backend
     */
    async sendSessionStats(sessionData) {
        if (!this.enabled) return { success: false, reason: 'Integration disabled' };

        try {
            if (!sessionData) {
                throw new Error('No session data provided');
            }

            const payload = {
                type: 'session_stats',
                timestamp: new Date().toISOString(),
                session: {
                    ...sessionData,
                    integrationStats: this.getStats()
                }
            };

            const result = await this._sendToWebhook('stats', payload);
            this.emit('stats:sent', payload);
            return result;
        } catch (error) {
            console.log(chalk.red(`[Backend] Failed to send session stats: ${error.message}`));
            this.emit('stats:failed', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Stream real-time packet data
     */
    async streamPacketData(packetInfo) {
        if (!this.enabled || !this.endpoints.stream) return;

        // Check queue size limit
        if (this.queue.length >= this.maxQueueSize) {
            this.stats.dropped++;
            console.log(chalk.yellow(`[Backend] Queue full (${this.maxQueueSize}), dropping packet`));
            this.emit('queue:overflow', { dropped: this.stats.dropped });
            return;
        }

        // Add to queue to prevent overwhelming the backend
        this.queue.push({
            type: 'packet',
            data: packetInfo,
            timestamp: Date.now()
        });
        
        this.stats.queued++;

        // Process queue if not already processing
        if (!this.isProcessing && this.queue.length > 0) {
            this._processQueue();
        }
    }

    /**
     * Send threat detection event
     */
    async sendThreatEvent(threat) {
        if (!this.enabled) return { success: false, reason: 'Integration disabled' };

        try {
            if (!threat || !threat.type) {
                throw new Error('Invalid threat data: missing type');
            }

            const payload = {
                type: 'threat_detected',
                timestamp: new Date().toISOString(),
                threat: {
                    id: threat.id || `threat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    type: threat.type,
                    severity: threat.severity || 'medium',
                    source: threat.source || 'unknown',
                    destination: threat.destination || 'unknown',
                    details: threat.details || {},
                    confidence: threat.confidence || 'high',
                    mitigationSuggested: threat.mitigation || null
                }
            };

            const result = await this._sendToWebhook('threats', payload);
            this.emit('threat:sent', payload);
            return result;
        } catch (error) {
            console.log(chalk.red(`[Backend] Failed to send threat event: ${error.message}`));
            this.emit('threat:failed', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Internal method to send data to webhook
     */
    async _sendToWebhook(endpointType, payload) {
        const endpoint = this.endpoints[endpointType];
        if (!endpoint) {
            console.log(chalk.yellow(`[Backend] No ${endpointType} endpoint configured`));
            return { success: false, reason: 'No endpoint configured' };
        }

        let attempts = 0;
        let lastError = null;

        while (attempts < this.retryAttempts) {
            try {
                const response = await this._makeHttpRequest(endpoint, payload);
                this.stats.sent++;
                
                if (attempts > 0) {
                    this.stats.retried++;
                    console.log(chalk.green(`[Backend] Successfully sent after ${attempts + 1} attempts`));
                }
                
                return { success: true, statusCode: response.statusCode, attempts: attempts + 1 };
            } catch (error) {
                lastError = error;
                attempts++;
                
                if (attempts >= this.retryAttempts) {
                    this.stats.failed++;
                    console.log(chalk.red(`[Backend] Failed to send to ${endpointType} after ${attempts} attempts: ${error.message}`));
                    this.emit('request:failed', { endpointType, error, attempts });
                } else {
                    this.stats.retried++;
                    // Wait before retry (exponential backoff with jitter)
                    const backoffTime = Math.pow(2, attempts) * 1000 + Math.random() * 500;
                    console.log(chalk.yellow(`[Backend] Retry ${attempts}/${this.retryAttempts} in ${Math.round(backoffTime)}ms...`));
                    await new Promise(resolve => setTimeout(resolve, backoffTime));
                }
            }
        }
        
        return { success: false, error: lastError?.message, attempts };
    }

    /**
     * Make HTTP request to backend
     */
    _makeHttpRequest(url, payload) {
        return new Promise((resolve, reject) => {
            try {
                const parsedUrl = new URL(url);
                const isHttps = parsedUrl.protocol === 'https:';
                const httpModule = isHttps ? https : http;

                const payloadString = JSON.stringify(payload);
                const contentLength = Buffer.byteLength(payloadString);

                const options = {
                    hostname: parsedUrl.hostname,
                    port: parsedUrl.port || (isHttps ? 443 : 80),
                    path: parsedUrl.pathname + parsedUrl.search,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': contentLength,
                        'User-Agent': `SnifferX/${this.config.app?.version || '1.3.0'}`,
                        'X-API-Key': this.apiKey,
                        'X-SnifferX-Timestamp': Date.now().toString(),
                        'Accept': 'application/json'
                    },
                    timeout: this.timeout
                };

                const req = httpModule.request(options, (res) => {
                    let data = '';
                    const maxResponseSize = 1024 * 1024; // 1MB limit

                    res.on('data', (chunk) => {
                        data += chunk;
                        // Prevent memory overflow from large responses
                        if (data.length > maxResponseSize) {
                            req.destroy();
                            reject(new Error('Response too large'));
                        }
                    });

                    res.on('end', () => {
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            resolve({ 
                                statusCode: res.statusCode, 
                                data,
                                headers: res.headers 
                            });
                        } else {
                            reject(new Error(`HTTP ${res.statusCode}: ${data || res.statusMessage}`));
                        }
                    });
                });

                req.on('error', (error) => {
                    reject(new Error(`Request error: ${error.message}`));
                });

                req.on('timeout', () => {
                    req.destroy();
                    reject(new Error(`Request timeout after ${this.timeout}ms`));
                });

                req.write(payloadString);
                req.end();
            } catch (error) {
                reject(new Error(`Failed to create request: ${error.message}`));
            }
        });
    }

    /**
     * Process queued packets in batches
     */
    async _processQueue() {
        if (this.isProcessing || this.queue.length === 0) return;

        this.isProcessing = true;

        try {
            // Process in configurable batches
            const batch = this.queue.splice(0, this.batchSize);
            this.stats.queued -= batch.length;

            if (this.endpoints.stream) {
                const result = await this._sendToWebhook('stream', {
                    type: 'packet_batch',
                    timestamp: new Date().toISOString(),
                    batchSize: batch.length,
                    packets: batch,
                    queueRemaining: this.queue.length
                });
                
                if (result.success) {
                    this.emit('batch:sent', { size: batch.length, remaining: this.queue.length });
                }
            }

            // Continue processing if there are more items
            if (this.queue.length > 0) {
                setTimeout(() => this._processQueue(), this.batchDelay);
            } else {
                this.isProcessing = false;
                this.emit('queue:empty');
            }
        } catch (error) {
            console.log(chalk.red('[Backend] Queue processing error: ' + error.message));
            this.isProcessing = false;
            this.emit('queue:error', error);
            
            // Retry processing after a delay
            if (this.queue.length > 0) {
                setTimeout(() => {
                    this.isProcessing = false;
                    this._processQueue();
                }, 5000);
            }
        }
    }

    /**
     * Get integration statistics
     */
    getStats() {
        const totalRequests = this.stats.sent + this.stats.failed;
        const uptime = Date.now() - this.stats.startTime;
        const uptimeMinutes = Math.floor(uptime / 60000);
        
        return {
            enabled: this.enabled,
            sent: this.stats.sent,
            failed: this.stats.failed,
            retried: this.stats.retried,
            dropped: this.stats.dropped,
            queued: this.stats.queued,
            queueSize: this.queue.length,
            successRate: totalRequests > 0 
                ? ((this.stats.sent / totalRequests) * 100).toFixed(2) + '%'
                : 'N/A',
            requestsPerMinute: uptimeMinutes > 0
                ? (totalRequests / uptimeMinutes).toFixed(2)
                : '0',
            uptime: uptimeMinutes > 60 
                ? `${Math.floor(uptimeMinutes / 60)}h ${uptimeMinutes % 60}m`
                : `${uptimeMinutes}m`,
            isProcessing: this.isProcessing
        };
    }

    /**
     * Get detailed statistics with endpoint breakdown
     */
    getDetailedStats() {
        const stats = this.getStats();
        return {
            ...stats,
            config: {
                retryAttempts: this.retryAttempts,
                timeout: this.timeout,
                batchSize: this.batchSize,
                maxQueueSize: this.maxQueueSize
            },
            endpoints: Object.keys(this.endpoints).reduce((acc, key) => {
                acc[key] = this.endpoints[key] ? 'configured' : 'not configured';
                return acc;
            }, {})
        };
    }

    /**
     * Test backend connection for all configured endpoints
     */
    async testConnection() {
        if (!this.enabled) {
            return { success: false, message: 'Backend integration is disabled' };
        }

        const results = {};
        let overallSuccess = false;

        // Test all configured endpoints
        for (const [name, url] of Object.entries(this.endpoints)) {
            if (!url) {
                results[name] = { success: false, message: 'Not configured' };
                continue;
            }

            try {
                const testPayload = {
                    type: 'connection_test',
                    timestamp: new Date().toISOString(),
                    endpoint: name,
                    message: 'SnifferX connection test',
                    version: this.config.app?.version || '1.3.0'
                };

                const startTime = Date.now();
                const response = await this._makeHttpRequest(url, testPayload);
                const responseTime = Date.now() - startTime;

                results[name] = {
                    success: true,
                    statusCode: response.statusCode,
                    responseTime: `${responseTime}ms`,
                    message: 'Connection successful'
                };
                overallSuccess = true;

                console.log(chalk.green(`[Backend] ✓ ${name} endpoint: ${responseTime}ms`));
            } catch (error) {
                results[name] = {
                    success: false,
                    message: error.message
                };
                console.log(chalk.red(`[Backend] ✗ ${name} endpoint: ${error.message}`));
            }
        }

        return {
            success: overallSuccess,
            message: overallSuccess ? 'At least one endpoint is reachable' : 'All endpoints failed',
            endpoints: results,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Flush remaining queue before shutdown
     */
    async flush() {
        if (this.queue.length === 0) {
            console.log(chalk.green('[Backend] Queue already empty'));
            return { success: true, flushed: 0 };
        }

        console.log(chalk.yellow(`[Backend] Flushing ${this.queue.length} queued items...`));
        const initialQueueSize = this.queue.length;
        const maxFlushTime = 30000; // 30 seconds max
        const startTime = Date.now();

        try {
            // Process all remaining items with timeout
            while (this.queue.length > 0 && (Date.now() - startTime) < maxFlushTime) {
                await this._processQueue();
                // Small delay to allow processing to complete
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            const flushed = initialQueueSize - this.queue.length;
            
            if (this.queue.length > 0) {
                console.log(chalk.yellow(`[Backend] Flush timeout: ${this.queue.length} items remaining`));
                return { success: false, flushed, remaining: this.queue.length };
            }

            console.log(chalk.green(`[Backend] Successfully flushed ${flushed} items`));
            return { success: true, flushed };
        } catch (error) {
            console.log(chalk.red(`[Backend] Flush error: ${error.message}`));
            return { success: false, error: error.message };
        }
    }

    /**
     * Clear the queue (emergency use only)
     */
    clearQueue() {
        const cleared = this.queue.length;
        this.queue = [];
        this.stats.queued = 0;
        this.stats.dropped += cleared;
        console.log(chalk.yellow(`[Backend] Cleared ${cleared} queued items`));
        this.emit('queue:cleared', { cleared });
        return { cleared };
    }

    /**
     * Update configuration dynamically
     */
    updateConfig(newConfig) {
        if (newConfig.enabled !== undefined) {
            this.enabled = newConfig.enabled;
        }
        if (newConfig.endpoints) {
            this.endpoints = { ...this.endpoints, ...newConfig.endpoints };
        }
        if (newConfig.apiKey) {
            this.apiKey = newConfig.apiKey;
        }
        if (newConfig.retryAttempts) {
            this.retryAttempts = newConfig.retryAttempts;
        }
        if (newConfig.timeout) {
            this.timeout = newConfig.timeout;
        }
        
        this._validateConfig();
        console.log(chalk.green('[Backend] Configuration updated'));
        this.emit('config:updated', newConfig);
    }

    /**
     * Health check for monitoring
     */
    getHealthStatus() {
        const stats = this.getStats();
        const totalRequests = this.stats.sent + this.stats.failed;
        const failureRate = totalRequests > 0 
            ? (this.stats.failed / totalRequests) * 100 
            : 0;

        let status = 'healthy';
        const issues = [];

        if (!this.enabled) {
            status = 'disabled';
        } else if (failureRate > 50) {
            status = 'unhealthy';
            issues.push('High failure rate');
        } else if (this.queue.length > this.maxQueueSize * 0.8) {
            status = 'degraded';
            issues.push('Queue near capacity');
        } else if (failureRate > 20) {
            status = 'degraded';
            issues.push('Elevated failure rate');
        }

        return {
            status,
            enabled: this.enabled,
            issues,
            stats,
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = BackendIntegration;
