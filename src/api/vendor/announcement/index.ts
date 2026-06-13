import request from '@/utils/request';
import type { ApiResponse, ListResponse } from '../shared';
import type { AnnouncementForm, AnnouncementQuery, AnnouncementVO } from './types';

const ANNOUNCEMENT_BASE_URL = '/vendor/announcement';

/**
 * Query vendor announcement list.
 */
export const listAnnouncement = (query?: AnnouncementQuery): Promise<ListResponse<AnnouncementVO>> => {
  return request({
    url: `${ANNOUNCEMENT_BASE_URL}/list`,
    method: 'get',
    params: query
  });
};

/**
 * Query vendor announcement detail.
 */
export const getAnnouncement = (noticeId: string | number): Promise<ApiResponse<AnnouncementVO>> => {
  return request({
    url: `${ANNOUNCEMENT_BASE_URL}/${noticeId}`,
    method: 'get'
  });
};

/**
 * Add vendor announcement.
 */
export const addAnnouncement = (data: AnnouncementForm): Promise<ApiResponse<void>> => {
  return request({
    url: ANNOUNCEMENT_BASE_URL,
    method: 'post',
    data
  });
};

/**
 * Update vendor announcement.
 */
export const updateAnnouncement = (data: AnnouncementForm): Promise<ApiResponse<void>> => {
  return request({
    url: ANNOUNCEMENT_BASE_URL,
    method: 'put',
    data
  });
};

/**
 * Delete vendor announcements.
 */
export const deleteAnnouncement = (noticeIds: string | number | Array<string | number>): Promise<ApiResponse<void>> => {
  return request({
    url: `${ANNOUNCEMENT_BASE_URL}/${noticeIds}`,
    method: 'delete'
  });
};
