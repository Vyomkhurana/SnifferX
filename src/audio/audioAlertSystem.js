/**
 * Audio Alert System
 * Plays different sounds for different threat levels
 * Makes SnifferX the ONLY network monitor with audio feedback!
 */

const player = require('play-sound')(opts = {});
const chalk = require('chalk');
const { exec } = require('child_process');
const os = require('os');

class AudioAlertSystem {
    constructor(config) {
        this.enabled = config?.audio?.enabled !== false; // Enabled by default
        this.volume = config?.audio?.volume || 0.7;
        this.soundsPlayed = 0;
        this.lastAlertTime = {};
        this.cooldown = 5000; // 5 seconds between same alert sounds
        this.platform = os.platform();
        
        // Sound frequencies for different threats
        this.sounds = {
            critical: { frequency: 1000, duration: 500, pattern: [1, 1, 1] }, // Fast beeps
            high: { frequency: 800, duration: 400, pattern: [1, 0.5, 1] },    // Medium beeps
            medium: { frequency: 600, duration: 300, pattern: [1] },           // Single beep
            low: { frequency: 400, duration: 200, pattern: [1] }               // Soft beep
        };
        
        console.log(chalk.green(`🔊 Audio Alert System initialized (${this.platform})`));
    }

    /**
     * Play a beep sound - cross-platform
     */
    playBeep(frequency, duration) {
        if (!this.enabled) return;

        try {
            if (this.platform === 'win32') {
                // Windows: Use PowerShell [Console]::Beep
                const command = `powershell -c "[Console]::Beep(${frequency}, ${duration})"`;
                exec(command, (error) => {
                    if (error) {
                        // Fallback to console beep
                        process.stdout.write('\x07');
                    }
                });
            } else if (this.platform === 'darwin') {
                // macOS: Use afplay with system sound
                exec('afplay /System/Library/Sounds/Ping.aiff', () => {});
            } else {
                // Linux: Use beep command or console beep
                exec(`beep -f ${frequency} -l ${duration}`, (error) => {
                    if (error) {
                        process.stdout.write('\x07');
                    }
                });
            }
        } catch (error) {
            // Ultimate fallback
            process.stdout.write('\x07');
        }
    }

    /**
     * Play alert sound based on threat type and severity
     */
    playAlert(threatType, severity = 'high') {
        if (!this.enabled) return;

        // Check cooldown
        const now = Date.now();
        const key = `${threatType}_${severity}`;
        
        if (this.lastAlertTime[key] && (now - this.lastAlertTime[key]) < this.cooldown) {
            return; // Skip if too soon
        }

        this.lastAlertTime[key] = now;
        this.soundsPlayed++;

        // Play sound based on threat type
        switch(threatType) {
            case 'ddos':
                this.playDDoSAlarm(severity);
                break;
            case 'port_scan':
                this.playPortScanAlert(severity);
                break;
            case 'ip_spoofing':
                this.playSpoofingAlert(severity);
                break;
            case 'user_behavior':
                this.playBehaviorAlert(severity);
                break;
            default:
                this.playGenericAlert(severity);
        }
    }

    /**
     * DDoS Attack Alarm - Rapid beeps (CRITICAL)
     */
    playDDoSAlarm(severity) {
        console.log(chalk.red('🚨 [AUDIO] DDoS ALARM TRIGGERED!'));
        
        // Rapid beeping pattern
        this.playBeep(1000, 200); // High pitch, short
        setTimeout(() => this.playBeep(1000, 200), 300);
        setTimeout(() => this.playBeep(1000, 200), 600);
        setTimeout(() => this.playBeep(1200, 400), 1000); // Final long beep
        
        // Voice alert (text-to-speech simulation)
        setTimeout(() => {
            console.log(chalk.red.bold('🔊 AUDIO: "D-D-o-S Attack Detected! High Traffic Volume!"'));
        }, 1500);
    }

    /**
     * Port Scan Alert - Medium beeps
     */
    playPortScanAlert(severity) {
        console.log(chalk.yellow('⚠️  [AUDIO] Port Scan Alert!'));
        
        this.playBeep(800, 300);
        setTimeout(() => this.playBeep(600, 300), 400);
        
        setTimeout(() => {
            console.log(chalk.yellow.bold('🔊 AUDIO: "Port Scanning Detected!"'));
        }, 800);
    }

    /**
     * IP Spoofing Alert - Warbling sound
     */
    playSpoofingAlert(severity) {
        console.log(chalk.magenta('🎭 [AUDIO] Spoofing Alert!'));
        
        this.playBeep(700, 200);
        setTimeout(() => this.playBeep(900, 200), 250);
        setTimeout(() => this.playBeep(700, 200), 500);
        
        setTimeout(() => {
            console.log(chalk.magenta.bold('🔊 AUDIO: "I-P Spoofing Detected!"'));
        }, 800);
    }

    /**
     * User Behavior Alert - Soft alert
     */
    playBehaviorAlert(severity) {
        console.log(chalk.cyan('👤 [AUDIO] Behavioral Anomaly Alert!'));
        
        this.playBeep(600, 400);
        
        setTimeout(() => {
            console.log(chalk.cyan.bold('🔊 AUDIO: "Unusual User Behavior Detected!"'));
        }, 500);
    }

    /**
     * Generic alert
     */
    playGenericAlert(severity) {
        const freq = severity === 'critical' ? 1000 : severity === 'high' ? 800 : 600;
        this.playBeep(freq, 300);
    }

    /**
     * Play victory sound (when threat is blocked)
     */
    playVictorySound() {
        console.log(chalk.green('🎉 [AUDIO] Threat Blocked!'));
        this.playBeep(500, 100);
        setTimeout(() => this.playBeep(600, 100), 150);
        setTimeout(() => this.playBeep(700, 100), 300);
        setTimeout(() => this.playBeep(800, 200), 450);
    }

    /**
     * Play startup sound
     */
    playStartupSound() {
        if (!this.enabled) return;
        
        console.log(chalk.cyan('🎵 [AUDIO] SnifferX Online'));
        this.playBeep(440, 150); // A note
        setTimeout(() => this.playBeep(554, 150), 200); // C# note
        setTimeout(() => this.playBeep(659, 200), 400); // E note
    }

    /**
     * Play shutdown sound
     */
    playShutdownSound() {
        if (!this.enabled) return;
        
        console.log(chalk.cyan('🎵 [AUDIO] SnifferX Shutting Down'));
        this.playBeep(659, 150);
        setTimeout(() => this.playBeep(554, 150), 200);
        setTimeout(() => this.playBeep(440, 200), 400);
    }

    /**
     * Emergency alarm (multiple threats)
     */
    playEmergencyAlarm() {
        console.log(chalk.red.bold('🚨🚨🚨 [AUDIO] EMERGENCY - MULTIPLE THREATS! 🚨🚨🚨'));
        
        // Siren pattern
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                this.playBeep(800, 200);
                setTimeout(() => this.playBeep(1200, 200), 250);
            }, i * 600);
        }
        
        setTimeout(() => {
            console.log(chalk.red.bold('🔊 AUDIO: "EMERGENCY! Multiple Attack Vectors Detected!"'));
        }, 2000);
    }

    /**
     * Get statistics
     */
    getStats() {
        return {
            enabled: this.enabled,
            soundsPlayed: this.soundsPlayed
        };
    }

    /**
     * Enable/disable audio
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        console.log(chalk.cyan(`🔊 Audio alerts ${enabled ? 'enabled' : 'disabled'}`));
    }

    /**
     * Test all sounds
     */
    testAllSounds() {
        console.log(chalk.cyan.bold('\n🎵 Testing Audio Alert System...\n'));
        
        console.log(chalk.cyan('Testing DDoS alarm...'));
        this.playDDoSAlarm('critical');
        
        setTimeout(() => {
            console.log(chalk.cyan('\nTesting Port Scan alert...'));
            this.playPortScanAlert('high');
        }, 2500);
        
        setTimeout(() => {
            console.log(chalk.cyan('\nTesting Spoofing alert...'));
            this.playSpoofingAlert('medium');
        }, 4500);
        
        setTimeout(() => {
            console.log(chalk.cyan('\nTesting Behavior alert...'));
            this.playBehaviorAlert('low');
        }, 6500);
        
        setTimeout(() => {
            console.log(chalk.green.bold('\n✅ Audio test complete!\n'));
        }, 8500);
    }
}

module.exports = AudioAlertSystem;
