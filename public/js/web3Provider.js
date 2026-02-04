/**
 * Web3 Provider - Core Ethers.js Integration for Nebula Core
 * Handles wallet connection, provider management, and blockchain interactions
 */

// Chain configuration (loaded inline for browser)
const CHAINS = {
    1: { id: 1, name: 'Ethereum', symbol: 'ETH', decimals: 18, rpcUrls: ['https://cloudflare-eth.com', 'https://eth.llamarpc.com'], blockExplorer: 'https://etherscan.io', color: '#627EEA', logo: '◆' },
    10: { id: 10, name: 'Optimism', symbol: 'ETH', decimals: 18, rpcUrls: ['https://mainnet.optimism.io', 'https://optimism.llamarpc.com'], blockExplorer: 'https://optimistic.etherscan.io', color: '#FF0420', logo: '🔴' },
    42161: { id: 42161, name: 'Arbitrum One', symbol: 'ETH', decimals: 18, rpcUrls: ['https://arb1.arbitrum.io/rpc', 'https://arbitrum.llamarpc.com'], blockExplorer: 'https://arbiscan.io', color: '#28A0F0', logo: '🔵' },
    43114: { id: 43114, name: 'Avalanche', symbol: 'AVAX', decimals: 18, rpcUrls: ['https://api.avax.network/ext/bc/C/rpc', 'https://avalanche.llamarpc.com'], blockExplorer: 'https://snowtrace.io', color: '#E84142', logo: '🔺' },
    137: { id: 137, name: 'Polygon', symbol: 'MATIC', decimals: 18, rpcUrls: ['https://polygon-rpc.com', 'https://polygon.llamarpc.com'], blockExplorer: 'https://polygonscan.com', color: '#8247E5', logo: '🟣' },
    8453: { id: 8453, name: 'Base', symbol: 'ETH', decimals: 18, rpcUrls: ['https://mainnet.base.org', 'https://base.llamarpc.com'], blockExplorer: 'https://basescan.org', color: '#0052FF', logo: '🔷' },
};

const SUPPORTED_CHAIN_IDS = Object.keys(CHAINS).map(Number);

class Web3Provider {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.address = null;
        this.chainId = null;
        this.isConnected = false;
        this.listeners = {};
    }

    /**
     * Check if MetaMask/injected provider is available
     */
    isWalletAvailable() {
        return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
    }

    /**
     * Connect to MetaMask wallet
     */
    async connect() {
        if (!this.isWalletAvailable()) {
            throw new Error('No wallet detected. Please install MetaMask.');
        }

        try {
            // Request account access
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            if (accounts.length === 0) {
                throw new Error('No accounts found. Please unlock your wallet.');
            }

            // Create ethers provider from injected provider
            this.provider = new ethers.BrowserProvider(window.ethereum);
            this.signer = await this.provider.getSigner();
            this.address = await this.signer.getAddress();

            // Get current chain
            const network = await this.provider.getNetwork();
            this.chainId = Number(network.chainId);
            this.isConnected = true;

            // Setup event listeners
            this._setupEventListeners();

            this._emit('connected', {
                address: this.address,
                chainId: this.chainId,
            });

            return {
                address: this.address,
                chainId: this.chainId,
            };
        } catch (error) {
            console.error('Connection error:', error);
            throw error;
        }
    }

    /**
     * Disconnect wallet
     */
    disconnect() {
        this.provider = null;
        this.signer = null;
        this.address = null;
        this.chainId = null;
        this.isConnected = false;
        this._emit('disconnected');
    }

    /**
     * Get balance for an address on a specific chain
     */
    async getBalance(address, chainId = null) {
        const targetChainId = chainId || this.chainId || 1;
        const chain = CHAINS[targetChainId];

        if (!chain) {
            throw new Error(`Unsupported chain: ${targetChainId}`);
        }

        try {
            // Use RPC provider for the target chain
            const provider = new ethers.JsonRpcProvider(chain.rpcUrls[0]);
            const balance = await provider.getBalance(address);

            return {
                wei: balance.toString(),
                formatted: ethers.formatEther(balance),
                symbol: chain.symbol,
                chainId: targetChainId,
            };
        } catch (error) {
            console.error(`Error fetching balance for chain ${targetChainId}:`, error);
            // Try fallback RPC
            if (chain.rpcUrls.length > 1) {
                try {
                    const fallbackProvider = new ethers.JsonRpcProvider(chain.rpcUrls[1]);
                    const balance = await fallbackProvider.getBalance(address);
                    return {
                        wei: balance.toString(),
                        formatted: ethers.formatEther(balance),
                        symbol: chain.symbol,
                        chainId: targetChainId,
                    };
                } catch (fallbackError) {
                    console.error('Fallback RPC also failed:', fallbackError);
                }
            }
            return { wei: '0', formatted: '0.0', symbol: chain.symbol, chainId: targetChainId, error: true };
        }
    }

    /**
     * Get balances across all supported chains
     */
    async getAllBalances(address) {
        const balances = {};
        const promises = SUPPORTED_CHAIN_IDS.map(async (chainId) => {
            const balance = await this.getBalance(address, chainId);
            balances[chainId] = balance;
        });

        await Promise.all(promises);
        return balances;
    }

    /**
     * Switch to a different chain
     */
    async switchChain(chainId) {
        if (!this.isWalletAvailable()) {
            throw new Error('No wallet connected');
        }

        const chain = CHAINS[chainId];
        if (!chain) {
            throw new Error(`Unsupported chain: ${chainId}`);
        }

        const chainIdHex = '0x' + chainId.toString(16);

        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: chainIdHex }],
            });
            this.chainId = chainId;
            this._emit('chainChanged', chainId);
        } catch (error) {
            // Chain not added to wallet, try to add it
            if (error.code === 4902) {
                await this._addChain(chainId);
            } else {
                throw error;
            }
        }
    }

    /**
     * Add a new chain to the wallet
     */
    async _addChain(chainId) {
        const chain = CHAINS[chainId];
        if (!chain) return;

        try {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                    chainId: '0x' + chainId.toString(16),
                    chainName: chain.name,
                    nativeCurrency: {
                        name: chain.symbol,
                        symbol: chain.symbol,
                        decimals: chain.decimals,
                    },
                    rpcUrls: chain.rpcUrls,
                    blockExplorerUrls: [chain.blockExplorer],
                }],
            });
            this.chainId = chainId;
            this._emit('chainChanged', chainId);
        } catch (error) {
            console.error('Failed to add chain:', error);
            throw error;
        }
    }

    /**
     * Setup wallet event listeners
     */
    _setupEventListeners() {
        if (!window.ethereum) return;

        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length === 0) {
                this.disconnect();
            } else {
                this.address = accounts[0];
                this._emit('accountChanged', this.address);
            }
        });

        window.ethereum.on('chainChanged', (chainIdHex) => {
            this.chainId = parseInt(chainIdHex, 16);
            this._emit('chainChanged', this.chainId);
            // Reload provider for new chain
            if (this.isConnected) {
                this.provider = new ethers.BrowserProvider(window.ethereum);
            }
        });

        window.ethereum.on('disconnect', () => {
            this.disconnect();
        });
    }

    /**
     * Event emitter
     */
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    off(event, callback) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }

    _emit(event, data) {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach(callback => callback(data));
    }

    /**
     * Truncate address for display
     */
    static truncateAddress(address, chars = 4) {
        if (!address) return '';
        return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
    }

    /**
     * Get chain info
     */
    getChainInfo(chainId = null) {
        return CHAINS[chainId || this.chainId] || null;
    }

    /**
     * Get all supported chains
     */
    getSupportedChains() {
        return Object.values(CHAINS);
    }
}

// Global instance
window.web3Provider = new Web3Provider();
