import api from "./axios";

export const getComments = (postId) => {
  return api.get(`posts/${postId}/comments/`);
};

export const addComment = (postId, data) => {
  return api.post(`posts/${postId}/comments/add/`, data);
};

export const upvoteComment = (commentId) => api.post(`comments/${commentId}/upvote/`);
export const downvoteComment = (commentId) => api.post(`comments/${commentId}/downvote/`);
export const toggleAnswer = (commentId) => api.post(`comments/${commentId}/toggle-answer/`);
