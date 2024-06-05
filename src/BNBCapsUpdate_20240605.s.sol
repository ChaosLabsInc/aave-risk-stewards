// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {AaveV3BNBAssets} from 'aave-address-book/AaveV3BNB.sol';
import {IAaveV3ConfigEngine} from 'aave-helpers/v3-config-engine/IAaveV3ConfigEngine.sol';
import {CapsPlusRiskStewardBNB} from '../scripts/CapsPlusRiskStewardBNB.s.sol';

/**
 * @title Increase Supply Caps on Aave V3 BNB and Scroll
 * @author Chaos Labs
 * - Discussion: https://governance.aave.com/t/arfc-chaos-labs-risk-stewards-increase-supply-caps-on-aave-v3-bnb-and-scroll-05-29-2024/17825/1
 */
contract BNBCapsUpdate_20240605 is CapsPlusRiskStewardBNB {
  /**
   * @return string name identifier used for the diff
   */
  function name() internal pure override returns (string memory) {
    return 'BNBCapsUpdate_20240605';
  }

  /**
   * @return IAaveV3ConfigEngine.CapsUpdate[] capUpdates to be performed
   */
  function capsUpdates() internal pure override returns (IAaveV3ConfigEngine.CapsUpdate[] memory) {
    IAaveV3ConfigEngine.CapsUpdate[] memory capUpdates = new IAaveV3ConfigEngine.CapsUpdate[](1);

    capUpdates[0] = IAaveV3ConfigEngine.CapsUpdate(AaveV3BNBAssets.BTCB_UNDERLYING, 800, 200);
    return capUpdates;
  }
}
