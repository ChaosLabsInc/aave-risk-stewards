// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {AaveV3GnosisAssets} from 'aave-address-book/AaveV3Gnosis.sol';
import {IAaveV3ConfigEngine} from 'aave-helpers/v3-config-engine/IAaveV3ConfigEngine.sol';
import {EngineFlags} from 'aave-helpers/v3-config-engine/EngineFlags.sol';
import {CapsPlusRiskStewardGnosis} from '../scripts/CapsPlusRiskStewardGnosis.s.sol';

/**
 * @title Update Caps on Gnosis V3
 * @author Chaos Labs
 * - Discussion: https://governance.aave.com/t/arfc-chaos-labs-risk-stewards-increase-supply-and-borrow-cap-on-v3-gnosis-03-22-2024/17083
 */
contract GnosisCapsIncrease_20240322 is CapsPlusRiskStewardGnosis {
  /**
   * @return string name identifier used for the diff
   */
  function name() internal pure override returns (string memory) {
    return 'gnosis_caps_increase_20240322';
  }

  /**
   * @return IAaveV3ConfigEngine.CapsUpdate[] capUpdates to be performed
   */
  function capsUpdates() internal pure override returns (IAaveV3ConfigEngine.CapsUpdate[] memory) {
    IAaveV3ConfigEngine.CapsUpdate[] memory capUpdates = new IAaveV3ConfigEngine.CapsUpdate[](2);

    capUpdates[0] = IAaveV3ConfigEngine.CapsUpdate(
      AaveV3GnosisAssets.WXDAI_UNDERLYING,
      18_000_000,
      18_000_000
    );

    capUpdates[1] = IAaveV3ConfigEngine.CapsUpdate(
      AaveV3GnosisAssets.sDAI_UNDERLYING,
      40_000_000,
      EngineFlags.KEEP_CURRENT
    );

    return capUpdates;
  }
}
