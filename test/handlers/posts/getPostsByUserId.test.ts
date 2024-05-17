import { DataSource } from 'typeorm';
import { closeDataSource, getDataSource } from '../../../src/data-source';
import { Post } from '../../../src/entities/Post';
import { User } from '../../../src/entities/User';

import { getPostsById, getUserPosts } from '../../../src/handlers';
import { setupLogger } from '../../../src/util/logger';

// are expected to close the datasource in all the tests
afterAll(async () => {
  await closeDataSource();
});

describe("Get All User's Posts tests", () => {
  let dataSource: DataSource;
  let postRepo;
  let userRepo;

  const logger = setupLogger();

  beforeAll(async () => {
    dataSource = await getDataSource();
    postRepo = dataSource.getRepository(Post);
    userRepo = dataSource.getRepository(User);

    const user = await userRepo.findOneBy({
      id: 1,
    });

    const user2 = await userRepo.findOneBy({
      id: 2,
    });

    await postRepo.save({
      body: 'body',
      title: 'title',
      idempotentId: 'idempotentId-user-1',
      lastEditedAt: new Date(),
      user: user!,
    });

    await postRepo.save({
      body: 'body',
      title: 'title',
      idempotentId: 'idempotentId-user-2',
      lastEditedAt: new Date(),
      user: user2!,
    });
  });

  it('Get All users posts', async () => {
    expect.assertions(4);
    const emptyResult = await getUserPosts(logger, {
      userId: 1000,
    });

    expect(emptyResult).toStrictEqual({
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: '[]',
    });

    const result = await getUserPosts(logger, {
      userId: 1,
    });

    expect(result).toMatchObject({
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
    });
    const response: Array<Post> = JSON.parse(result.body);
    expect(response.length).toEqual(1);
    expect(response[0]).toMatchObject({
      id: 1,
      idempotentId: 'idempotentId-user-1',
      title: 'title',
      body: 'body',
      version: 1,
    });
  });

  it('Get post by post id', async () => {
    expect.assertions(3);
    const emptyResult = await getPostsById(logger, {
      userId: 1,
      postId: 0,
    });

    expect(emptyResult).toStrictEqual({
      statusCode: 404,
      headers: { 'content-type': 'application/json' },
      body: '{"message":"Post not found!"}',
    });

    const result = await getPostsById(logger, {
      userId: 1,
      postId: 1,
    });

    expect(result).toMatchObject({
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
    });
    const response: Post = JSON.parse(result.body);
    expect(response).toMatchObject({
      id: 1,
      idempotentId: 'idempotentId-user-1',
      title: 'title',
      body: 'body',
      version: 1,
    });
  });
});
