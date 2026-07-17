import api from './axios';

export const getCommunities = (search = '') =>
  api.get(`communities/${search ? `?search=${encodeURIComponent(search)}` : ''}`);

export const getCommunity = (slug) =>
  api.get(`communities/${slug}/`);

export const createCommunity = (data) =>
  api.post('communities/', data);

export const joinCommunity = (slug) =>
  api.post(`communities/${slug}/join/`);

export const deleteCommunity = (slug) =>
  api.delete(`communities/${slug}/`);

export const updateCommunityIcon = (slug, formData) =>
  api.patch(`communities/${slug}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
