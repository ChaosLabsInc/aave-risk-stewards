import {CodeArtifact, FEATURE, FeatureModule} from '../types';
import {CapsUpdate, CapsUpdatePartial} from './types';
import {
  assetsSelectPrompt,
  translateAssetToAssetLibUnderlying,
} from '../prompts/assetsSelectPrompt';
import {numberPrompt, translateJsNumberToSol} from '../prompts/numberPrompt';
import {generateContractName} from '../common';

export async function fetchCapsUpdate(required?: boolean): Promise<CapsUpdatePartial> {
  return {
    supplyCap: await numberPrompt({
      message: 'New supply cap',
      required,
    }),
    borrowCap: await numberPrompt({
      message: 'New borrow cap',
      required,
    }),
  };
}

type CapsUpdates = CapsUpdate[];

export const capsUpdates: FeatureModule<CapsUpdates> = {
  value: FEATURE.CAPS_UPDATE,
  description: 'CapsUpdates (supplyCap, borrowCap)',
  async cli({pool}) {
    console.log(`Fetching information for CapsUpdates on ${pool}`);
    const assets = await assetsSelectPrompt({
      message: 'Select the assets you want to amend',
      pool,
    });

    const response: CapsUpdates = [];
    for (const asset of assets) {
      console.log(`collecting info for ${asset}`);
      response.push({asset, ...(await fetchCapsUpdate())});
    }
    return response;
  },
  build({options, pool, cfg}) {
    const response: CodeArtifact = {
      code: {
        name: [
          `/**
          * @return string name identifier used for the diff
          */
          function name() internal pure override returns (string memory) {
            return '${generateContractName(options, pool)}';
        }`,
        ],
        fn: [
          ` /**
          * @return IAaveV3ConfigEngine.CapsUpdate[] capUpdates to be performed
          */
          function capsUpdates() internal pure override returns (IAaveV3ConfigEngine.CapsUpdate[] memory) {
          IAaveV3ConfigEngine.CapsUpdate[] memory capUpdates = new IAaveV3ConfigEngine.CapsUpdate[](${cfg.length});

          ${cfg
            .map(
              (cfg, ix) => `capUpdates[${ix}] = IAaveV3ConfigEngine.CapsUpdate(
                ${translateAssetToAssetLibUnderlying(cfg.asset, pool)},
                ${translateJsNumberToSol(cfg.supplyCap)},
                ${translateJsNumberToSol(cfg.borrowCap)}
             ); `,
            )
            .join('\n')}
          return capUpdates;
        }`,
        ],
      },
    };
    return response;
  },
};
