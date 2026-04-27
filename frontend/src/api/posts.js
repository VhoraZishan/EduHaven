import api from "./axios";

export const getPosts = () => {
  return api.get("posts/");
};

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
