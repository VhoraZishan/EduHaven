import api from "./axios";

export const getPosts = () => {
  return api.get("posts/");
};

export const createPost = (data) => {
  return api.post("posts/", data);
};
