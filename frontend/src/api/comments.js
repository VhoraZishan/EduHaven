import api from "./axios";

export const getComments = (postId) => {
  return api.get(`posts/${postId}/comments/`);
};

export const addComment = (postId, data) => {
  return api.post(`posts/${postId}/comments/add/`, data);
};
