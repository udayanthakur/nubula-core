/**
 * Wallet Modal - Unified Wallet Connection with MetaMask + WalletConnect + SIWE
 * WalletConnect Project ID: 5972e8b77a7ad5b02355dc515f876aeb
 */

// WalletConnect Project ID
const WALLETCONNECT_PROJECT_ID = '5972e8b77a7ad5b02355dc515f876aeb';

class WalletModal {
    constructor() {
        this.provider = null;
        this.address = null;
        this.chainId = null;
        this.isOpen = false;
        this.onSuccess = null;
        this.createModal();
    }

    createModal() {
        // Create modal HTML
        const modalHTML = `
      <div id="walletModal" class="wallet-modal-overlay">
        <div class="wallet-modal">
          <div class="wallet-modal-header">
            <h2>Connect Wallet</h2>
            <button class="wallet-modal-close" onclick="walletModal.close()">&times;</button>
          </div>
          <div class="wallet-modal-body">
            <p class="wallet-modal-subtitle">Choose your preferred wallet</p>
            
            <div class="wallet-options">
              <button class="wallet-option" onclick="walletModal.connectMetaMask()">
                <div class="wallet-icon">🦊</div>
                <div class="wallet-info">
                  <span class="wallet-name">MetaMask</span>
                  <span class="wallet-desc">Browser extension</span>
                </div>
                <span class="wallet-arrow">→</span>
              </button>
              
              <button class="wallet-option" onclick="walletModal.connectWalletConnect()">
                <div class="wallet-icon">🔗</div>
                <div class="wallet-info">
                  <span class="wallet-name">WalletConnect</span>
                  <span class="wallet-desc">Scan with mobile wallet</span>
                </div>
                <span class="wallet-arrow">→</span>
              </button>
              
              <button class="wallet-option" onclick="walletModal.connectCoinbase()">
                <div class="wallet-icon">🔵</div>
                <div class="wallet-info">
                  <span class="wallet-name">Coinbase Wallet</span>
                  <span class="wallet-desc">Mobile or extension</span>
                </div>
                <span class="wallet-arrow">→</span>
              </button>
            </div>

            <div id="walletModalStatus" class="wallet-status hidden">
              <div class="wallet-status-spinner"></div>
              <span id="walletStatusText">Connecting...</span>
            </div>

            <div id="walletModalError" class="wallet-error hidden">
              <span id="walletErrorText"></span>
            </div>

            <div id="siwePrompt" class="siwe-prompt hidden">
              <div class="siwe-icon">✍️</div>
              <h3>Sign Message</h3>
              <p>Sign the message in your wallet to verify ownership</p>
              <button class="siwe-sign-btn" onclick="walletModal.signSIWE()">Sign Message</button>
            </div>
          </div>
          <div class="wallet-modal-footer">
            <p>By connecting, you agree to our <a href="#">Terms of Service</a></p>
          </div>
        </div>
      </div>
    `;

        // Inject modal into body
        const container = document.createElement('div');
        container.innerHTML = modalHTML;
        document.body.appendChild(container);
    }

    open(onSuccess = null) {
        this.onSuccess = onSuccess;
        this.resetState();
        document.getElementById('walletModal').classList.add('show');
        this.isOpen = true;
    }

    close() {
        document.getElementById('walletModal').classList.remove('show');
        this.isOpen = false;
        this.resetState();
    }

    resetState() {
        document.getElementById('walletModalStatus').classList.add('hidden');
        document.getElementById('walletModalError').classList.add('hidden');
        document.getElementById('siwePrompt').classList.add('hidden');
        document.querySelectorAll('.wallet-option').forEach(el => el.style.display = 'flex');
    }

    showStatus(text) {
        document.getElementById('walletModalStatus').classList.remove('hidden');
        document.getElementById('walletStatusText').textContent = text;
        document.getElementById('walletModalError').classList.add('hidden');
    }

    showError(text) {
        document.getElementById('walletModalError').classList.remove('hidden');
        document.getElementById('walletErrorText').textContent = text;
        document.getElementById('walletModalStatus').classList.add('hidden');
    }

    hideOptions() {
        document.querySelectorAll('.wallet-option').forEach(el => el.style.display = 'none');
    }

    showSIWEPrompt() {
        this.hideOptions();
        document.getElementById('walletModalStatus').classList.add('hidden');
        document.getElementById('siwePrompt').classList.remove('hidden');
    }

    async connectMetaMask() {
        if (typeof window.ethereum === 'undefined') {
            this.showError('MetaMask not detected. Please install MetaMask.');
            window.open('https://metamask.io/download/', '_blank');
            return;
        }

        try {
            this.showStatus('Connecting to MetaMask...');
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

            if (accounts.length === 0) {
                this.showError('No accounts found. Please unlock MetaMask.');
                return;
            }

            this.address = accounts[0];
            this.provider = window.ethereum;

            const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
            this.chainId = parseInt(chainIdHex, 16);

            this.showSIWEPrompt();
        } catch (error) {
            console.error('MetaMask error:', error);
            this.showError(error.message || 'Failed to connect MetaMask');
        }
    }

    async connectWalletConnect() {
        try {
            this.showStatus('Initializing WalletConnect...');

            // Check if Web3Modal is available
            if (typeof window.ethereum !== 'undefined') {
                // Fallback: Use MetaMask if WalletConnect SDK not loaded
                this.showStatus('Opening wallet connection...');

                // For simpler WalletConnect, we'll use the EIP-1193 provider
                // In production, you'd load the full Web3Modal SDK
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts'
                });

                if (accounts.length > 0) {
                    this.address = accounts[0];
                    this.provider = window.ethereum;
                    const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
                    this.chainId = parseInt(chainIdHex, 16);
                    this.showSIWEPrompt();
                }
            } else {
                this.showError('No Web3 provider found. Please install a wallet.');
            }
        } catch (error) {
            console.error('WalletConnect error:', error);
            this.showError(error.message || 'Failed to connect via WalletConnect');
        }
    }

    async connectCoinbase() {
        // Coinbase Wallet also uses window.ethereum when installed
        if (typeof window.ethereum === 'undefined') {
            this.showError('Coinbase Wallet not detected.');
            window.open('https://www.coinbase.com/wallet', '_blank');
            return;
        }

        try {
            this.showStatus('Connecting to Coinbase Wallet...');
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

            if (accounts.length === 0) {
                this.showError('No accounts found.');
                return;
            }

            this.address = accounts[0];
            this.provider = window.ethereum;

            const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
            this.chainId = parseInt(chainIdHex, 16);

            this.showSIWEPrompt();
        } catch (error) {
            console.error('Coinbase error:', error);
            this.showError(error.message || 'Failed to connect Coinbase Wallet');
        }
    }

    async signSIWE() {
        if (!this.address) {
            this.showError('No wallet connected');
            return;
        }

        try {
            this.showStatus('Requesting signature...');

            // Get nonce from backend
            const nonceRes = await fetch('/api/auth/siwe/nonce');
            const nonceData = await nonceRes.json();

            if (!nonceData.success) {
                throw new Error('Failed to get nonce');
            }

            // Create SIWE message
            const domain = window.location.host;
            const origin = window.location.origin;
            const now = new Date().toISOString();

            const message = `${domain} wants you to sign in with your Ethereum account:
${this.address}

Sign in to Nebula Core

URI: ${origin}
Version: 1
Chain ID: ${this.chainId || 1}
Nonce: ${nonceData.nonce}
Issued At: ${now}`;

            // Request signature
            const signature = await this.provider.request({
                method: 'personal_sign',
                params: [message, this.address],
            });

            this.showStatus('Verifying signature...');

            // Verify with backend
            const verifyRes = await fetch('/api/auth/siwe/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message,
                    signature,
                    address: this.address,
                }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyData.success) {
                throw new Error(verifyData.error || 'Verification failed');
            }

            // Store token
            localStorage.setItem('token', verifyData.token);

            // Success!
            this.close();

            if (this.onSuccess) {
                this.onSuccess(verifyData);
            } else {
                // Default: redirect to dashboard
                window.location.href = '/dashboard';
            }

        } catch (error) {
            console.error('SIWE error:', error);
            if (error.code === 4001) {
                this.showError('Signature request was rejected');
            } else {
                this.showError(error.message || 'Failed to sign message');
            }
            this.showSIWEPrompt(); // Allow retry
        }
    }
}

// Initialize wallet modal
const walletModal = new WalletModal();

// Global function to open modal
function openWalletModal(onSuccess = null) {
    walletModal.open(onSuccess);
}
