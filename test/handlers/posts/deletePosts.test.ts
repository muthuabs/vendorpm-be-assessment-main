// Its expected that the handlers auto start the datasource themselves, but we

import { closeDataSource, getDataSource } from '../../../src/data-source';
import { Post } from '../../../src/entities/Post';
import { User } from '../../../src/entities/User';

import { deletePostsById } from '../../../src/handlers';
import { setupLogger } from '../../../src/util/logger';

// are expected to close the datasource in all the tests
afterAll(async () => {
  await closeDataSource();
});

describe('Posts test', () => {
  const logger = setupLogger();

  it('delete post tests', async () => {
    const dataSource = await getDataSource();
    const postRepo = dataSource.getRepository(Post);
    const userRepo = dataSource.getRepository(User);

    const user = await userRepo.findOneBy({
      id: 1,
    });

    const savedPost = await postRepo.save({
      body: 'body',
      title: 'title',
      idempotentId: 'idempotentId-4',
      lastEditedAt: new Date(),
      user: user!,
    });

    expect.assertions(3);
    const resultError = await deletePostsById(logger, {
      userId: 1000,
      postId: savedPost.id,
    });

    expect(resultError).toStrictEqual({
      statusCode: 404,
      headers: { 'content-type': 'application/json' },
      body: '{"message":"Post not found!"}',
    });

    const result = await deletePostsById(logger, {
      userId: user?.id!,
      postId: savedPost.id,
    });

    expect(result).toMatchObject({
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
    });

    const afterDeletedObj = await postRepo.findOneBy({
      id: savedPost.id,
    });

    expect(afterDeletedObj).toBeFalsy();
  });
});
