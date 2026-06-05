/**
 * Vendor license issue query object.
 */
export interface LicenseIssueQuery extends PageQuery {
  /**
   * Primary key.
   */
  id?: string | number;

  /**
   * License number.
   */
  licenseId?: string;

  /**
   * Vendor customer primary key.
   */
  customerId?: string | number;

  /**
   * Signing algorithm.
   */
  algorithm?: string;

  /**
   * License schema version.
   */
  schemaVersion?: string;

  /**
   * Edition code.
   */
  edition?: string;

  /**
   * Feature code set.
   */
  featureCodes?: string;

  /**
   * Installation identifier.
   */
  installId?: string;

  /**
   * Issue status.
   */
  issueStatus?: string;

  /**
   * Issue type.
   */
  issueType?: string;

  /**
   * Issuer user.
   */
  issuedBy?: string;

  /**
   * Extended query params.
   */
  params?: Record<string, any>;
}

/**
 * Allowed validity window for issuing a vendor license.
 */
export interface LicenseIssueValidity {
  validFrom: string;
  validTo: string;
}

/**
 * Allowed input for vendor license issue.
 *
 * Customer code/name and other trusted customer facts are intentionally absent:
 * the backend must resolve them from customerId.
 */
export interface LicenseIssueCommand {
  customerId: string | number;
  installId: string;
  validity: LicenseIssueValidity;
  edition?: string;
  features?: string[];
  featureCodes?: string[];
  issueType?: string;
}

/**
 * Download metadata for the generated .lic file.
 */
export interface LicenseIssueDownloadMetadata {
  fileName?: string;
  contentType?: string;
  downloadUrl?: string;
  expiresAt?: string;
}

/**
 * Safe response fields needed by the issue drawer and .lic download flow.
 */
export interface LicenseIssueResult {
  id?: string | number;
  licenseId?: string;
  customerId?: string | number;
  installId?: string;
  validFrom?: string;
  validTo?: string;
  edition?: string;
  featureCodes?: string[] | string;
  issueStatus?: string;
  issueType?: string;
  issuedBy?: string;
  issuedTime?: string;
  licensePayload?: string;
  download?: LicenseIssueDownloadMetadata;
}

/**
 * Vendor license issue response object.
 */
export interface LicenseIssueVO extends BaseEntity, LicenseIssueResult {
  /**
   * Primary key.
   */
  id: string | number;

  /**
   * Signing algorithm.
   */
  algorithm?: string;

  /**
   * License schema version.
   */
  schemaVersion?: string;

  /**
   * Revoke time.
   */
  revokedTime?: string;

  /**
   * Signature text for audit display only.
   */
  signatureText?: string;
}
