import api from "./axios";

export const getUserById = (id) => {
  return api.get(`auth/users/${id}/`);
};
