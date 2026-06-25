import request from '@/utils/request';
import { R } from '@/api/typings';

/**
 * Import source(A) factor workbook.
 * @param workbookPath path to the workbook on the server
 */
export function importSourceAFactor(workbookPath: string) {
  return request<R<SourceAFactorImportResult>>({
    url: '/vendor/source-a-factor/import',
    method: 'post',
    params: { workbookPath }
  });
}

export interface SourceAFactorImportResult {
  imported201EfCount: number;
  imported202EfCount: number;
  imported203EfCount: number;
  imported204EfCount: number;
  imported205EfCount: number;
  imported206GasCount: number;
  imported: boolean;
  message?: string;
}
