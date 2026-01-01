/**
 * WhatsApp Business Platform - Charts Module
 * ============================================
 * Handles Chart.js initialization and updates
 */

const ChartsModule = {
    // Chart instance reference
    activityChart: null,

    /**
     * Initialize charts
     */
    init() {
        this.initActivityChart();
    },

    /**
     * Initialize the message activity timeline chart
     */
    initActivityChart() {
        const ctx = document.getElementById('activity-chart');
        if (!ctx) return;

        // Destroy existing chart if it exists
        if (this.activityChart) {
            this.activityChart.destroy();
        }

        // Get chart data based on current filter
        const filter = document.getElementById('timeline-filter')?.value || '24h';
        const data = Utils.generateChartData(filter);

        // Check if dark mode is active
        const isDarkMode = document.body.classList.contains('dark-mode');
        const textColor = isDarkMode ? '#A0A0A0' : '#6B7280';
        const gridColor = isDarkMode ? '#2A2A4A' : '#E5E7EB';

        // Create chart
        this.activityChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Sent',
                        data: data.sentData,
                        borderColor: '#F97316',
                        backgroundColor: 'rgba(249, 115, 22, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: false,
                        pointRadius: 0,
                        pointHoverRadius: 5
                    },
                    {
                        label: 'Delivered',
                        data: data.deliveredData,
                        borderColor: '#22C55E',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: false,
                        pointRadius: 0,
                        pointHoverRadius: 5
                    },
                    {
                        label: 'Failed',
                        data: data.failedData,
                        borderColor: '#6B7280',
                        backgroundColor: 'rgba(107, 114, 128, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: false,
                        pointRadius: 0,
                        pointHoverRadius: 5
                    },
                    {
                        label: 'Blocked',
                        data: data.blockedData,
                        borderColor: '#EAB308',
                        backgroundColor: 'rgba(234, 179, 8, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: false,
                        pointRadius: 0,
                        pointHoverRadius: 5
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        display: false // We have custom legend
                    },
                    tooltip: {
                        backgroundColor: isDarkMode ? '#1A1A2E' : '#FFFFFF',
                        titleColor: isDarkMode ? '#EAEAEA' : '#1A1A1A',
                        bodyColor: isDarkMode ? '#A0A0A0' : '#6B7280',
                        borderColor: gridColor,
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${Utils.formatNumber(context.raw)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: gridColor,
                            drawBorder: false
                        },
                        ticks: {
                            color: textColor,
                            font: {
                                family: 'Inter',
                                size: 11
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: gridColor,
                            drawBorder: false
                        },
                        ticks: {
                            color: textColor,
                            font: {
                                family: 'Inter',
                                size: 11
                            },
                            callback: function(value) {
                                return Utils.formatNumber(value);
                            }
                        }
                    }
                },
                animation: {
                    duration: 750,
                    easing: 'easeInOutQuart'
                }
            }
        });

        // Setup filter change handler
        this.setupFilterHandler();
    },

    /**
     * Setup timeline filter change handler
     */
    setupFilterHandler() {
        const filterSelect = document.getElementById('timeline-filter');
        if (!filterSelect) return;

        filterSelect.addEventListener('change', (e) => {
            this.updateChartData(e.target.value);
        });
    },

    /**
     * Update chart data based on filter
     * @param {string} filter - '24h' or '7d'
     */
    updateChartData(filter) {
        if (!this.activityChart) return;

        const data = Utils.generateChartData(filter);

        // Update labels
        this.activityChart.data.labels = data.labels;

        // Update datasets
        this.activityChart.data.datasets[0].data = data.sentData;
        this.activityChart.data.datasets[1].data = data.deliveredData;
        this.activityChart.data.datasets[2].data = data.failedData;
        this.activityChart.data.datasets[3].data = data.blockedData;

        // Animate the update
        this.activityChart.update('active');
    },

    /**
     * Add new data point to chart (for real-time updates)
     * @param {Object} dataPoint - {sent, delivered, failed, blocked}
     */
    addDataPoint(dataPoint) {
        if (!this.activityChart) return;

        const chart = this.activityChart;
        const maxPoints = chart.data.labels.length;

        // Add new label
        const currentHour = new Date().getHours().toString().padStart(2, '0');
        chart.data.labels.push(currentHour);

        // Add new data to each dataset
        chart.data.datasets[0].data.push(dataPoint.sent || 0);
        chart.data.datasets[1].data.push(dataPoint.delivered || 0);
        chart.data.datasets[2].data.push(dataPoint.failed || 0);
        chart.data.datasets[3].data.push(dataPoint.blocked || 0);

        // Remove oldest point if we have too many
        if (chart.data.labels.length > maxPoints) {
            chart.data.labels.shift();
            chart.data.datasets.forEach(dataset => dataset.data.shift());
        }

        chart.update('active');
    },

    /**
     * Refresh chart with current state data
     */
    refreshChart() {
        const filter = document.getElementById('timeline-filter')?.value || '24h';
        this.updateChartData(filter);
    },

    /**
     * Destroy chart instance
     */
    destroy() {
        if (this.activityChart) {
            this.activityChart.destroy();
            this.activityChart = null;
        }
    }
};

// Export for use in other modules
window.ChartsModule = ChartsModule;

