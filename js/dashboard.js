/**
 * WhatsApp Business Platform - Dashboard Module
 * ===============================================
 * Handles all dashboard-related functionality
 */

const DashboardModule = {
    // DOM element references
    elements: {},

    // Currently selected campaign for modal
    selectedCampaign: null,

    /**
     * Initialize the dashboard module
     */
    init() {
        this.cacheElements();
        this.bindEvents();
        this.updateMetrics();
        this.renderCampaignTable();
        this.syncKillSwitchState();
    },

    /**
     * Cache DOM element references
     */
    cacheElements() {
        this.elements = {
            // Metrics
            healthScore: document.getElementById('health-score'),
            healthStatus: document.getElementById('health-status'),
            blockedRate: document.getElementById('blocked-rate'),
            blockedStatus: document.getElementById('blocked-status'),
            failedRate: document.getElementById('failed-rate'),
            failedStatus: document.getElementById('failed-status'),
            dailyLimit: document.getElementById('daily-limit'),
            limitStatus: document.getElementById('limit-status'),
            numberStatus: document.getElementById('number-status'),

            // Kill switch
            globalKillSwitch: document.getElementById('global-kill-switch'),
            killSwitchAlert: document.getElementById('kill-switch-alert'),
            alertDismiss: document.getElementById('alert-dismiss'),

            // Safety gates
            safetyGates: document.querySelectorAll('.safety-gate'),
            gateToggles: document.querySelectorAll('[data-gate-toggle]'),

            // Campaign table
            campaignTableBody: document.getElementById('campaign-table-body'),

            // Campaign modal
            campaignModal: document.getElementById('campaign-modal'),
            campaignModalClose: document.getElementById('campaign-modal-close'),
            campaignModalTitle: document.getElementById('campaign-modal-title'),
            campaignModalBody: document.getElementById('campaign-modal-body'),
            campaignPauseBtn: document.getElementById('campaign-pause-btn'),
            campaignStopBtn: document.getElementById('campaign-stop-btn'),

            // Sidebar nav
            sidebarNavItems: document.querySelectorAll('.sidebar-nav .nav-item'),

            // Number selector
            numberSelect: document.getElementById('number-select')
        };
    },

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Global kill switch
        this.elements.globalKillSwitch?.addEventListener('change', (e) => {
            this.toggleKillSwitch(e.target.checked);
        });

        // Alert dismiss
        this.elements.alertDismiss?.addEventListener('click', () => {
            this.elements.killSwitchAlert.style.display = 'none';
        });

        // Safety gate toggles
        this.elements.gateToggles.forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                const gateName = e.target.dataset.gateToggle;
                this.toggleSafetyGate(gateName, e.target.checked);
            });
        });

        // Campaign modal events
        this.elements.campaignModalClose?.addEventListener('click', () => {
            this.closeCampaignModal();
        });
        this.elements.campaignModal?.addEventListener('click', (e) => {
            if (e.target === this.elements.campaignModal) {
                this.closeCampaignModal();
            }
        });
        this.elements.campaignPauseBtn?.addEventListener('click', () => {
            this.pauseSelectedCampaign();
        });
        this.elements.campaignStopBtn?.addEventListener('click', () => {
            this.stopSelectedCampaign();
        });

        // Sidebar navigation
        this.elements.sidebarNavItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.selectNavItem(item);
            });
        });

        // Number selector change
        this.elements.numberSelect?.addEventListener('change', () => {
            this.updateNumberStatus();
        });
    },

    /**
     * Update all metric displays
     */
    updateMetrics() {
        const metrics = AppState.getMetrics();
        const rates = AppState.getCalculatedRates();

        // Health Score
        this.elements.healthScore.textContent = rates.score;
        this.elements.healthStatus.textContent = rates.status;
        this.elements.healthStatus.className = `metric-status ${rates.statusClass}`;

        // Blocked Rate
        this.elements.blockedRate.textContent = `${rates.blockedRate}%`;
        const blockedClass = parseFloat(rates.blockedRate) < 1 ? 'low-risk' : 
                            parseFloat(rates.blockedRate) < 3 ? 'monitor' : 'danger';
        this.elements.blockedStatus.textContent = parseFloat(rates.blockedRate) < 1 ? 'Low Risk' : 
                                                  parseFloat(rates.blockedRate) < 3 ? 'Monitor Closely' : 'High Risk';
        this.elements.blockedStatus.className = `metric-status ${blockedClass}`;

        // Failed Rate
        this.elements.failedRate.textContent = `${rates.failedRate}%`;
        const failedClass = parseFloat(rates.failedRate) < 2 ? 'monitor' : 'danger';
        this.elements.failedStatus.textContent = parseFloat(rates.failedRate) < 2 ? 'Monitor Closely' : 'High Risk';
        this.elements.failedStatus.className = `metric-status ${failedClass}`;

        // Daily Limit
        const limitPercent = (metrics.totalSent / metrics.dailyLimit) * 100;
        this.elements.dailyLimit.textContent = `${Utils.formatNumber(metrics.totalSent)}/${Utils.formatNumber(metrics.dailyLimit)}`;
        const limitClass = limitPercent < 70 ? 'low-risk' : limitPercent < 90 ? 'approaching' : 'danger';
        const limitText = limitPercent < 70 ? 'On Track' : limitPercent < 90 ? 'Approaching Limit' : 'Near Limit';
        this.elements.limitStatus.textContent = limitText;
        this.elements.limitStatus.className = `metric-status ${limitClass}`;

        // Update number status badge
        this.updateNumberStatus();
    },

    /**
     * Update number status badge based on health
     */
    updateNumberStatus() {
        const rates = AppState.getCalculatedRates();
        const badge = this.elements.numberStatus;
        
        if (rates.score >= 80) {
            badge.textContent = 'GREEN';
            badge.className = 'status-badge green';
        } else if (rates.score >= 50) {
            badge.textContent = 'YELLOW';
            badge.className = 'status-badge yellow';
        } else {
            badge.textContent = 'RED';
            badge.className = 'status-badge red';
        }
    },

    /**
     * Toggle global kill switch
     * @param {boolean} enabled - Whether kill switch is enabled
     */
    toggleKillSwitch(enabled) {
        AppState.setSafetyFlag('killSwitch', enabled);

        // Update UI
        const killSwitchGate = document.querySelector('[data-gate="kill-switch"]');
        const killSwitchToggle = document.querySelector('[data-gate-toggle="kill-switch"]');

        if (enabled) {
            // Show alert banner
            this.elements.killSwitchAlert.style.display = 'flex';
            
            // Update gate appearance
            killSwitchGate?.classList.remove('inactive');
            killSwitchGate?.classList.add('active');
            killSwitchGate?.querySelector('.gate-status')?.classList.remove('danger');
            killSwitchGate?.querySelector('.gate-status')?.classList.add('success');
            if (killSwitchGate) {
                killSwitchGate.querySelector('.gate-status').textContent = '✓';
            }

            // Update toggle
            if (killSwitchToggle) killSwitchToggle.checked = true;

            // Pause all running campaigns
            this.pauseAllCampaigns();

            Utils.showToast('KILL SWITCH ACTIVATED - All messaging stopped', 'warning');
        } else {
            // Hide alert banner
            this.elements.killSwitchAlert.style.display = 'none';

            // Update gate appearance
            killSwitchGate?.classList.remove('active');
            killSwitchGate?.classList.add('inactive');
            killSwitchGate?.querySelector('.gate-status')?.classList.remove('success');
            killSwitchGate?.querySelector('.gate-status')?.classList.add('danger');
            if (killSwitchGate) {
                killSwitchGate.querySelector('.gate-status').textContent = '✕';
            }

            // Update toggle
            if (killSwitchToggle) killSwitchToggle.checked = false;

            Utils.showToast('Kill switch deactivated - Messaging resumed', 'success');
        }
    },

    /**
     * Sync kill switch UI state with app state
     */
    syncKillSwitchState() {
        const flags = AppState.getSafetyFlags();
        
        // Sync global toggle
        if (this.elements.globalKillSwitch) {
            this.elements.globalKillSwitch.checked = flags.killSwitch;
        }

        // Sync all gate toggles
        this.elements.gateToggles.forEach(toggle => {
            const gateName = toggle.dataset.gateToggle;
            const flagMap = {
                'opt-in': 'optInValidation',
                '24h-session': 'sessionRule24h',
                'warmup': 'warmupMode',
                'template': 'templateEnforcement',
                'rate-limiter': 'rateLimiter',
                'kill-switch': 'killSwitch'
            };
            const flagName = flagMap[gateName];
            if (flagName && flags[flagName] !== undefined) {
                toggle.checked = flags[flagName];
            }
        });

        // Update kill switch alert
        if (flags.killSwitch) {
            this.elements.killSwitchAlert.style.display = 'flex';
        }
    },

    /**
     * Toggle a safety gate
     * @param {string} gateName - Gate name
     * @param {boolean} enabled - Whether gate is enabled
     */
    toggleSafetyGate(gateName, enabled) {
        const flagMap = {
            'opt-in': 'optInValidation',
            '24h-session': 'sessionRule24h',
            'warmup': 'warmupMode',
            'template': 'templateEnforcement',
            'rate-limiter': 'rateLimiter',
            'kill-switch': 'killSwitch'
        };

        const flagName = flagMap[gateName];
        if (!flagName) return;

        // Handle kill switch specially
        if (gateName === 'kill-switch') {
            this.elements.globalKillSwitch.checked = enabled;
            this.toggleKillSwitch(enabled);
            return;
        }

        AppState.setSafetyFlag(flagName, enabled);

        // Update gate UI
        const gate = document.querySelector(`[data-gate="${gateName}"]`);
        if (gate) {
            const statusEl = gate.querySelector('.gate-status');
            
            if (enabled) {
                gate.classList.remove('inactive', 'warning');
                gate.classList.add('active');
                statusEl.classList.remove('danger', 'warn');
                statusEl.classList.add('success');
                statusEl.textContent = '✓';
            } else {
                gate.classList.remove('active');
                gate.classList.add('warning');
                statusEl.classList.remove('success');
                statusEl.classList.add('warn');
                statusEl.textContent = '⚠';
            }
        }

        const statusText = enabled ? 'enabled' : 'disabled';
        Utils.showToast(`${gateName.replace(/-/g, ' ')} ${statusText}`, enabled ? 'success' : 'warning');
    },

    /**
     * Pause all running campaigns (when kill switch is activated)
     */
    pauseAllCampaigns() {
        const campaigns = AppState.getCampaigns();
        campaigns.forEach(campaign => {
            if (campaign.status === 'running') {
                campaign.status = 'paused';
                campaign.autoAction = 'Kill Switch';
            }
        });
        AppState.persist();
        this.renderCampaignTable();
    },

    /**
     * Render campaign safety monitor table
     */
    renderCampaignTable() {
        const campaigns = AppState.getCampaigns();
        
        const html = campaigns.map(campaign => {
            const blockRate = ((campaign.blocked / campaign.messagesSent) * 100).toFixed(1);
            const failRate = ((campaign.failed / campaign.messagesSent) * 100).toFixed(1);
            
            const blockClass = Utils.getRateBadgeClass(parseFloat(blockRate));
            const failClass = Utils.getRateBadgeClass(parseFloat(failRate));

            return `
                <tr data-campaign-id="${campaign.id}">
                    <td>${campaign.name}</td>
                    <td>${campaign.messageType}</td>
                    <td>${Utils.formatNumber(campaign.messagesSent)}</td>
                    <td><span class="rate-badge ${blockClass}">${blockRate}%</span></td>
                    <td><span class="rate-badge ${failClass}">${failRate}%</span></td>
                    <td><span class="status-pill ${campaign.status}">${this.capitalizeFirst(campaign.status)}</span></td>
                    <td>
                        <span class="action-badge ${campaign.autoAction.toLowerCase()}">${campaign.autoAction}</span>
                    </td>
                </tr>
            `;
        }).join('');

        this.elements.campaignTableBody.innerHTML = html;

        // Bind click events for campaign rows
        this.elements.campaignTableBody.querySelectorAll('tr').forEach(row => {
            row.addEventListener('click', () => {
                const campaignId = row.dataset.campaignId;
                this.openCampaignModal(campaignId);
            });
        });
    },

    /**
     * Open campaign details modal
     * @param {string} campaignId - Campaign ID
     */
    openCampaignModal(campaignId) {
        const campaign = AppState.getCampaign(campaignId);
        if (!campaign) return;

        this.selectedCampaign = campaign;

        const blockRate = ((campaign.blocked / campaign.messagesSent) * 100).toFixed(2);
        const failRate = ((campaign.failed / campaign.messagesSent) * 100).toFixed(2);
        const deliveryRate = (100 - parseFloat(blockRate) - parseFloat(failRate)).toFixed(2);

        this.elements.campaignModalTitle.textContent = campaign.name;
        this.elements.campaignModalBody.innerHTML = `
            <div class="campaign-details">
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">Message Type</span>
                        <span class="detail-value">${campaign.messageType}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Status</span>
                        <span class="status-pill ${campaign.status}">${this.capitalizeFirst(campaign.status)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Messages Sent</span>
                        <span class="detail-value">${Utils.formatNumber(campaign.messagesSent)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Delivery Rate</span>
                        <span class="detail-value">${deliveryRate}%</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Block Rate</span>
                        <span class="rate-badge ${Utils.getRateBadgeClass(parseFloat(blockRate))}">${blockRate}%</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Failure Rate</span>
                        <span class="rate-badge ${Utils.getRateBadgeClass(parseFloat(failRate))}">${failRate}%</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Auto Action</span>
                        <span class="action-badge ${campaign.autoAction.toLowerCase()}">${campaign.autoAction}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Created</span>
                        <span class="detail-value">${Utils.formatDate(campaign.createdAt)}</span>
                    </div>
                </div>
                
                <div class="campaign-stats">
                    <h4>Message Breakdown</h4>
                    <div class="stats-bar">
                        <div class="stat-segment delivered" style="width: ${deliveryRate}%" title="Delivered: ${deliveryRate}%"></div>
                        <div class="stat-segment failed" style="width: ${failRate}%" title="Failed: ${failRate}%"></div>
                        <div class="stat-segment blocked" style="width: ${blockRate}%" title="Blocked: ${blockRate}%"></div>
                    </div>
                    <div class="stats-legend">
                        <span><span class="legend-dot" style="background:#22C55E"></span> Delivered (${Utils.formatNumber(campaign.messagesSent - campaign.blocked - campaign.failed)})</span>
                        <span><span class="legend-dot" style="background:#EF4444"></span> Failed (${Utils.formatNumber(campaign.failed)})</span>
                        <span><span class="legend-dot" style="background:#F59E0B"></span> Blocked (${Utils.formatNumber(campaign.blocked)})</span>
                    </div>
                </div>
            </div>
        `;

        // Update button states based on campaign status
        this.elements.campaignPauseBtn.textContent = campaign.status === 'paused' ? 'Resume Campaign' : 'Pause Campaign';
        this.elements.campaignPauseBtn.disabled = campaign.status === 'stopped';
        this.elements.campaignStopBtn.disabled = campaign.status === 'stopped';

        this.elements.campaignModal.classList.add('active');
    },

    /**
     * Close campaign modal
     */
    closeCampaignModal() {
        this.elements.campaignModal.classList.remove('active');
        this.selectedCampaign = null;
    },

    /**
     * Pause/resume selected campaign
     */
    pauseSelectedCampaign() {
        if (!this.selectedCampaign) return;

        const newStatus = this.selectedCampaign.status === 'paused' ? 'running' : 'paused';
        AppState.updateCampaignStatus(this.selectedCampaign.id, newStatus);
        
        this.renderCampaignTable();
        this.closeCampaignModal();
        
        Utils.showToast(`Campaign ${newStatus === 'paused' ? 'paused' : 'resumed'}`, newStatus === 'paused' ? 'warning' : 'success');
    },

    /**
     * Stop selected campaign
     */
    stopSelectedCampaign() {
        if (!this.selectedCampaign) return;

        if (confirm('Are you sure you want to stop this campaign? This action cannot be undone.')) {
            AppState.updateCampaignStatus(this.selectedCampaign.id, 'stopped');
            this.selectedCampaign.autoAction = 'Stopped';
            AppState.persist();
            
            this.renderCampaignTable();
            this.closeCampaignModal();
            
            Utils.showToast('Campaign stopped', 'error');
        }
    },

    /**
     * Select navigation item
     * @param {HTMLElement} item - Nav item element
     */
    selectNavItem(item) {
        // Remove active from all items
        document.querySelectorAll('.sidebar-nav .nav-item, .sidebar-bottom .nav-item').forEach(i => {
            i.classList.remove('active');
        });
        
        // Add active to clicked item
        item.classList.add('active');
        
        const section = item.dataset.section;
        Utils.showToast(`Navigating to ${section}...`, 'info');
    },

    /**
     * Capitalize first letter
     * @param {string} str - String to capitalize
     * @returns {string} Capitalized string
     */
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    /**
     * Simulate sending a batch of messages (for testing)
     * @param {number} count - Number of messages to simulate
     */
    simulateMessageBatch(count = 100) {
        const safetyFlags = AppState.getSafetyFlags();
        
        for (let i = 0; i < count; i++) {
            const outcome = Utils.simulateMessageOutcome(safetyFlags);
            AppState.incrementMessageCount(outcome);
        }
        
        this.updateMetrics();
        ChartsModule.refreshChart();
        
        Utils.showToast(`Simulated ${count} messages`, 'info');
    }
};

// Add styles for campaign modal details
const modalStyles = document.createElement('style');
modalStyles.textContent = `
    .campaign-details {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }
    
    .detail-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
    }
    
    .detail-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    
    .detail-item .detail-label {
        font-size: 12px;
        color: var(--text-secondary);
        font-weight: 500;
    }
    
    .detail-item .detail-value {
        font-size: 16px;
        font-weight: 600;
        color: var(--text-primary);
    }
    
    .campaign-stats h4 {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 12px;
    }
    
    .stats-bar {
        display: flex;
        height: 24px;
        border-radius: 12px;
        overflow: hidden;
        background: var(--bg-tertiary);
    }
    
    .stat-segment {
        transition: width 0.3s ease;
    }
    
    .stat-segment.delivered {
        background: #22C55E;
    }
    
    .stat-segment.failed {
        background: #EF4444;
    }
    
    .stat-segment.blocked {
        background: #F59E0B;
    }
    
    .stats-legend {
        display: flex;
        gap: 24px;
        margin-top: 12px;
        font-size: 12px;
        color: var(--text-secondary);
    }
    
    .stats-legend span {
        display: flex;
        align-items: center;
        gap: 6px;
    }
    
    .stats-legend .legend-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
    }
`;
document.head.appendChild(modalStyles);

// Export for use in other modules
window.DashboardModule = DashboardModule;

