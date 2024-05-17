import { closeDataSource, getDataSource } from '../../../src/data-source';
import { updatePostById } from '../../../src/handlers';
import { Post } from '../../../src/entities/Post';
import { User } from '../../../src/entities/User';
import { setupLogger } from '../../../src/util/logger';

// are expected to close the datasource in all the tests
afterAll(async () => {
  await closeDataSource();
});

describe('Post update tests', () => {
  const logger = setupLogger();
  it('should return 200', async () => {
    expect.assertions(4);

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

    const updatedPost = await updatePostById(logger, {
      ...savedPost,
      userId: user?.id!,
      postId: savedPost.id,
      title: 'updatedTitle',
    });

    // should return 200
    expect(updatedPost).toMatchObject({
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
    });

    const responseObj: Post = JSON.parse(updatedPost.body);
    expect(responseObj).toMatchObject({
      id: savedPost.id,
      idempotentId: savedPost.idempotentId,
      title: 'updatedTitle',
      body: savedPost.body,
    });

    // lastEditedAt should be updated
    expect(new Date(responseObj.lastEditedAt).getTime()).toBeGreaterThan(
      savedPost.lastEditedAt.getTime()
    );

    const errorResult = await updatePostById(logger, {
      ...savedPost,
      userId: user?.id!,
      postId: 10000,
      title: 'updatedTitle',
    });

    expect(errorResult).toStrictEqual({
      statusCode: 404,
      headers: { 'content-type': 'application/json' },
      body: '{"message":"Post not found!"}',
    });
  });

  it('should return 404 with invalid postId', async () => {
    expect.assertions(1);

    const errorResult = await updatePostById(logger, {
      userId: 1,
      postId: 0,
      title: 'updatedTitle',
    });

    expect(errorResult).toStrictEqual({
      statusCode: 404,
      headers: { 'content-type': 'application/json' },
      body: '{"message":"Post not found!"}',
    });
  });

  it('should return 404 with invalid userId', async () => {
    expect.assertions(1);

    const errorResult = await updatePostById(logger, {
      userId: 0,
      postId: 1,
      title: 'updatedTitle',
    });

    expect(errorResult).toStrictEqual({
      statusCode: 404,
      headers: { 'content-type': 'application/json' },
      body: '{"message":"Post not found!"}',
    });
  });
});
