/**
 * Multi-Chain Configuration for Nebula Core
 * Defines supported blockchain networks with RPC endpoints and metadata
 */

const CHAINS = {
    // Ethereum Mainnet
    1: {
        id: 1,
        name: 'Ethereum',
        shortName: 'ETH',
        symbol: 'ETH',
        decimals: 18,
        rpcUrls: [
            'https://cloudflare-eth.com',
            'https://eth.llamarpc.com',
            'https://rpc.ankr.com/eth',
        ],
        blockExplorer: 'https://etherscan.io',
        color: '#627EEA',
        logo: '◆',
        isTestnet: false,
    },

    // Optimism
    10: {
        id: 10,
        name: 'Optimism',
        shortName: 'OP',
        symbol: 'ETH',
        decimals: 18,
        rpcUrls: [
            'https://mainnet.optimism.io',
            'https://optimism.llamarpc.com',
            'https://rpc.ankr.com/optimism',
        ],
        blockExplorer: 'https://optimistic.etherscan.io',
        color: '#FF0420',
        logo: '🔴',
        isTestnet: false,
    },

    // Arbitrum One
    42161: {
        id: 42161,
        name: 'Arbitrum One',
        shortName: 'ARB',
        symbol: 'ETH',
        decimals: 18,
        rpcUrls: [
            'https://arb1.arbitrum.io/rpc',
            'https://arbitrum.llamarpc.com',
            'https://rpc.ankr.com/arbitrum',
        ],
        blockExplorer: 'https://arbiscan.io',
        color: '#28A0F0',
        logo: '🔵',
        isTestnet: false,
    },

    // Avalanche C-Chain
    43114: {
        id: 43114,
        name: 'Avalanche',
        shortName: 'AVAX',
        symbol: 'AVAX',
        decimals: 18,
        rpcUrls: [
            'https://api.avax.network/ext/bc/C/rpc',
            'https://avalanche.llamarpc.com',
            'https://rpc.ankr.com/avalanche',
        ],
        blockExplorer: 'https://snowtrace.io',
        color: '#E84142',
        logo: '🔺',
        isTestnet: false,
    },

    // Polygon
    137: {
        id: 137,
        name: 'Polygon',
        shortName: 'MATIC',
        symbol: 'MATIC',
        decimals: 18,
        rpcUrls: [
            'https://polygon-rpc.com',
            'https://polygon.llamarpc.com',
            'https://rpc.ankr.com/polygon',
        ],
        blockExplorer: 'https://polygonscan.com',
        color: '#8247E5',
        logo: '🟣',
        isTestnet: false,
    },

    // Base
    8453: {
        id: 8453,
        name: 'Base',
        shortName: 'BASE',
        symbol: 'ETH',
        decimals: 18,
        rpcUrls: [
            'https://mainnet.base.org',
            'https://base.llamarpc.com',
            'https://rpc.ankr.com/base',
        ],
        blockExplorer: 'https://basescan.org',
        color: '#0052FF',
        logo: '🔷',
        isTestnet: false,
    },

    // Fantom Opera (Sonic)
    250: {
        id: 250,
        name: 'Fantom',
        shortName: 'FTM',
        symbol: 'FTM',
        decimals: 18,
        rpcUrls: [
            'https://rpc.ftm.tools',
            'https://fantom.publicnode.com',
            'https://rpc.ankr.com/fantom',
        ],
        blockExplorer: 'https://ftmscan.com',
        color: '#1969FF',
        logo: '👻',
        isTestnet: false,
        features: ['DAG-Based', 'aBFT Consensus', '10,000+ TPS', '90% Fee Share'],
    },

    // Tron Mainnet
    728126428: {
        id: 728126428,
        name: 'Tron',
        shortName: 'TRX',
        symbol: 'TRX',
        decimals: 6,
        rpcUrls: [
            'https://api.trongrid.io',
            'https://rpc.ankr.com/tron_jsonrpc',
        ],
        blockExplorer: 'https://tronscan.org',
        color: '#FF0013',
        logo: '🔴',
        isTestnet: false,
        features: ['DPoS', 'Free Bandwidth', 'Stablecoin Hub', '27 Super Representatives'],
        isTron: true, // Special flag for Tron-specific handling
    },

    // Cronos Mainnet
    25: {
        id: 25,
        name: 'Cronos',
        shortName: 'CRO',
        symbol: 'CRO',
        decimals: 18,
        rpcUrls: [
            'https://evm.cronos.org',
            'https://cronos.publicnode.com',
            'https://rpc.ankr.com/cronos',
        ],
        blockExplorer: 'https://cronoscan.com',
        color: '#002D74',
        logo: '💎',
        isTestnet: false,
        features: ['Cosmos SDK', 'IBC Interoperability', 'Tendermint Consensus'],
    },

    // Sepolia Testnet (for development)
    11155111: {
        id: 11155111,
        name: 'Sepolia',
        shortName: 'SEP',
        symbol: 'ETH',
        decimals: 18,
        rpcUrls: [
            'https://rpc.sepolia.org',
            'https://eth-sepolia.public.blastapi.io',
        ],
        blockExplorer: 'https://sepolia.etherscan.io',
        color: '#CFB5F0',
        logo: '🧪',
        isTestnet: true,
    },
};

// Default chain (Ethereum Mainnet)
const DEFAULT_CHAIN_ID = 1;

// Get all supported chain IDs
const SUPPORTED_CHAIN_IDS = Object.keys(CHAINS).map(Number);

// Get mainnet chains only
const MAINNET_CHAINS = Object.values(CHAINS).filter(chain => !chain.isTestnet);

/**
 * Get chain configuration by ID
 */
function getChainById(chainId) {
    return CHAINS[chainId] || null;
}

/**
 * Get chain name by ID
 */
function getChainName(chainId) {
    const chain = CHAINS[chainId];
    return chain ? chain.name : `Unknown (${chainId})`;
}

/**
 * Check if chain is supported
 */
function isChainSupported(chainId) {
    return SUPPORTED_CHAIN_IDS.includes(Number(chainId));
}

/**
 * Get block explorer URL for address
 */
function getExplorerAddressUrl(chainId, address) {
    const chain = CHAINS[chainId];
    if (!chain) return null;
    return `${chain.blockExplorer}/address/${address}`;
}

/**
 * Get block explorer URL for transaction
 */
function getExplorerTxUrl(chainId, txHash) {
    const chain = CHAINS[chainId];
    if (!chain) return null;
    return `${chain.blockExplorer}/tx/${txHash}`;
}

// Export for Node.js (backend)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CHAINS,
        DEFAULT_CHAIN_ID,
        SUPPORTED_CHAIN_IDS,
        MAINNET_CHAINS,
        getChainById,
        getChainName,
        isChainSupported,
        getExplorerAddressUrl,
        getExplorerTxUrl,
    };
}
