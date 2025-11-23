/**
 * Backend Integration Module for SnifferX
 * Supports webhooks, REST APIs, and real-time data streaming
 */

const https = require('https');
const http = require('http');
const chalk = require('chalk');

class BackendIntegration {
    constructor(config) {
        this.config = config;
        this.enabled = config.backend?.enabled || false;
        this.endpoints = config.backend?.endpoints || {};
        this.apiKey = config.backend?.apiKey || '';
        this.retryAttempts = config.backend?.retryAttempts || 3;
        this.timeout = config.backend?.timeout || 5000;
        this.queue = [];
        this.isProcessing = false;
        this.stats = {
            sent: 0,
            failed: 0,
            queued: 0
        };
    }

    /**
     * Send alert to backend webhook
     */
    async sendAlert(alertData) {
        if (!this.enabled) return;

        const payload = {
            type: 'alert',
            timestamp: new Date().toISOString(),
            sessionId: alertData.sessionId,
            threat: {
                type: alertData.threatType,
                severity: alertData.severity,
                source: alertData.source,
                details: alertData.details,
                timestamp: alertData.timestamp
            },
            metadata: {
                snifferxVersion: alertData.version,
                platform: process.platform,
                interface: alertData.interface
            }
        };

        await this._sendToWebhook('alerts', payload);
    }

    /**
     * Send session statistics to backend
     */
    async sendSessionStats(sessionData) {
        if (!this.enabled) return;

        const payload = {
            type: 'session_stats',
            timestamp: new Date().toISOString(),
            session: sessionData
        };

        await this._sendToWebhook('stats', payload);
    }

    /**
     * Stream real-time packet data
     */
    async streamPacketData(packetInfo) {
        if (!this.enabled || !this.endpoints.stream) return;

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
        if (!this.enabled) return;

        const payload = {
            type: 'threat_detected',
            timestamp: new Date().toISOString(),
            threat: {
                id: `threat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                type: threat.type,
                severity: threat.severity,
                source: threat.source,
                destination: threat.destination,
                details: threat.details,
                confidence: threat.confidence || 'high'
            }
        };

        await this._sendToWebhook('threats', payload);
    }

    /**
     * Internal method to send data to webhook
     */
    async _sendToWebhook(endpointType, payload) {
        const endpoint = this.endpoints[endpointType];
        if (!endpoint) {
            console.log(chalk.yellow(`[Backend] No ${endpointType} endpoint configured`));
            return;
        }

        let attempts = 0;
        while (attempts < this.retryAttempts) {
            try {
                await this._makeHttpRequest(endpoint, payload);
                this.stats.sent++;
                
                if (attempts > 0) {
                    console.log(chalk.green(`[Backend] Successfully sent after ${attempts + 1} attempts`));
                }
                return;
            } catch (error) {
                attempts++;
                if (attempts >= this.retryAttempts) {
                    this.stats.failed++;
                    console.log(chalk.red(`[Backend] Failed to send to ${endpoint}: ${error.message}`));
                } else {
                    // Wait before retry (exponential backoff)
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
                }
            }
        }
    }

    /**
     * Make HTTP request to backend
     */
    _makeHttpRequest(url, payload) {
        return new Promise((resolve, reject) => {
            const parsedUrl = new URL(url);
            const isHttps = parsedUrl.protocol === 'https:';
            const httpModule = isHttps ? https : http;

            const options = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port || (isHttps ? 443 : 80),
                path: parsedUrl.pathname + parsedUrl.search,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'SnifferX/1.2.0',
                    'X-API-Key': this.apiKey
                },
                timeout: this.timeout
            };

            const req = httpModule.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve({ statusCode: res.statusCode, data });
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });

            req.write(JSON.stringify(payload));
            req.end();
        });
    }

    /**
     * Process queued packets in batches
     */
    async _processQueue() {
        if (this.isProcessing || this.queue.length === 0) return;

        this.isProcessing = true;

        try {
            // Process in batches of 10
            const batch = this.queue.splice(0, 10);
            this.stats.queued -= batch.length;

            if (this.endpoints.stream) {
                await this._sendToWebhook('stream', {
                    type: 'packet_batch',
                    timestamp: new Date().toISOString(),
                    packets: batch
                });
            }

            // Continue processing if there are more items
            if (this.queue.length > 0) {
                setTimeout(() => this._processQueue(), 1000);
            } else {
                this.isProcessing = false;
            }
        } catch (error) {
            console.log(chalk.red('[Backend] Queue processing error: ' + error.message));
            this.isProcessing = false;
        }
    }

    /**
     * Get integration statistics
     */
    getStats() {
        return {
            enabled: this.enabled,
            sent: this.stats.sent,
            failed: this.stats.failed,
            queued: this.stats.queued,
            successRate: this.stats.sent > 0 
                ? ((this.stats.sent / (this.stats.sent + this.stats.failed)) * 100).toFixed(2) + '%'
                : 'N/A'
        };
    }

    /**
     * Test backend connection
     */
    async testConnection() {
        if (!this.enabled) {
            return { success: false, message: 'Backend integration is disabled' };
        }

        try {
            const testPayload = {
                type: 'test',
                timestamp: new Date().toISOString(),
                message: 'SnifferX connection test'
            };

            const endpoint = this.endpoints.alerts || this.endpoints.stats;
            if (!endpoint) {
                return { success: false, message: 'No endpoints configured' };
            }

            await this._makeHttpRequest(endpoint, testPayload);
            return { success: true, message: 'Connection successful' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    /**
     * Flush remaining queue before shutdown
     */
    async flush() {
        if (this.queue.length > 0) {
            console.log(chalk.yellow(`[Backend] Flushing ${this.queue.length} queued items...`));
            await this._processQueue();
        }
    }
}

module.exports = BackendIntegration;
