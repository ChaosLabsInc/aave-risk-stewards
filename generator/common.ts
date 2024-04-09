import * as addressBook from '@bgd-labs/aave-address-book';
import { FEATURE, Options, PoolIdentifier } from './types';
import {
    arbitrum,
    avalanche,
    mainnet,
    metis,
    optimism,
    polygon,
    base,
    bsc,
    gnosis,
    scroll,
    fantom,
    harmonyOne,
} from 'viem/chains';

export const AVAILABLE_CHAINS = [
    'Ethereum',
    'Optimism',
    'Arbitrum',
    'Polygon',
    'Avalanche',
    'Fantom',
    'Harmony',
    'Metis',
    'Base',
    'BNB',
    'Gnosis',
    'Scroll',
] as const;

export function getAssets(pool: PoolIdentifier): string[] {
    const assets = addressBook[pool].ASSETS;
    return Object.keys(assets);
}

export function getPoolChain(pool: PoolIdentifier) {
    const chain = AVAILABLE_CHAINS.find((chain) => pool.indexOf(chain) !== -1);
    if (!chain) throw new Error('Cannot find chain for pool');
    return chain;
}

export function getDate() {
    const date = new Date();
    const years = date.getFullYear();
    const months = date.getMonth() + 1; // it's JS so months are 0-indexed
    const day = date.getDate();
    return `${years}${months <= 9 ? '0' : ''}${months}${day <= 9 ? '0' : ''}${day}`;
}

/**
 * Prefix with the date for proper sorting
 * @param options
 * @returns
 */
export function generateConfigName(options: Options) {
    return `${options.date}_${options.pools.length === 1 ? getPoolName(options.pools[0]) : 'Multi'}_${options.shortName}`;
}

/**
 * Suffix with the date as prefixing would generate invalid contract names
 * @param options
 * @param pool
 * @returns
 */
export function generateContractName(options: Options, feature: FEATURE, pool?: PoolIdentifier) {
    return `${pool ? getPoolName(pool): ''}${feature}_${options.date}`;
}

export function getPoolName(pool: PoolIdentifier) {
    const poolChain = getPoolChain(pool);
    const fomrattedPoolChain = poolChain == 'Ethereum' ? 'Mainnet' : poolChain;
    return fomrattedPoolChain;
}

export function pascalCase(str: string) {
    return str
        .replace(/[\W]/g, ' ') // remove special chars as this is used for solc contract name
        .replace(/(\w)(\w*)/g, function (g0, g1, g2) {
            return g1.toUpperCase() + g2;
        })
        .replace(/ /g, '');
}

export const CHAIN_TO_CHAIN_ID = {
    Ethereum: mainnet.id,
    Polygon: polygon.id,
    Optimism: optimism.id,
    Arbitrum: arbitrum.id,
    Avalanche: avalanche.id,
    Metis: metis.id,
    Base: base.id,
    BNB: bsc.id,
    Gnosis: gnosis.id,
    Scroll: scroll.id,
    Fantom: fantom.id,
    Harmony: harmonyOne.id,
};
