import api from "./axios";

// Build query string from a params object, ignoring empty values
const buildQuery = (params = {}) => {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== '' && v !== null && v !== undefined)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  return qs ? `?${qs}` : '';
};

export const getPosts = (params = {}) =>
  api.get(`posts/${buildQuery(params)}`);

export const createPost = (data) => {
  if (data instanceof FormData) {
    return api.post("posts/", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
  return api.post("posts/", data);
};

export const upvotePost = (postId) => api.post(`posts/${postId}/upvote/`);
export const downvotePost = (postId) => api.post(`posts/${postId}/downvote/`);
