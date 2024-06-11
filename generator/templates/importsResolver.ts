/**
 * @dev matches the code from known address book imports and generates an import statement satisfying the used libraries
 * @param code
 * @returns
 */
function generateAddressBookImports(code: string) {
  const imports: string[] = [];
  let root = '';
  const addressBookMatch = code.match(/(?<!I)(AaveV[2..3][A-Za-z]+)(?<!(Assets))\b\./);
  if (addressBookMatch) {
    imports.push(addressBookMatch[1]);
    root = addressBookMatch[1];
  }
  const assetsMatch = code.match(/(AaveV[2..3][A-Za-z]+)Assets\./);
  if (assetsMatch) {
    imports.push(assetsMatch[1] + 'Assets');
    root = assetsMatch[1];
  }
  if (imports.length > 0) return `import {${imports}} from 'aave-address-book/${root}.sol';\n`;
}

function findMatch(code: string, needle: string) {
  return RegExp(needle, 'g').test(code);
}

/**
 * @dev Returns the input string prefixed with imports
 * @param code
 * @returns
 */
export function prefixWithImports(code: string, poolName?: string) {
  let imports = `// SPDX-License-Identifier: MIT
  pragma solidity ^0.8.0;\n\n`;

  // address book imports
  const addressBookImports = generateAddressBookImports(code);
  if (addressBookImports) {
    imports += addressBookImports;
  }

  // v3 config engine imports
  if (findMatch(code, 'IAaveV3ConfigEngine')) {
    imports += `import {IAaveV3ConfigEngine} from 'aave-helpers/v3-config-engine/IAaveV3ConfigEngine.sol';\n`;
  }

  // shared config engine imports
  if (findMatch(code, 'EngineFlags')) {
    imports += `import {EngineFlags} from 'aave-helpers/v3-config-engine/EngineFlags.sol';\n`;
  }

  // shared config engine imports
  if (poolName !== undefined) {
    imports += `import {CapsPlusRiskSteward${poolName}${poolName === 'Base' ? 'Chain' : ''}} from '../scripts/CapsPlusRiskSteward${poolName}${poolName === 'Base' ? 'Chain' : ''}.s.sol';\n`;
  }

  return imports + code;
}
