import fs from 'fs';
import path from 'path';
import { generateContractName, generateConfigName } from './common';
import { capsUpdatesTemplate } from './templates/capsUpdates.template';
import { confirm } from '@inquirer/prompts';
import { ConfigFile, FEATURE, Files, Options, PoolConfigs, PoolIdentifier, PoolOptions } from './types';
import prettier from 'prettier';

/**
 * Generates all the file contents for tests/payloads & script
 * @param options
 * @param poolConfigs
 * @returns
 */
export async function generateFiles(options: Options, poolConfigs: PoolConfigs): Promise<Files> {
    const prettierSolCfg = await prettier.resolveConfig('foo.sol');
    const prettierTsCfg = await prettier.resolveConfig('foo.ts');
    const jsonConfig = await prettier.format(
        `import {ConfigFile} from '../../generator/types';
        export const config: ConfigFile = ${JSON.stringify({
            rootOptions: options,
            poolOptions: (Object.keys(poolConfigs) as PoolIdentifier[]).reduce<PoolOptions>((acc, pool) => {
                acc[pool] = { configs: poolConfigs[pool]!.configs, cache: poolConfigs[pool]!.cache };
                return acc;
            }, {}),
        } as ConfigFile)}`,
        { ...prettierTsCfg, filepath: 'foo.ts' },
    );

    async function createPayload(options: Options, pool: PoolIdentifier) {
        const contractName = await generateContractName(options, FEATURE.CAPS_UPDATE, pool);
        const template = await capsUpdatesTemplate(options, poolConfigs[pool]!, pool);

        const payload = await prettier.format(template, {
            ...prettierSolCfg,
            filepath: 'foo.sol',
        });
        return {
            payload,
            contractName: contractName,
        };
    }
    return {
        jsonConfig,
        payloads: await Promise.all(options.pools.map((pool) => createPayload(options, pool))),
    };
}

async function askBeforeWrite(options: Options, path: string, content: string) {
    if (!options.force && fs.existsSync(path)) {
        const currentContent = fs.readFileSync(path, { encoding: 'utf8' });
        // skip if content did not change
        if (currentContent === content) return;
        const force = await confirm({
            message: `A file already exists at ${path} do you want to overwrite`,
            default: false,
        });
        if (!force) return;
    }
    fs.writeFileSync(path, content);
}

/**
 * Writes the files according to defined folder/file format
 * @param options
 * @param param1
 */
export async function writeFiles(options: Options, { jsonConfig, payloads }: Files) {
    const baseFolder = path.join(process.cwd(), 'src');
    if (!fs.existsSync(baseFolder)) {
        fs.mkdirSync(baseFolder, { recursive: true });
    }

    // write config
    //await askBeforeWrite(options, path.join(baseFolder, `${generateConfigName(options)}_config.ts`), jsonConfig);

    for (const { payload, contractName } of payloads) {
        await askBeforeWrite(options, path.join(baseFolder, `${contractName}.s.sol`), payload);
    }
}
