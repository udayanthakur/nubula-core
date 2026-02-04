/**
 * Web3 API Routes for Nebula Core
 * Provides backend endpoints for blockchain data
 */

const express = require('express');
const router = express.Router();
const { CHAINS, SUPPORTED_CHAIN_IDS, getChainById, getExplorerAddressUrl } = require('../config/chains');

// Simple in-memory cache for balance requests
const balanceCache = new Map();
const CACHE_TTL = 30000; // 30 seconds

/**
 * GET /api/web3/chains
 * Returns list of supported chains
 */
router.get('/chains', (req, res) => {
    const chains = SUPPORTED_CHAIN_IDS.map(id => {
        const chain = getChainById(id);
        return {
            id: chain.id,
            name: chain.name,
            symbol: chain.symbol,
            logo: chain.logo,
            color: chain.color,
            blockExplorer: chain.blockExplorer,
            isTestnet: chain.isTestnet || false,
        };
    });

    res.json({
        success: true,
        chains,
        count: chains.length,
    });
});

/**
 * GET /api/web3/chain/:chainId
 * Returns details for a specific chain
 */
router.get('/chain/:chainId', (req, res) => {
    const chainId = parseInt(req.params.chainId, 10);
    const chain = getChainById(chainId);

    if (!chain) {
        return res.status(404).json({
            success: false,
            error: `Chain ${chainId} not supported`,
        });
    }

    res.json({
        success: true,
        chain: {
            id: chain.id,
            name: chain.name,
            symbol: chain.symbol,
            decimals: chain.decimals,
            logo: chain.logo,
            color: chain.color,
            blockExplorer: chain.blockExplorer,
            rpcUrl: chain.rpcUrls[0], // Only expose first RPC
            isTestnet: chain.isTestnet || false,
        },
    });
});

/**
 * GET /api/web3/explorer/:chainId/:address
 * Returns block explorer URL for an address
 */
router.get('/explorer/:chainId/:address', (req, res) => {
    const chainId = parseInt(req.params.chainId, 10);
    const { address } = req.params;

    const url = getExplorerAddressUrl(chainId, address);

    if (!url) {
        return res.status(404).json({
            success: false,
            error: `Chain ${chainId} not supported`,
        });
    }

    res.json({
        success: true,
        url,
    });
});

/**
 * GET /api/web3/status
 * Returns Web3 service status
 */
router.get('/status', (req, res) => {
    res.json({
        success: true,
        status: 'operational',
        supportedChains: SUPPORTED_CHAIN_IDS.length,
        cacheEntries: balanceCache.size,
        timestamp: new Date().toISOString(),
    });
});

/**
 * POST /api/web3/validate-address
 * Validates an Ethereum address
 */
router.post('/validate-address', (req, res) => {
    const { address } = req.body;

    if (!address) {
        return res.status(400).json({
            success: false,
            error: 'Address is required',
        });
    }

    // Basic Ethereum address validation
    const isValid = /^0x[a-fA-F0-9]{40}$/.test(address);

    res.json({
        success: true,
        address,
        isValid,
        checksummed: isValid ? address : null,
    });
});

module.exports = router;
