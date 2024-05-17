import { closeDataSource, getDataSource } from '../../../src/data-source';
import { Post } from '../../../src/entities/Post';
import { User } from '../../../src/entities/User';

// are expected to close the datasource in all the tests
afterAll(async () => {
  await closeDataSource();
});

describe('Posts test', () => {
  it('Optimicstic locking post tests', async () => {
    expect.assertions(2);
    const dataSource = await getDataSource();
    const postRepo = dataSource.getRepository(Post);
    const userRepo = dataSource.getRepository(User);

    const user = await userRepo.findOneBy({
      id: 1,
    });

    const savedPost = await postRepo.save({
      body: 'body',
      title: 'title',
      idempotentId: 'idempotentId',
      lastEditedAt: new Date(),
      user: user!,
    });

    const shouldUpdate = await postRepo.save({
      ...savedPost,
      title: 'updatedTitle',
    });
    expect(shouldUpdate.version).toBe(savedPost.version + 1);

    try {
      await postRepo.save({
        ...savedPost,
        title: 'updatedTitle',
      });
    } catch (error) {
      if (error instanceof Error) {
        expect(error.message).toBe(
          'The optimistic lock on entity The optimistic lock on entity Post failed, version 2 was expected, but is actually 1.'
        );
      }
    }
  });
});
