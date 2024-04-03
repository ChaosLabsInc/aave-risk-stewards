import { CapsUpdate } from './features/types';

export const POOLS = [
    'AaveV3Ethereum',
    'AaveV3Polygon',
    'AaveV3Avalanche',
    'AaveV3Optimism',
    'AaveV3Arbitrum',
    'AaveV3Metis',
    'AaveV3Base',
    'AaveV3Gnosis',
    'AaveV3Scroll',
    'AaveV3BNB',
] as const;

export type PoolIdentifier = (typeof POOLS)[number];

export interface Options {
    force?: boolean;
    pools: PoolIdentifier[];
    title: string;
    shortName: string;
    author: string;
    discussion: string;
    snapshot?: string;
    configFile?: string;
    date: string;
    exec?: boolean;
}

export type PoolConfigs = Partial<Record<PoolIdentifier, PoolConfig>>;

export type CodeArtifact = {
    code?: {
        name?: string[];
        fn?: string[];
    };
    test?: {
        fn?: string[];
    };
};

export enum FEATURE {
    CAPS_UPDATE = 'CAPS_UPDATE',
    OTHERS = 'OTHERS',
}

export interface FeatureModule<T extends {} = {}> {
    description: string;
    value: FEATURE;
    cli: (args: { options: Options; pool: PoolIdentifier; cache: PoolCache }) => Promise<T>;
    build: (args: { options: Options; pool: PoolIdentifier; cache: PoolCache; cfg: T }) => CodeArtifact;
}

export const ENGINE_FLAGS = {
    KEEP_CURRENT: 'KEEP_CURRENT',
} as const;

export type ConfigFile = {
    rootOptions: Options;
    poolOptions: PoolOptions;
};

export type PoolOptions = Partial<Record<PoolIdentifier, Omit<PoolConfig, 'artifacts'>>>;
export type PoolCache = { blockNumber: number };

export interface PoolConfig {
    artifacts: CodeArtifact[];
    configs: {
        [FEATURE.CAPS_UPDATE]?: CapsUpdate[];
        [FEATURE.OTHERS]?: {};
    };
    cache: PoolCache;
}

export type NumberInputValues = typeof ENGINE_FLAGS.KEEP_CURRENT | string;

export type Files = {
    jsonConfig: string;
    payloads: { payload: string; contractName: string }[];
};
