import {
  getUsersHandler,
  getUsersByIdHandler,
  deleteUsersByIdHandler,
  updateUsersByIdHandler,
  getPostsByUserIdHandler,
  createPostsHandler,
  deletePostByIdHandler,
  getPostsByIdHandler,
  updatePostByIdByIdHandler,
  getPostsByTitleHandler,
} from './src/handlers';

// the expected flow is that you write your business logic somewhere in the src/handlers folder then re-export the handlers here
// for the serverless.yml file to reference.

export {
  getUsersHandler,
  getUsersByIdHandler,
  deleteUsersByIdHandler,
  updateUsersByIdHandler,
  getPostsByUserIdHandler,
  createPostsHandler,
  deletePostByIdHandler,
  getPostsByIdHandler,
  updatePostByIdByIdHandler,
  getPostsByTitleHandler,
};
