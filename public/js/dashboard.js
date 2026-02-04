/**
 * Dashboard Controller - Handles UI interactions for Nebula Core Web3 Dashboard
 */

class DashboardController {
    constructor() {
        this.web3 = window.web3Provider;
        this.balances = {};
        this.isLoading = false;
        this.init();
    }

    init() {
        // Setup event listeners
        this.web3.on('connected', (data) => this.onConnected(data));
        this.web3.on('disconnected', () => this.onDisconnected());
        this.web3.on('chainChanged', (chainId) => this.onChainChanged(chainId));
        this.web3.on('accountChanged', (address) => this.onAccountChanged(address));

        // Check if already connected (page refresh)
        this.checkExistingConnection();
    }

    async checkExistingConnection() {
        if (this.web3.isWalletAvailable() && window.ethereum.selectedAddress) {
            try {
                await this.web3.connect();
            } catch (e) {
                console.log('No existing connection');
            }
        }
    }

    async connectWallet() {
        const btn = document.getElementById('connectWalletBtn');
        if (!btn) return;

        try {
            btn.innerHTML = '<span class="btn-spinner"></span> Connecting...';
            btn.disabled = true;

            if (!this.web3.isWalletAvailable()) {
                this.showToast('Please install MetaMask to connect', 'error');
                window.open('https://metamask.io/download/', '_blank');
                return;
            }

            await this.web3.connect();
        } catch (error) {
            console.error('Connection error:', error);
            this.showToast(error.message || 'Failed to connect wallet', 'error');
        } finally {
            btn.disabled = false;
            this.updateConnectButton();
        }
    }

    disconnectWallet() {
        this.web3.disconnect();
        this.balances = {};
        this.updateUI();
    }

    onConnected(data) {
        console.log('Connected:', data);
        this.showToast('Wallet connected successfully!', 'success');
        this.updateUI();
        this.loadAllBalances();
    }

    onDisconnected() {
        console.log('Disconnected');
        this.showToast('Wallet disconnected', 'info');
        this.updateUI();
    }

    onChainChanged(chainId) {
        console.log('Chain changed:', chainId);
        const chain = this.web3.getChainInfo(chainId);
        this.showToast(`Switched to ${chain?.name || 'Unknown chain'}`, 'info');
        this.updateUI();
    }

    onAccountChanged(address) {
        console.log('Account changed:', address);
        this.showToast('Account changed', 'info');
        this.updateUI();
        this.loadAllBalances();
    }

    updateUI() {
        this.updateConnectButton();
        this.updateWalletCard();
        this.updateChainCards();
        this.updatePortfolioValue();
    }

    updateConnectButton() {
        const btn = document.getElementById('connectWalletBtn');
        if (!btn) return;

        if (this.web3.isConnected) {
            btn.innerHTML = `<span class="wallet-dot connected"></span> ${Web3Provider.truncateAddress(this.web3.address)}`;
            btn.classList.add('connected');
            btn.onclick = () => this.showWalletMenu();
        } else {
            btn.innerHTML = '🔗 Connect Wallet';
            btn.classList.remove('connected');
            btn.onclick = () => this.connectWallet();
        }
    }

    updateWalletCard() {
        const walletCard = document.getElementById('walletCard');
        const notConnectedState = document.getElementById('notConnectedState');
        const connectedState = document.getElementById('connectedState');

        if (!walletCard) return;

        if (this.web3.isConnected) {
            notConnectedState?.classList.add('hidden');
            connectedState?.classList.remove('hidden');

            // Update address
            const addressEl = document.getElementById('walletAddress');
            if (addressEl) {
                addressEl.textContent = Web3Provider.truncateAddress(this.web3.address, 6);
                addressEl.title = this.web3.address;
            }

            // Update chain badge
            const chain = this.web3.getChainInfo();
            const chainBadge = document.getElementById('currentChainBadge');
            if (chainBadge && chain) {
                chainBadge.innerHTML = `<span>${chain.logo}</span> ${chain.name}`;
                chainBadge.style.borderColor = chain.color;
            }

            // Generate avatar
            const avatar = document.getElementById('walletAvatar');
            if (avatar) {
                avatar.style.background = this.generateGradient(this.web3.address);
            }
        } else {
            notConnectedState?.classList.remove('hidden');
            connectedState?.classList.add('hidden');
        }
    }

    async loadAllBalances() {
        if (!this.web3.isConnected) return;

        this.isLoading = true;
        this.showBalanceLoaders();

        try {
            this.balances = await this.web3.getAllBalances(this.web3.address);
            this.updateChainCards();
            this.updatePortfolioValue();
        } catch (error) {
            console.error('Error loading balances:', error);
            this.showToast('Failed to load some balances', 'error');
        } finally {
            this.isLoading = false;
        }
    }

    showBalanceLoaders() {
        const cards = document.querySelectorAll('.chain-balance');
        cards.forEach(card => {
            card.innerHTML = '<span class="balance-loader"></span>';
        });
    }

    updateChainCards() {
        const chains = this.web3.getSupportedChains();

        chains.forEach(chain => {
            const balanceEl = document.getElementById(`balance-${chain.id}`);
            if (!balanceEl) return;

            const balance = this.balances[chain.id];
            if (balance) {
                const formatted = parseFloat(balance.formatted).toFixed(4);
                balanceEl.innerHTML = `
          <span class="balance-amount">${formatted}</span>
          <span class="balance-symbol">${balance.symbol}</span>
        `;
            } else {
                balanceEl.innerHTML = `<span class="balance-amount">--</span>`;
            }
        });
    }

    updatePortfolioValue() {
        const totalEl = document.getElementById('totalPortfolioValue');
        if (!totalEl) return;

        if (!this.web3.isConnected) {
            totalEl.textContent = '$0.00';
            return;
        }

        // Calculate mock USD value (in real app, would fetch from price API)
        let totalUsd = 0;
        const mockPrices = { ETH: 2000, AVAX: 30, MATIC: 0.90 };

        Object.values(this.balances).forEach(balance => {
            const price = mockPrices[balance.symbol] || 0;
            totalUsd += parseFloat(balance.formatted) * price;
        });

        totalEl.textContent = `$${totalUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    async switchChain(chainId) {
        try {
            await this.web3.switchChain(chainId);
        } catch (error) {
            this.showToast(error.message || 'Failed to switch chain', 'error');
        }
    }

    showWalletMenu() {
        const menu = document.getElementById('walletMenu');
        if (menu) {
            menu.classList.toggle('show');
        }
    }

    copyAddress() {
        if (this.web3.address) {
            navigator.clipboard.writeText(this.web3.address);
            this.showToast('Address copied to clipboard', 'success');
        }
    }

    openExplorer() {
        const chain = this.web3.getChainInfo();
        if (chain && this.web3.address) {
            window.open(`${chain.blockExplorer}/address/${this.web3.address}`, '_blank');
        }
    }

    generateGradient(address) {
        const hash = address.slice(2, 10);
        const color1 = '#' + hash.slice(0, 6);
        const color2 = '#' + hash.slice(2, 8);
        return `linear-gradient(135deg, ${color1}, ${color2})`;
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer') || this.createToastContainer();

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
      <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</span>
      <span class="toast-message">${message}</span>
    `;

        container.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new DashboardController();
});
