import {NumberInputValues} from '../types';

export interface AssetSelector {
  asset: string;
}

export interface CapsUpdatePartial {
  supplyCap: NumberInputValues;
  borrowCap: NumberInputValues;
}

export interface CapsUpdate extends CapsUpdatePartial, AssetSelector {}
