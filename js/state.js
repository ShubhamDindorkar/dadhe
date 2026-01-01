/**
 * WhatsApp Business Platform - State Management
 * ==============================================
 * Centralized state management with localStorage persistence
 */

const AppState = {
    // The main application state object
    state: {
        // Current active chat ID
        activeChat: null,
        
        // All contacts/chats
        chats: [],
        
        // All campaigns
        campaigns: [],
        
        // Message templates
        templates: [],
        
        // Safety gate flags
        safetyFlags: {
            optInValidation: true,
            sessionRule24h: true,
            warmupMode: true,
            templateEnforcement: true,
            rateLimiter: true,
            killSwitch: false
        },
        
        // Aggregated metrics
        metrics: {
            totalSent: 8500,
            totalDelivered: 7820,
            totalFailed: 102,
            totalBlocked: 43,
            dailyLimit: 10000
        },
        
        // User preferences
        preferences: {
            darkMode: false,
            soundEnabled: true
        }
    },

    /**
     * Initialize state from localStorage or defaults
     */
    init() {
        // Try to load state from localStorage
        const savedState = Utils.storage.get('appState');
        
        if (savedState) {
            // Merge saved state with defaults (to handle new properties)
            this.state = { ...this.state, ...savedState };
        } else {
            // Initialize with default data
            this.initializeDefaultData();
        }
        
        // Save initial state
        this.persist();
        
        console.log('AppState initialized:', this.state);
    },

    /**
     * Initialize default mock data
     */
    initializeDefaultData() {
        // Initialize contacts
        this.state.chats = [
            {
                id: 'chat_1',
                name: 'ZANKE SAMYAK PRAKASH',
                phone: '+917028682379',
                avatar: null,
                lastMessage: 'Yes, I am looking for coaching for JEE this year.',
                lastMessageTime: new Date().toISOString(),
                unreadCount: 0,
                isCampaignOnly: false,
                hasReplied: true,
                tags: ['Student', 'JEE Aspirant', 'Pune', 'Marketing Campaign'],
                notes: [],
                cxScore: 'New',
                channel: 'whatsapp',
                messages: [
                    {
                        id: 'msg_1',
                        type: 'outgoing',
                        text: 'Hello Zanke, how are you today?',
                        timestamp: '2025-12-22T08:30:00Z',
                        status: 'delivered'
                    },
                    {
                        id: 'msg_2',
                        type: 'outgoing',
                        text: 'Are you ready for your next big step in education?',
                        timestamp: '2025-12-22T08:30:00Z',
                        status: 'failed'
                    },
                    {
                        id: 'msg_3',
                        type: 'incoming',
                        text: 'I am good, thank you! I saw your message about ARMS Academy. I am interested.',
                        timestamp: '2025-12-22T08:35:00Z',
                        status: 'received'
                    },
                    {
                        id: 'msg_4',
                        type: 'outgoing',
                        isTemplate: true,
                        templateName: 'ARMS Academy Introduction',
                        text: 'Hi 👋\nWe noticed you showed interest in ARMS Academy — one of Pune\'s trusted institutes for JEE, NEET, MHT-CET & 11th-12th Coaching. Before we share the details, a quick question 👇\nAre you (or your child) preparing for JEE/NEET/MHT-CET or 11th-12th Science this year?',
                        buttons: ['Yes', 'No'],
                        timestamp: '2025-12-22T09:00:00Z',
                        status: 'delivered'
                    },
                    {
                        id: 'msg_5',
                        type: 'incoming',
                        text: 'Yes, I am looking for coaching for JEE this year.',
                        timestamp: '2025-12-22T09:05:00Z',
                        status: 'received'
                    },
                    {
                        id: 'msg_6',
                        type: 'outgoing',
                        text: 'Great! We have excellent programs for JEE. Let me share some details.',
                        timestamp: '2025-12-22T09:10:00Z',
                        status: 'delivered'
                    }
                ]
            },
            {
                id: 'chat_2',
                name: 'RELAN GAI',
                phone: '+919876543210',
                avatar: null,
                lastMessage: 'Hi 🔥 We not...',
                lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
                unreadCount: 0,
                isCampaignOnly: true,
                hasReplied: false,
                tags: ['Campaign'],
                notes: [],
                cxScore: 'New',
                channel: 'whatsapp',
                messages: [
                    {
                        id: 'msg_r1',
                        type: 'outgoing',
                        isTemplate: true,
                        templateName: 'Welcome Campaign',
                        text: 'Hi 🔥 We noticed you showed interest...',
                        timestamp: new Date(Date.now() - 3600000).toISOString(),
                        status: 'delivered'
                    }
                ]
            },
            {
                id: 'chat_3',
                name: 'MAHALE N',
                phone: '+919876543211',
                avatar: null,
                lastMessage: 'Hi 🔥 We not...',
                lastMessageTime: new Date(Date.now() - 3700000).toISOString(),
                unreadCount: 0,
                isCampaignOnly: true,
                hasReplied: false,
                tags: ['Campaign'],
                notes: [],
                cxScore: 'New',
                channel: 'whatsapp',
                messages: []
            },
            {
                id: 'chat_4',
                name: 'ZANKE SAI',
                phone: '+919876543212',
                avatar: null,
                lastMessage: 'Hi 🔥 We not...',
                lastMessageTime: new Date(Date.now() - 3800000).toISOString(),
                unreadCount: 0,
                isCampaignOnly: true,
                hasReplied: false,
                tags: ['Campaign'],
                notes: [],
                cxScore: 'New',
                channel: 'whatsapp',
                messages: []
            },
            {
                id: 'chat_5',
                name: 'PATIL TANI',
                phone: '+919876543213',
                avatar: null,
                lastMessage: 'Hi 🔥 We not...',
                lastMessageTime: new Date(Date.now() - 3900000).toISOString(),
                unreadCount: 0,
                isCampaignOnly: true,
                hasReplied: false,
                tags: ['Campaign'],
                notes: [],
                cxScore: 'New',
                channel: 'whatsapp',
                messages: []
            },
            {
                id: 'chat_6',
                name: 'BAGALE NI',
                phone: '+919876543214',
                avatar: null,
                lastMessage: 'Hi 🔥 We not...',
                lastMessageTime: new Date(Date.now() - 4000000).toISOString(),
                unreadCount: 0,
                isCampaignOnly: true,
                hasReplied: false,
                tags: ['Campaign'],
                notes: [],
                cxScore: 'New',
                channel: 'whatsapp',
                messages: []
            },
            {
                id: 'chat_7',
                name: 'TADASE DA',
                phone: '+919876543215',
                avatar: null,
                lastMessage: 'Hi 🔥 We not...',
                lastMessageTime: new Date(Date.now() - 4100000).toISOString(),
                unreadCount: 0,
                isCampaignOnly: true,
                hasReplied: false,
                tags: ['Campaign'],
                notes: [],
                cxScore: 'New',
                channel: 'whatsapp',
                messages: []
            }
        ];

        // Initialize campaigns
        this.state.campaigns = [
            {
                id: 'camp_1',
                name: 'Product Launch Q1',
                messageType: 'Template',
                messagesSent: 120000,
                blocked: 120,
                failed: 600,
                status: 'running',
                autoAction: 'None',
                createdAt: '2025-01-01T00:00:00Z'
            },
            {
                id: 'camp_2',
                name: 'Customer Re-engagement',
                messageType: 'Text',
                messagesSent: 50000,
                blocked: 750,
                failed: 1000,
                status: 'throttled',
                autoAction: 'Throttled',
                createdAt: '2025-01-15T00:00:00Z'
            },
            {
                id: 'camp_3',
                name: 'Holiday Promo 2024',
                messageType: 'Template',
                messagesSent: 250000,
                blocked: 750,
                failed: 2000,
                status: 'running',
                autoAction: 'None',
                createdAt: '2024-12-01T00:00:00Z'
            },
            {
                id: 'camp_4',
                name: 'Service Update Alert',
                messageType: 'Text',
                messagesSent: 10000,
                blocked: 520,
                failed: 710,
                status: 'paused',
                autoAction: 'Stopped',
                createdAt: '2025-01-20T00:00:00Z'
            },
            {
                id: 'camp_5',
                name: 'Feedback Survey',
                messageType: 'Template',
                messagesSent: 30000,
                blocked: 0,
                failed: 30,
                status: 'running',
                autoAction: 'None',
                createdAt: '2025-01-25T00:00:00Z'
            }
        ];

        // Initialize templates
        this.state.templates = [
            {
                id: 'tmpl_1',
                name: 'ARMS Academy Introduction',
                category: 'Marketing',
                content: 'Hi {{name}} 👋\nWe noticed you showed interest in ARMS Academy — one of Pune\'s trusted institutes for JEE, NEET, MHT-CET & 11th-12th Coaching. Before we share the details, a quick question 👇\nAre you (or your child) preparing for JEE/NEET/MHT-CET or 11th-12th Science this year?',
                buttons: ['Yes', 'No'],
                signature: 'ARMS Academy Assistant'
            },
            {
                id: 'tmpl_2',
                name: 'Welcome Message',
                category: 'Utility',
                content: 'Welcome to our service, {{name}}! We\'re excited to have you on board. Reply with "HELP" if you need any assistance.',
                buttons: ['Get Started', 'Learn More'],
                signature: 'Customer Support'
            },
            {
                id: 'tmpl_3',
                name: 'Order Confirmation',
                category: 'Transaction',
                content: 'Hi {{name}}, your order #{{orderId}} has been confirmed! Expected delivery: {{deliveryDate}}. Track your order anytime.',
                buttons: ['Track Order'],
                signature: 'Order Updates'
            },
            {
                id: 'tmpl_4',
                name: 'Appointment Reminder',
                category: 'Utility',
                content: 'Hi {{name}}, this is a reminder for your appointment on {{date}} at {{time}}. Please confirm your attendance.',
                buttons: ['Confirm', 'Reschedule'],
                signature: 'Appointment System'
            },
            {
                id: 'tmpl_5',
                name: 'Feedback Request',
                category: 'Marketing',
                content: 'Hi {{name}}, we hope you enjoyed your recent experience with us! Would you mind sharing your feedback? It helps us serve you better.',
                buttons: ['Leave Feedback', 'Not Now'],
                signature: 'Quality Team'
            }
        ];

        // Set first chat as active
        this.state.activeChat = this.state.chats[0]?.id || null;
    },

    /**
     * Persist state to localStorage
     */
    persist() {
        Utils.storage.set('appState', this.state);
    },

    /**
     * Get current state
     * @returns {Object} Current state
     */
    getState() {
        return this.state;
    },

    /**
     * Update state and persist
     * @param {Object} updates - Partial state updates
     */
    setState(updates) {
        this.state = { ...this.state, ...updates };
        this.persist();
    },

    // ==================== CHAT METHODS ====================

    /**
     * Get all chats
     * @returns {Array} All chats
     */
    getChats() {
        return this.state.chats;
    },

    /**
     * Get chat by ID
     * @param {string} chatId - Chat ID
     * @returns {Object|null} Chat object
     */
    getChat(chatId) {
        return this.state.chats.find(c => c.id === chatId) || null;
    },

    /**
     * Get active chat
     * @returns {Object|null} Active chat object
     */
    getActiveChat() {
        return this.getChat(this.state.activeChat);
    },

    /**
     * Set active chat
     * @param {string} chatId - Chat ID to set as active
     */
    setActiveChat(chatId) {
        this.state.activeChat = chatId;
        this.persist();
    },

    /**
     * Add message to a chat
     * @param {string} chatId - Chat ID
     * @param {Object} message - Message object
     */
    addMessage(chatId, message) {
        const chat = this.getChat(chatId);
        if (chat) {
            chat.messages.push(message);
            chat.lastMessage = message.text;
            chat.lastMessageTime = message.timestamp;
            
            // If incoming message, mark chat as having replied (unlocks free text)
            if (message.type === 'incoming') {
                chat.hasReplied = true;
                chat.isCampaignOnly = false;
            }
            
            this.persist();
        }
    },

    /**
     * Update chat tags
     * @param {string} chatId - Chat ID
     * @param {Array} tags - New tags array
     */
    updateChatTags(chatId, tags) {
        const chat = this.getChat(chatId);
        if (chat) {
            chat.tags = tags;
            this.persist();
        }
    },

    /**
     * Add note to chat
     * @param {string} chatId - Chat ID
     * @param {string} note - Note text
     */
    addChatNote(chatId, note) {
        const chat = this.getChat(chatId);
        if (chat) {
            chat.notes.push({
                id: Utils.generateId(),
                text: note,
                timestamp: new Date().toISOString()
            });
            this.persist();
        }
    },

    // ==================== CAMPAIGN METHODS ====================

    /**
     * Get all campaigns
     * @returns {Array} All campaigns
     */
    getCampaigns() {
        return this.state.campaigns;
    },

    /**
     * Get campaign by ID
     * @param {string} campaignId - Campaign ID
     * @returns {Object|null} Campaign object
     */
    getCampaign(campaignId) {
        return this.state.campaigns.find(c => c.id === campaignId) || null;
    },

    /**
     * Update campaign status
     * @param {string} campaignId - Campaign ID
     * @param {string} status - New status
     */
    updateCampaignStatus(campaignId, status) {
        const campaign = this.getCampaign(campaignId);
        if (campaign) {
            campaign.status = status;
            this.persist();
        }
    },

    /**
     * Update campaign metrics and apply auto-actions
     * @param {string} campaignId - Campaign ID
     * @param {Object} updates - Metric updates
     */
    updateCampaignMetrics(campaignId, updates) {
        const campaign = this.getCampaign(campaignId);
        if (campaign) {
            Object.assign(campaign, updates);
            
            // Calculate rates
            const blockRate = (campaign.blocked / campaign.messagesSent) * 100;
            const failRate = (campaign.failed / campaign.messagesSent) * 100;
            
            // Apply auto-actions
            if (blockRate > 5) {
                campaign.status = 'paused';
                campaign.autoAction = 'Stopped';
            } else if (failRate > 3) {
                campaign.status = 'throttled';
                campaign.autoAction = 'Throttled';
            }
            
            this.persist();
        }
    },

    // ==================== SAFETY FLAGS METHODS ====================

    /**
     * Get safety flags
     * @returns {Object} Safety flags object
     */
    getSafetyFlags() {
        return this.state.safetyFlags;
    },

    /**
     * Toggle safety flag
     * @param {string} flag - Flag name
     * @param {boolean} value - New value
     */
    setSafetyFlag(flag, value) {
        this.state.safetyFlags[flag] = value;
        this.persist();
    },

    /**
     * Check if messaging is allowed
     * @returns {boolean} Whether messaging is allowed
     */
    isMessagingAllowed() {
        return !this.state.safetyFlags.killSwitch;
    },

    // ==================== METRICS METHODS ====================

    /**
     * Get metrics
     * @returns {Object} Metrics object
     */
    getMetrics() {
        return this.state.metrics;
    },

    /**
     * Update metrics
     * @param {Object} updates - Metric updates
     */
    updateMetrics(updates) {
        this.state.metrics = { ...this.state.metrics, ...updates };
        this.persist();
    },

    /**
     * Increment message counts based on outcome
     * @param {string} outcome - 'delivered', 'failed', or 'blocked'
     */
    incrementMessageCount(outcome) {
        this.state.metrics.totalSent++;
        
        switch (outcome) {
            case 'delivered':
                this.state.metrics.totalDelivered++;
                break;
            case 'failed':
                this.state.metrics.totalFailed++;
                break;
            case 'blocked':
                this.state.metrics.totalBlocked++;
                break;
        }
        
        this.persist();
    },

    /**
     * Get calculated rates
     * @returns {Object} Calculated rates
     */
    getCalculatedRates() {
        const { totalSent, totalBlocked, totalFailed } = this.state.metrics;
        
        const blockedRate = totalSent > 0 ? (totalBlocked / totalSent) * 100 : 0;
        const failedRate = totalSent > 0 ? (totalFailed / totalSent) * 100 : 0;
        
        return {
            blockedRate: blockedRate.toFixed(1),
            failedRate: failedRate.toFixed(1),
            ...Utils.calculateHealthScore(blockedRate, failedRate)
        };
    },

    // ==================== TEMPLATE METHODS ====================

    /**
     * Get all templates
     * @returns {Array} All templates
     */
    getTemplates() {
        return this.state.templates;
    },

    /**
     * Get template by ID
     * @param {string} templateId - Template ID
     * @returns {Object|null} Template object
     */
    getTemplate(templateId) {
        return this.state.templates.find(t => t.id === templateId) || null;
    },

    /**
     * Search templates by name or content
     * @param {string} query - Search query
     * @returns {Array} Matching templates
     */
    searchTemplates(query) {
        const lowerQuery = query.toLowerCase();
        return this.state.templates.filter(t => 
            t.name.toLowerCase().includes(lowerQuery) ||
            t.content.toLowerCase().includes(lowerQuery)
        );
    },

    // ==================== RESET ====================

    /**
     * Reset state to defaults
     */
    reset() {
        Utils.storage.remove('appState');
        this.initializeDefaultData();
        this.persist();
    }
};

// Export for use in other modules
window.AppState = AppState;

