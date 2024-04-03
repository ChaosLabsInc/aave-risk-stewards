import path from 'path';
import { Command, Option } from 'commander';
import { input, checkbox } from '@inquirer/prompts';
import { CHAIN_TO_CHAIN_ID, getDate, getPoolChain, pascalCase } from './common';
import { ConfigFile, FEATURE, Options, POOLS, PoolCache, PoolConfigs, PoolIdentifier } from './types';
import { capsUpdates } from './features/capsUpdates';
import { generateFiles, writeFiles } from './generator';
import { CHAIN_ID_CLIENT_MAP } from '@bgd-labs/js-utils';
import { getBlockNumber } from 'viem/actions';
import { CapsUpdate } from './features/types';
import { contractsExecutor } from './executor';

const program = new Command();

program
    .name('risk-streward-generator')
    .description('CLI to generate aave risk streward proposals')
    .version('1.0.0')
    .addOption(new Option('-f, --force', 'force creation (might overwrite existing files)'))
    .addOption(new Option('-p, --pools <pools...>').choices(POOLS))
    .addOption(new Option('-t, --title <string>', 'title'))
    .addOption(new Option('-a, --author <string>', 'author'))
    .addOption(new Option('-d, --discussion <string>', 'forum link'))
    .addOption(new Option('-c, --configFile <string>', 'path to config file'))
    .addOption(new Option('-exec, --exec', 'execute contracts after generation'))
    .allowExcessArguments(false)
    .parse(process.argv);

let options = program.opts<Options>();
let poolConfigs: PoolConfigs = {};

const FEATURE_MODULES_V3 = [capsUpdates];

async function generateDeterministicPoolCache(pool: PoolIdentifier): Promise<PoolCache> {
    const chain = getPoolChain(pool);
    const client = CHAIN_ID_CLIENT_MAP[CHAIN_TO_CHAIN_ID[chain]];
    return { blockNumber: Number(await getBlockNumber(client)) };
}

async function fetchPoolOptions(pool: PoolIdentifier) {
    poolConfigs[pool] = {
        configs: {},
        artifacts: [],
        cache: await generateDeterministicPoolCache(pool),
    };

    const features = await checkbox({
        message: `What do you want to do on ${pool}?`,
        choices: FEATURE_MODULES_V3.map((m) => ({ value: m.value, name: m.description })),
    });

    for (const feature of features) {
        const module = FEATURE_MODULES_V3.find((m) => m.value === feature)!;
        poolConfigs[pool]!.configs[feature] = await module.cli({
            options,
            pool,
            cache: poolConfigs[pool]!.cache,
        });

        poolConfigs[pool]!.artifacts.push(
            module.build({
                options,
                pool,
                cfg: poolConfigs[pool]!.configs[feature] as CapsUpdate[],
                cache: poolConfigs[pool]!.cache,
            }),
        );
    }
}

async function execute() {
    if (options.configFile) {
        const { config: cfgFile }: { config: ConfigFile } = await import(path.join(process.cwd(), options.configFile));
        options = { ...options, ...cfgFile.rootOptions };
        poolConfigs = cfgFile.poolOptions as object;

        for (const pool of options.pools) {
            if (poolConfigs[pool]) {
                poolConfigs[pool]!.artifacts = [];

                for (const feature of Object.keys(poolConfigs[pool]!.configs)) {
                    const module = FEATURE_MODULES_V3.find((m) => m.value === feature)!;
                    poolConfigs[pool]!.artifacts.push(
                        module.build({
                            options,
                            pool,
                            cfg: poolConfigs[pool]!.configs[feature as FEATURE] as CapsUpdate[],
                            cache: poolConfigs[pool]!.cache,
                        }),
                    );
                }
            } else {
                await fetchPoolOptions(pool);
            }
        }
    } else {
        options.pools = await checkbox({
            message: 'Chains this proposal targets',
            choices: POOLS.map((v) => ({ name: v, value: v })),
            required: true,
        });

        if (!options.title) {
            options.title = await input({
                message: 'Short title of your proposal that will be used as contract name(please refrain from including author or date)',
                validate(input) {
                    if (input.length == 0) return "Your title can't be empty";
                    if (input.trim().length > 80) return 'Your title is too long';
                    return true;
                },
            });
        }

        options.shortName = pascalCase(options.title);
        options.date = getDate();

        if (!options.author) {
            options.author = await input({
                message: 'Author of your proposal',
                validate(input) {
                    if (input.length == 0) return "Your author can't be empty";
                    return true;
                },
            });
        }

        if (!options.discussion) {
            options.discussion = await input({
                message: 'Link to forum discussion',
            });
        }

        for (const pool of options.pools) {
            await fetchPoolOptions(pool);
        }
    }

    try {
        const files = await generateFiles(options, poolConfigs);
        await writeFiles(options, files);
        
        if (options?.exec) {
            await contractsExecutor(options);
        }
    } catch (e) {
        console.log(JSON.stringify({ options, poolConfigs }, null, 2));
        throw e;
    }
}

execute();
