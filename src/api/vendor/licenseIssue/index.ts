import request from '@/utils/request';
import { LicenseIssueCommand, LicenseIssueQuery, LicenseIssueResult, LicenseIssueVO } from './types';
import type { ApiResponse, ListResponse } from '../shared';

const LICENSE_ISSUE_BASE_URL = '/vendor/license-issue';

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
    keyId: data.keyId,
    installId: data.installId,
    validFrom: data.validity?.validFrom,
    validTo: data.validity?.validTo,
    edition: data.edition,
    features: data.features,
    issueType: data.issueType,
    issuedBy: data.issuedBy,
    templateEntitlements: data.templateEntitlements
  };

  return request({
    url: `${LICENSE_ISSUE_BASE_URL}/issue`,
    method: 'post',
    data: payload
  });
};
