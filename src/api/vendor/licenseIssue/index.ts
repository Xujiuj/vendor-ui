import request from '@/utils/request';
import { LicenseIssueCommand, LicenseIssueQuery, LicenseIssueResult, LicenseIssueVO } from './types';
import type { ApiResponse, ListResponse } from '../shared';

const LICENSE_ISSUE_BASE_URL = '/vendor/license-issue';

type BackendLicenseIssueResult = {
  issued?: boolean;
  status?: string;
  message?: string;
  licenseContent?: string;
  licenseIssue?: LicenseIssueVO;
} & LicenseIssueResult;

const normalizeIssueResult = (result?: BackendLicenseIssueResult): LicenseIssueResult | undefined => {
  if (!result) {
    return undefined;
  }

  const issue = result.licenseIssue || result;
  const licenseId = issue.licenseId || result.licenseId;
  const fileNameBase = licenseId || issue.id || result.id || 'license';

  return {
    ...issue,
    licenseId,
    licensePayload: result.licenseContent || issue.licensePayload || result.licensePayload,
    download:
      result.download ||
      issue.download ||
      (result.licenseContent
        ? {
            fileName: String(fileNameBase).endsWith('.lic') ? String(fileNameBase) : `${fileNameBase}.lic`,
            contentType: 'application/json;charset=utf-8'
          }
        : undefined)
  };
};

/**
 * 查询供应商授权签发列表
 * @param query
 */
export const listLicenseIssue = (query?: LicenseIssueQuery): Promise<ListResponse<LicenseIssueVO>> => {
  return request({
    url: `${LICENSE_ISSUE_BASE_URL}/list`,
    method: 'get',
    params: query
  });
};

/**
 * 查询供应商授权签发详情
 * @param id
 */
export const getLicenseIssue = (id: string | number): Promise<ApiResponse<LicenseIssueVO>> => {
  return request({
    url: `${LICENSE_ISSUE_BASE_URL}/${id}`,
    method: 'get'
  });
};

/**
 * Delete vendor license issue records.
 */
export const deleteLicenseIssue = (ids: string | number | Array<string | number>) => {
  return request({
    url: `${LICENSE_ISSUE_BASE_URL}/${ids}`,
    method: 'delete'
  });
};

/**
 * Issue a vendor license.
 *
 * The backend resolves trusted customer facts from customerId. Keep the request
 * payload whitelisted so caller-owned customer facts cannot be forwarded
 * accidentally.
 */
export const issueLicense = (data: LicenseIssueCommand): Promise<ApiResponse<LicenseIssueResult>> => {
  const payload = {
    customerId: data.customerId,
    packageId: data.packageId,
    validFrom: data.validity?.validFrom,
    validTo: data.validity?.validTo,
    edition: data.edition,
    features: data.features,
    templateEntitlements: data.templateEntitlements
  };

  return request({
    url: `${LICENSE_ISSUE_BASE_URL}/issue`,
    method: 'post',
    data: payload
  }).then((response: ApiResponse<BackendLicenseIssueResult>) => ({
    ...response,
    data: normalizeIssueResult(response.data)
  }));
};
