/**
 * WhatsApp Business Platform - Chat Module
 * ==========================================
 * Handles all chat-related functionality
 */

const ChatModule = {
    // DOM element references
    elements: {},

    /**
     * Initialize the chat module
     */
    init() {
        this.cacheElements();
        this.bindEvents();
        this.renderContactList();
        this.loadActiveChat();
    },

    /**
     * Cache DOM element references for performance
     */
    cacheElements() {
        this.elements = {
            contactList: document.getElementById('contact-list'),
            chatMessages: document.getElementById('chat-messages'),
            chatContactName: document.getElementById('chat-contact-name'),
            panelContactName: document.getElementById('panel-contact-name'),
            contactPhone: document.getElementById('contact-phone'),
            contactUsername: document.getElementById('contact-username'),
            cxScore: document.getElementById('cx-score'),
            tagsContainer: document.getElementById('tags-container'),
            notesContainer: document.getElementById('notes-container'),
            noteInput: document.getElementById('note-input'),
            saveNoteBtn: document.getElementById('save-note-btn'),
            campaignBanner: document.getElementById('campaign-banner'),
            messageInputArea: document.getElementById('message-input-area'),
            templateBtn: document.getElementById('template-btn'),
            freeTextInput: document.getElementById('free-text-input'),
            messageInput: document.getElementById('message-input'),
            sendBtn: document.getElementById('send-btn'),
            templateModal: document.getElementById('template-modal'),
            templateModalClose: document.getElementById('template-modal-close'),
            templateSearch: document.getElementById('template-search'),
            templateList: document.getElementById('template-list'),
            tagModal: document.getElementById('tag-modal'),
            tagModalClose: document.getElementById('tag-modal-close'),
            newTagInput: document.getElementById('new-tag-input'),
            addTagBtn: document.getElementById('add-tag-btn'),
            startTracking: document.getElementById('start-tracking'),
            channelItems: document.querySelectorAll('.channel-item'),
            filterBtns: document.querySelectorAll('.filter-btn'),
            collapsibleSections: document.querySelectorAll('.collapsible .section-toggle'),
            inboxContainer: document.querySelector('.inbox-container'),
            contactPanel: document.getElementById('contact-panel'),
            panelToggleBtn: document.getElementById('panel-toggle-btn')
        };
    },

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Template button click
        this.elements.templateBtn?.addEventListener('click', () => this.openTemplateModal());

        // Send message
        this.elements.sendBtn?.addEventListener('click', () => this.sendMessage());
        this.elements.messageInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // Template modal close
        this.elements.templateModalClose?.addEventListener('click', () => this.closeTemplateModal());
        this.elements.templateModal?.addEventListener('click', (e) => {
            if (e.target === this.elements.templateModal) this.closeTemplateModal();
        });

        // Template search
        this.elements.templateSearch?.addEventListener('input', Utils.debounce((e) => {
            this.renderTemplateList(e.target.value);
        }, 300));

        // Save note
        this.elements.saveNoteBtn?.addEventListener('click', () => this.saveNote());

        // Start tracking CX score
        this.elements.startTracking?.addEventListener('click', (e) => {
            e.preventDefault();
            this.startCxTracking();
        });

        // Channel selection
        this.elements.channelItems.forEach(item => {
            item.addEventListener('click', () => this.selectChannel(item));
        });

        // Chat filter selection
        this.elements.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => this.selectFilter(btn));
        });

        // Collapsible sections
        this.elements.collapsibleSections.forEach(toggle => {
            toggle.addEventListener('click', () => {
                toggle.closest('.collapsible').classList.toggle('open');
            });
        });

        // Panel toggle button
        if (this.elements.panelToggleBtn) {
            this.elements.panelToggleBtn.addEventListener('click', () => {
                this.toggleContactPanel();
            });
        }

        // Tag modal events
        this.elements.tagModalClose?.addEventListener('click', () => this.closeTagModal());
        this.elements.addTagBtn?.addEventListener('click', () => this.addNewTag());
        this.elements.newTagInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addNewTag();
        });

        // Copy phone number
        document.querySelector('.copy-btn')?.addEventListener('click', () => {
            const phone = this.elements.contactPhone?.textContent;
            if (phone) Utils.copyToClipboard(phone);
        });
    },

    /**
     * Render the contact list
     * @param {string} filter - Optional filter type
     * @param {string} channel - Optional channel filter
     */
    renderContactList(filter = 'all', channel = 'all') {
        let chats = AppState.getChats();

        // Apply channel filter
        if (channel !== 'all') {
            chats = chats.filter(chat => chat.channel === channel);
        }

        // Apply chat filter
        switch (filter) {
            case 'active':
                chats = chats.filter(chat => !chat.isCampaignOnly || chat.hasReplied);
                break;
            case 'assigned':
                // For demo, show all as assigned
                break;
            case 'unassigned':
                chats = chats.filter(chat => chat.isCampaignOnly && !chat.hasReplied);
                break;
        }

        // Build contact list HTML
        const html = chats.map(chat => this.renderContactItem(chat)).join('');
        this.elements.contactList.innerHTML = html;

        // Bind click events to contact items
        this.elements.contactList.querySelectorAll('.contact-item').forEach(item => {
            item.addEventListener('click', () => {
                const chatId = item.dataset.chatId;
                this.selectChat(chatId);
            });
        });
    },

    /**
     * Render a single contact item
     * @param {Object} chat - Chat object
     * @returns {string} HTML string
     */
    renderContactItem(chat) {
        const isActive = chat.id === AppState.state.activeChat;
        const initials = Utils.getInitials(chat.name);
        const gradient = Utils.getAvatarGradient(chat.name);
        const time = Utils.formatTime(chat.lastMessageTime);
        const preview = Utils.truncateText(chat.lastMessage || 'No messages yet', 30);

        return `
            <div class="contact-item ${isActive ? 'active' : ''}" data-chat-id="${chat.id}">
                <div class="contact-avatar" style="background: ${gradient}">
                    ${initials}
                </div>
                <div class="contact-info">
                    <div class="contact-header">
                        <span class="contact-name">${chat.name}</span>
                        <span class="contact-time">${time}</span>
                    </div>
                    <div class="contact-preview">
                        <span class="fire-emoji">Hi 🔥</span>
                        <span>${preview}</span>
                    </div>
                    ${chat.isCampaignOnly ? `
                        <div class="contact-badge">
                            <span class="campaign-badge">Campaign</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },

    /**
     * Select a chat by ID
     * @param {string} chatId - Chat ID
     */
    selectChat(chatId) {
        AppState.setActiveChat(chatId);
        this.renderContactList();
        this.loadActiveChat();
    },

    /**
     * Load and display the active chat
     */
    loadActiveChat() {
        const chat = AppState.getActiveChat();
        if (!chat) return;

        // Update header names
        this.elements.chatContactName.textContent = chat.name;
        this.elements.panelContactName.textContent = chat.name;
        this.elements.contactPhone.textContent = `(+91)${chat.phone.replace('+91', '')}`;
        this.elements.contactUsername.textContent = chat.name;
        this.elements.cxScore.textContent = chat.cxScore;

        // Render messages
        this.renderMessages(chat);

        // Update input area based on chat state
        this.updateInputArea(chat);

        // Render tags
        this.renderTags(chat.tags);

        // Scroll to bottom
        this.scrollToBottom();
    },

    /**
     * Render chat messages
     * @param {Object} chat - Chat object
     */
    renderMessages(chat) {
        if (!chat.messages || chat.messages.length === 0) {
            this.elements.chatMessages.innerHTML = `
                <div class="system-message">
                    <span>Welcome to the chat with ${chat.name}.</span>
                </div>
            `;
            return;
        }

        // Group messages by date
        const messagesByDate = this.groupMessagesByDate(chat.messages);
        
        let html = '';
        for (const [date, messages] of Object.entries(messagesByDate)) {
            html += `
                <div class="message-date">
                    <span>${date}</span>
                </div>
            `;
            
            html += `
                <div class="system-message">
                    <span>Welcome to the chat with ${chat.name}.</span>
                </div>
            `;

            messages.forEach(msg => {
                html += this.renderMessage(msg);
            });
        }

        this.elements.chatMessages.innerHTML = html;
    },

    /**
     * Group messages by date
     * @param {Array} messages - Messages array
     * @returns {Object} Messages grouped by date
     */
    groupMessagesByDate(messages) {
        const groups = {};
        messages.forEach(msg => {
            const date = Utils.formatDate(msg.timestamp);
            if (!groups[date]) groups[date] = [];
            groups[date].push(msg);
        });
        return groups;
    },

    /**
     * Render a single message
     * @param {Object} msg - Message object
     * @returns {string} HTML string
     */
    renderMessage(msg) {
        const isOutgoing = msg.type === 'outgoing';
        const timeStr = Utils.formatISOTime(msg.timestamp);
        
        // Get status icon
        let statusIcon = '';
        if (isOutgoing) {
            switch (msg.status) {
                case 'sent':
                    statusIcon = '✓';
                    break;
                case 'delivered':
                    statusIcon = '✓✓';
                    break;
                case 'read':
                    statusIcon = '<span class="message-status read">✓✓</span>';
                    break;
                case 'failed':
                    statusIcon = '<span style="color: red;">⚠</span>';
                    break;
            }
        }

        // Template message
        if (msg.isTemplate) {
            return `
                <div class="message ${isOutgoing ? 'outgoing' : 'incoming'}">
                    <div class="template-content">
                        <div class="template-body">${msg.text.replace(/\n/g, '<br>')}</div>
                        ${msg.buttons ? `
                            <div class="template-buttons">
                                ${msg.buttons.map(btn => `
                                    <button class="template-btn-action">✓ ${btn}</button>
                                `).join('')}
                            </div>
                        ` : ''}
                        <div class="template-signature">${msg.templateName || 'Template Message'}</div>
                    </div>
                    <div class="message-footer">
                        ${timeStr} ${statusIcon}
                    </div>
                </div>
            `;
        }

        // Regular message
        return `
            <div class="message ${isOutgoing ? 'outgoing' : 'incoming'}">
                ${!isOutgoing ? `
                    <div class="message-sender">
                        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23f0f0f0'/%3E%3Ccircle cx='50' cy='35' r='20' fill='%23ccc'/%3E%3Cellipse cx='50' cy='80' rx='35' ry='25' fill='%23ccc'/%3E%3C/svg%3E" alt="">
                    </div>
                ` : ''}
                <div class="message-bubble ${msg.isTemplate ? 'template-message' : ''}">
                    <div class="message-text">${msg.text}</div>
                </div>
                <div class="message-footer">
                    ${timeStr} ${statusIcon}
                </div>
            </div>
        `;
    },

    /**
     * Update input area based on chat state
     * @param {Object} chat - Chat object
     */
    updateInputArea(chat) {
        const isCampaignOnly = chat.isCampaignOnly && !chat.hasReplied;
        
        // Show/hide campaign banner
        this.elements.campaignBanner.style.display = isCampaignOnly ? 'block' : 'none';
        
        // Show/hide appropriate input
        if (isCampaignOnly) {
            this.elements.templateBtn.style.display = 'block';
            this.elements.freeTextInput.style.display = 'none';
        } else {
            this.elements.templateBtn.style.display = 'none';
            this.elements.freeTextInput.style.display = 'flex';
        }
    },

    /**
     * Send a free-text message
     */
    async sendMessage() {
        const text = this.elements.messageInput.value.trim();
        if (!text) return;

        // Check if messaging is allowed
        if (!AppState.isMessagingAllowed()) {
            Utils.showToast('Messaging is disabled. Kill switch is active.', 'error');
            return;
        }

        const chat = AppState.getActiveChat();
        if (!chat) return;

        // Clear input
        this.elements.messageInput.value = '';

        // Create message object
        const message = {
            id: Utils.generateId(),
            type: 'outgoing',
            text: text,
            timestamp: new Date().toISOString(),
            status: 'sent'
        };

        // Add message to state
        AppState.addMessage(chat.id, message);

        // Re-render messages
        this.loadActiveChat();

        // Simulate delivery outcome
        await this.simulateMessageDelivery(chat.id, message.id);
    },

    /**
     * Simulate message delivery with outcome
     * @param {string} chatId - Chat ID
     * @param {string} messageId - Message ID
     */
    async simulateMessageDelivery(chatId, messageId) {
        // Wait for simulated network delay
        await Utils.simulateDelay(500, 1500);

        const safetyFlags = AppState.getSafetyFlags();
        const outcome = Utils.simulateMessageOutcome(safetyFlags);

        // Update message status
        const chat = AppState.getChat(chatId);
        if (chat) {
            const message = chat.messages.find(m => m.id === messageId);
            if (message) {
                message.status = outcome === 'delivered' ? 'delivered' : 'failed';
                AppState.persist();
            }
        }

        // Update metrics
        AppState.incrementMessageCount(outcome);

        // Refresh UI
        this.loadActiveChat();
        DashboardModule.updateMetrics();

        // Show toast based on outcome
        if (outcome === 'blocked') {
            Utils.showToast('Message was blocked by WhatsApp', 'warning');
        } else if (outcome === 'failed') {
            Utils.showToast('Message delivery failed', 'error');
        }

        // Simulate customer reply occasionally
        if (outcome === 'delivered' && Math.random() > 0.7) {
            setTimeout(() => this.simulateCustomerReply(chatId), 3000);
        }
    },

    /**
     * Simulate a customer reply
     * @param {string} chatId - Chat ID
     */
    simulateCustomerReply(chatId) {
        const replies = [
            'Thanks for the information!',
            'I\'ll think about it and get back to you.',
            'Can you tell me more about the pricing?',
            'When can we schedule a call?',
            'That sounds interesting!',
            'I have a few questions...'
        ];

        const randomReply = replies[Math.floor(Math.random() * replies.length)];

        const message = {
            id: Utils.generateId(),
            type: 'incoming',
            text: randomReply,
            timestamp: new Date().toISOString(),
            status: 'received'
        };

        AppState.addMessage(chatId, message);
        
        // Refresh if this is the active chat
        if (AppState.state.activeChat === chatId) {
            this.loadActiveChat();
            Utils.showToast('New message received!', 'info');
        }

        // Update contact list
        this.renderContactList();
    },

    /**
     * Open template selection modal
     */
    openTemplateModal() {
        this.elements.templateModal.classList.add('active');
        this.renderTemplateList();
        this.elements.templateSearch.value = '';
        this.elements.templateSearch.focus();
    },

    /**
     * Close template selection modal
     */
    closeTemplateModal() {
        this.elements.templateModal.classList.remove('active');
    },

    /**
     * Render template list in modal
     * @param {string} searchQuery - Optional search query
     */
    renderTemplateList(searchQuery = '') {
        const templates = searchQuery 
            ? AppState.searchTemplates(searchQuery)
            : AppState.getTemplates();

        const html = templates.map(template => `
            <div class="template-item" data-template-id="${template.id}">
                <h4>${template.name}</h4>
                <p>${Utils.truncateText(template.content, 100)}</p>
            </div>
        `).join('');

        this.elements.templateList.innerHTML = html || '<p class="no-data">No templates found</p>';

        // Bind click events
        this.elements.templateList.querySelectorAll('.template-item').forEach(item => {
            item.addEventListener('click', () => {
                const templateId = item.dataset.templateId;
                this.sendTemplate(templateId);
            });
        });
    },

    /**
     * Send a template message
     * @param {string} templateId - Template ID
     */
    async sendTemplate(templateId) {
        // Check if messaging is allowed
        if (!AppState.isMessagingAllowed()) {
            Utils.showToast('Messaging is disabled. Kill switch is active.', 'error');
            return;
        }

        const template = AppState.getTemplate(templateId);
        const chat = AppState.getActiveChat();
        if (!template || !chat) return;

        this.closeTemplateModal();

        // Parse template with contact data
        const parsedContent = Utils.parseTemplate(template.content, {
            name: chat.name.split(' ')[0]
        });

        // Create template message
        const message = {
            id: Utils.generateId(),
            type: 'outgoing',
            isTemplate: true,
            templateName: template.signature || template.name,
            text: parsedContent,
            buttons: template.buttons,
            timestamp: new Date().toISOString(),
            status: 'sent'
        };

        // Add message
        AppState.addMessage(chat.id, message);
        this.loadActiveChat();

        // Simulate delivery
        await this.simulateMessageDelivery(chat.id, message.id);

        Utils.showToast('Template sent successfully!', 'success');
    },

    /**
     * Render tags for active chat
     * @param {Array} tags - Tags array
     */
    renderTags(tags) {
        const html = tags.map(tag => `
            <span class="tag">
                ${tag}
                <span class="tag-remove" data-tag="${tag}">×</span>
            </span>
        `).join('');

        this.elements.tagsContainer.innerHTML = html + `
            <button class="add-tag-btn" id="add-tag-trigger">+ Add Tag</button>
        `;

        // Bind remove tag events
        this.elements.tagsContainer.querySelectorAll('.tag-remove').forEach(btn => {
            btn.addEventListener('click', () => this.removeTag(btn.dataset.tag));
        });

        // Bind add tag button
        document.getElementById('add-tag-trigger')?.addEventListener('click', () => {
            this.openTagModal();
        });
    },

    /**
     * Open tag modal
     */
    openTagModal() {
        this.elements.tagModal.classList.add('active');
        this.elements.newTagInput.value = '';
        this.elements.newTagInput.focus();
    },

    /**
     * Close tag modal
     */
    closeTagModal() {
        this.elements.tagModal.classList.remove('active');
    },

    /**
     * Toggle the contact panel visibility
     */
    toggleContactPanel() {
        const container = this.elements.inboxContainer;
        const toggleBtn = this.elements.panelToggleBtn;
        
        if (container) {
            container.classList.toggle('panel-collapsed');
            
            // Update toggle button icon
            if (container.classList.contains('panel-collapsed')) {
                toggleBtn.textContent = '▶';
                toggleBtn.title = 'Expand Panel';
            } else {
                toggleBtn.textContent = '◀';
                toggleBtn.title = 'Collapse Panel';
            }
        }
    },

    /**
     * Add a new tag
     */
    addNewTag() {
        const tagName = this.elements.newTagInput.value.trim();
        if (!tagName) return;

        const chat = AppState.getActiveChat();
        if (!chat) return;

        // Don't add duplicate tags
        if (chat.tags.includes(tagName)) {
            Utils.showToast('Tag already exists', 'warning');
            return;
        }

        // Add tag
        const newTags = [...chat.tags, tagName];
        AppState.updateChatTags(chat.id, newTags);

        this.closeTagModal();
        this.renderTags(newTags);
        Utils.showToast('Tag added!', 'success');
    },

    /**
     * Remove a tag
     * @param {string} tagName - Tag to remove
     */
    removeTag(tagName) {
        const chat = AppState.getActiveChat();
        if (!chat) return;

        const newTags = chat.tags.filter(t => t !== tagName);
        AppState.updateChatTags(chat.id, newTags);
        this.renderTags(newTags);
        Utils.showToast('Tag removed', 'info');
    },

    /**
     * Save a note
     */
    saveNote() {
        const noteText = this.elements.noteInput.value.trim();
        if (!noteText) return;

        const chat = AppState.getActiveChat();
        if (!chat) return;

        AppState.addChatNote(chat.id, noteText);
        this.elements.noteInput.value = '';
        Utils.showToast('Note saved!', 'success');
    },

    /**
     * Start CX score tracking
     */
    startCxTracking() {
        const chat = AppState.getActiveChat();
        if (!chat) return;

        // Simulate starting tracking
        chat.cxScore = '75';
        AppState.persist();
        this.elements.cxScore.textContent = '75';
        this.elements.startTracking.textContent = 'View Details';
        Utils.showToast('CX Score tracking started!', 'success');
    },

    /**
     * Select a channel
     * @param {HTMLElement} item - Channel item element
     */
    selectChannel(item) {
        this.elements.channelItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        const channel = item.dataset.channel;
        this.renderContactList('all', channel);
    },

    /**
     * Select a chat filter
     * @param {HTMLElement} btn - Filter button element
     */
    selectFilter(btn) {
        this.elements.filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.dataset.filter;
        const activeChannel = document.querySelector('.channel-item.active')?.dataset.channel || 'all';
        this.renderContactList(filter, activeChannel);
    },

    /**
     * Scroll chat to bottom
     */
    scrollToBottom() {
        if (this.elements.chatMessages) {
            this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
        }
    }
};

// Export for use in other modules
window.ChatModule = ChatModule;

