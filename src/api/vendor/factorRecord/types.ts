/**
 * Vendor factor record query object.
 */
export interface FactorRecordQuery extends PageQuery {
  id?: string | number;
  versionId?: string | number;
  factorTableCode?: string;
  factorCode?: string;
  factorName?: string;
  factorCategory?: string;
  factorKey?: string;
  emissionSourceName?: string;
  factorVersion?: string;
  enabledFlag?: boolean;
  params?: Record<string, any>;
}

/**
 * Vendor factor record form object.
 */
export interface FactorRecordForm {
  id?: string | number;
  versionId?: string | number;
  factorTableCode: string;
  factorCode: string;
  factorName: string;
  factorCategory: string;
  factorValue?: number | string;
  factorUnit: string;
  factorKey?: string;
  emissionSourceName?: string;
  emissionSourceNameEn?: string;
  fuelMaterialCategory?: string;
  sourceUnit?: string;
  co2?: number | string;
  ch4?: number | string;
  n2o?: number | string;
  hfcs?: number | string;
  pfcs?: number | string;
  sf6?: number | string;
  nf3?: number | string;
  applicableScope?: string;
  factorSource?: string;
  gwpCh4?: number | string;
  gwpN2o?: number | string;
  gwpHfcs?: number | string;
  gwpPfcs?: number | string;
  gwpSf6?: number | string;
  gwpNf3?: number | string;
  factorGwp?: number | string;
  versionProvinceCode?: string;
  factorVersion?: string;
  divisionCode?: string;
  divisionName?: string;
  regionName?: string;
  provinceFactor?: number | string;
  regionFactor?: number | string;
  nationalFactor?: number | string;
  nonFossilExcludedFactor?: number | string;
  nationalFossilPowerFactor?: number | string;
  rowNo?: number;
  fuelLevel1?: string;
  fuelLevel2?: string;
  fuelLevel3?: string;
  fuelLevel4?: string;
  lowerHeatValue?: number | string;
  lowerHeatValueCv?: number | string;
  co2Factor?: number | string;
  co2FactorCv?: number | string;
  gwpValue?: number | string;
  convertedFactor?: number | string;
  sourceRef?: string;
  enabledFlag?: boolean;
  remark?: string;
}

/**
 * Vendor factor record view object.
 */
export interface FactorRecordVO extends BaseEntity {
  id: string | number;
  versionId: string | number;
  factorTableCode?: string;
  factorCode: string;
  factorName: string;
  factorCategory: string;
  factorValue: number | string;
  factorUnit: string;
  factorKey?: string;
  emissionSourceName?: string;
  emissionSourceNameEn?: string;
  fuelMaterialCategory?: string;
  sourceUnit?: string;
  co2?: number | string;
  ch4?: number | string;
  n2o?: number | string;
  hfcs?: number | string;
  pfcs?: number | string;
  sf6?: number | string;
  nf3?: number | string;
  applicableScope?: string;
  factorSource?: string;
  gwpCh4?: number | string;
  gwpN2o?: number | string;
  gwpHfcs?: number | string;
  gwpPfcs?: number | string;
  gwpSf6?: number | string;
  gwpNf3?: number | string;
  factorGwp?: number | string;
  versionProvinceCode?: string;
  factorVersion?: string;
  divisionCode?: string;
  divisionName?: string;
  regionName?: string;
  provinceFactor?: number | string;
  regionFactor?: number | string;
  nationalFactor?: number | string;
  nonFossilExcludedFactor?: number | string;
  nationalFossilPowerFactor?: number | string;
  rowNo?: number;
  fuelLevel1?: string;
  fuelLevel2?: string;
  fuelLevel3?: string;
  fuelLevel4?: string;
  lowerHeatValue?: number | string;
  lowerHeatValueCv?: number | string;
  co2Factor?: number | string;
  co2FactorCv?: number | string;
  gwpValue?: number | string;
  convertedFactor?: number | string;
  sourceRef?: string;
  enabledFlag?: boolean;
  createTime?: string;
  updateTime?: string;
  remark?: string;
  [key: string]: any;
}
