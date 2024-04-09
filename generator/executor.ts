import { generateContractName, getPoolChain } from './common';
import { FEATURE, Options, PoolIdentifier } from './types';
import { spawn } from 'node:child_process';

export async function contractsExecutor(options: Options) {
    async function createExeCommand(options: Options, pool: PoolIdentifier): Promise<string[]> {
        const contractName = await generateContractName(options, FEATURE.CAPS_UPDATE, pool);
        let chain = getPoolChain(pool).toLowerCase();
        chain = chain === 'ethereum' ? 'mainnet' : chain;
        let args: string[] = [];
        args.push(`${chain}-contract`);
        args.push(`contract_path=src/${contractName}.s.sol:${contractName}`);
        return args;
    }

    const contractArgs = await Promise.all(options.pools.map((pool) => createExeCommand(options, pool)));
    console.log('contract commands', contractArgs.join(" "));
    await Promise.all(contractArgs.map((contractArgs) => executeContract('make', contractArgs)));
}

async function executeContract(command: string, args: string[]) {
    console.log("*****************************************************************");
    console.log("Executing contract, it takes several minutes...");
    console.log("*****************************************************************");

    const cmdLine = spawn(command, args);
    cmdLine.stdout.on('data', output => {
        console.log("Output: ", output.toString());
    });
}
