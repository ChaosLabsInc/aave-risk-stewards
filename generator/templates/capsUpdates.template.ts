import {generateContractName, getPoolName} from '../common';
import {FEATURE, Options, PoolConfig, PoolIdentifier} from '../types';
import {prefixWithImports} from './importsResolver';

export const capsUpdatesTemplate = (
  options: Options,
  poolConfig: PoolConfig,
  pool: PoolIdentifier,
) => {
  const {title, author, discussion} = options;
  const poolName = getPoolName(pool);
  const contractName = generateContractName(options, FEATURE.CAPS_UPDATE, pool);

  const name = poolConfig.artifacts
    .map((artifact) => artifact.code?.name)
    .flat()
    .filter((f) => f !== undefined)
    .join('\n');
  const functions = poolConfig.artifacts
    .map((artifact) => artifact.code?.fn)
    .flat()
    .filter((f) => f !== undefined)
    .join('\n');

  const contract = `
  /**
  * @title ${title}
  * @author ${author}
  * - Discussion: ${discussion}
  */
 contract ${contractName} is ${`CapsPlusRiskSteward${poolName}${poolName === 'Base' ? 'Chain' : ''}`} {

   ${name}

   ${functions}
 }`;

  return prefixWithImports(contract, poolName);
};
