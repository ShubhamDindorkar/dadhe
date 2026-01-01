/**
 * WhatsApp Business Platform - Utility Functions
 * ===============================================
 * Reusable helper functions for the application
 */

const Utils = {
    /**
     * Format a timestamp to a readable time string
     * @param {Date|string|number} timestamp - The timestamp to format
     * @returns {string} Formatted time string (e.g., "09:00 PM")
     */
    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    },

    /**
     * Format a timestamp to ISO format for message metadata
     * @param {Date|string|number} timestamp - The timestamp to format
     * @returns {string} ISO formatted string
     */
    formatISOTime(timestamp) {
        const date = new Date(timestamp);
        return date.toISOString().replace('T', 'T').slice(0, -5) + 'Z';
    },

    /**
     * Format a date to display format
     * @param {Date|string|number} timestamp - The timestamp to format
     * @returns {string} Formatted date string (e.g., "Dec 22, 2025")
     */
    formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    },

    /**
     * Format a number with commas for thousands
     * @param {number} num - The number to format
     * @returns {string} Formatted number string
     */
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    /**
     * Calculate percentage
     * @param {number} part - The part value
     * @param {number} total - The total value
     * @returns {string} Percentage string with one decimal
     */
    calculatePercentage(part, total) {
        if (total === 0) return '0%';
        return ((part / total) * 100).toFixed(1) + '%';
    },

    /**
     * Generate a unique ID
     * @returns {string} Unique ID string
     */
    generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    /**
     * Debounce function to limit function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function to limit function calls
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} Throttled function
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Deep clone an object
     * @param {Object} obj - Object to clone
     * @returns {Object} Cloned object
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    /**
     * Get initials from a name
     * @param {string} name - Full name
     * @returns {string} Initials (2 characters max)
     */
    getInitials(name) {
        return name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .slice(0, 2)
            .join('');
    },

    /**
     * Generate a random color for avatar backgrounds
     * @param {string} seed - Seed string for consistent colors
     * @returns {string} CSS gradient string
     */
    getAvatarGradient(seed) {
        const gradients = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
            'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
        ];
        
        // Generate consistent index from seed
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            hash = seed.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % gradients.length;
        return gradients[index];
    },

    /**
     * Simulate network delay
     * @param {number} min - Minimum delay in ms
     * @param {number} max - Maximum delay in ms
     * @returns {Promise} Promise that resolves after random delay
     */
    simulateDelay(min = 500, max = 1500) {
        const delay = Math.floor(Math.random() * (max - min + 1)) + min;
        return new Promise(resolve => setTimeout(resolve, delay));
    },

    /**
     * Simulate message delivery outcome based on safety settings
     * @param {Object} safetyFlags - Current safety flag settings
     * @returns {string} Outcome: 'delivered', 'failed', or 'blocked'
     */
    simulateMessageOutcome(safetyFlags) {
        // If kill switch is on, all messages are blocked
        if (safetyFlags.killSwitch) {
            return 'blocked';
        }

        // Base probabilities
        let deliveryProb = 0.92;  // 92% delivered
        let failedProb = 0.05;    // 5% failed
        let blockedProb = 0.03;   // 3% blocked

        // Adjust based on safety settings
        if (!safetyFlags.warmupMode) {
            // Higher risk without warmup
            deliveryProb -= 0.05;
            failedProb += 0.03;
            blockedProb += 0.02;
        }

        if (!safetyFlags.rateLimiter) {
            // Higher block rate without rate limiter
            deliveryProb -= 0.03;
            blockedProb += 0.03;
        }

        if (!safetyFlags.optInValidation) {
            // Higher block rate without opt-in validation
            blockedProb += 0.02;
            deliveryProb -= 0.02;
        }

        // Generate random outcome
        const rand = Math.random();
        if (rand < deliveryProb) {
            return 'delivered';
        } else if (rand < deliveryProb + failedProb) {
            return 'failed';
        } else {
            return 'blocked';
        }
    },

    /**
     * Calculate health score based on blocked and failed rates
     * @param {number} blockedRate - Blocked rate percentage
     * @param {number} failedRate - Failed rate percentage
     * @returns {Object} Health score and status
     */
    calculateHealthScore(blockedRate, failedRate) {
        // Start with 100 and deduct based on rates
        let score = 100;
        score -= blockedRate * 10; // Each 1% blocked = -10 points
        score -= failedRate * 5;   // Each 1% failed = -5 points
        
        score = Math.max(0, Math.min(100, Math.round(score)));
        
        let status, statusClass;
        if (score >= 90) {
            status = 'Excellent';
            statusClass = 'excellent';
        } else if (score >= 70) {
            status = 'Good';
            statusClass = 'low-risk';
        } else if (score >= 50) {
            status = 'Monitor Closely';
            statusClass = 'monitor';
        } else {
            status = 'At Risk';
            statusClass = 'danger';
        }

        return { score, status, statusClass };
    },

    /**
     * Determine rate badge class based on percentage
     * @param {number} rate - Rate percentage
     * @returns {string} CSS class for badge
     */
    getRateBadgeClass(rate) {
        if (rate <= 1) return 'low';
        if (rate <= 3) return 'medium';
        return 'high';
    },

    /**
     * Show toast notification
     * @param {string} message - Toast message
     * @param {string} type - Toast type: 'success', 'error', 'warning', 'info'
     * @param {number} duration - Duration in milliseconds
     */
    showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${this.getToastIcon(type)}</span>
            <span class="toast-message">${message}</span>
        `;

        container.appendChild(toast);

        // Auto remove after duration
        setTimeout(() => {
            toast.style.animation = 'slideInRight 0.25s ease reverse';
            setTimeout(() => toast.remove(), 250);
        }, duration);
    },

    /**
     * Get icon for toast type
     * @param {string} type - Toast type
     * @returns {string} Icon emoji
     */
    getToastIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    },

    /**
     * Validate phone number format
     * @param {string} phone - Phone number string
     * @returns {boolean} Is valid phone number
     */
    isValidPhone(phone) {
        const phoneRegex = /^\+?[\d\s-()]{10,}$/;
        return phoneRegex.test(phone);
    },

    /**
     * Truncate text with ellipsis
     * @param {string} text - Text to truncate
     * @param {number} maxLength - Maximum length
     * @returns {string} Truncated text
     */
    truncateText(text, maxLength = 50) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    },

    /**
     * Parse template placeholders
     * @param {string} template - Template string with {{placeholders}}
     * @param {Object} data - Data object with values
     * @returns {string} Parsed template
     */
    parseTemplate(template, data) {
        return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return data[key] !== undefined ? data[key] : match;
        });
    },

    /**
     * Generate mock chart data for specified time range
     * @param {string} range - '24h' or '7d'
     * @returns {Object} Chart data with labels and datasets
     */
    generateChartData(range) {
        const labels = [];
        const sentData = [];
        const deliveredData = [];
        const failedData = [];
        const blockedData = [];

        if (range === '24h') {
            // Generate hourly data for 24 hours
            for (let i = 0; i < 24; i++) {
                labels.push(i.toString().padStart(2, '0'));
                
                // Generate realistic data patterns
                const baseValue = 100 + Math.sin(i / 3) * 50 + Math.random() * 30;
                const sent = Math.round(baseValue + (i > 8 && i < 20 ? 50 : 0));
                const delivered = Math.round(sent * (0.92 + Math.random() * 0.05));
                const failed = Math.round(sent * (0.01 + Math.random() * 0.02));
                const blocked = Math.round(sent * (0.005 + Math.random() * 0.01));

                sentData.push(sent);
                deliveredData.push(delivered);
                failedData.push(failed);
                blockedData.push(blocked);
            }
        } else {
            // Generate daily data for 7 days
            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            for (let i = 0; i < 7; i++) {
                labels.push(days[i]);
                
                const baseValue = 1000 + Math.random() * 500;
                const sent = Math.round(baseValue);
                const delivered = Math.round(sent * (0.92 + Math.random() * 0.05));
                const failed = Math.round(sent * (0.01 + Math.random() * 0.02));
                const blocked = Math.round(sent * (0.005 + Math.random() * 0.01));

                sentData.push(sent);
                deliveredData.push(delivered);
                failedData.push(failed);
                blockedData.push(blocked);
            }
        }

        return { labels, sentData, deliveredData, failedData, blockedData };
    },

    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise<boolean>} Success status
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('Copied to clipboard', 'success');
            return true;
        } catch (err) {
            this.showToast('Failed to copy', 'error');
            return false;
        }
    },

    /**
     * Local storage helpers with JSON support
     */
    storage: {
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch {
                return defaultValue;
            }
        },
        
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch {
                return false;
            }
        },
        
        remove(key) {
            localStorage.removeItem(key);
        },
        
        clear() {
            localStorage.clear();
        }
    }
};

// Export for use in other modules
window.Utils = Utils;

