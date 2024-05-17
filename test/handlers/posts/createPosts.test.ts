import { closeDataSource } from '../../../src/data-source';
import { Post } from '../../../src/entities/Post';
import { createPost } from '../../../src/handlers';
import { POST_ENTITY_CHANGE } from '../../../src/publishers/postEventPublisher';
import { EventType, getEventService } from '../../../src/publishers/publisher';
import { setupLogger } from '../../../src/util/logger';

// are expected to close the datasource in all the tests
afterAll(async () => {
  await closeDataSource();
});

describe('createPost', () => {
  const logger = setupLogger();

  it('create: should return 200', async () => {
    expect.assertions(8);
    const result = await createPost(logger, {
      idempotentId: 'idempotentId-1',
      userId: 1,
      title: 'title',
      body: 'body',
    });

    expect(result).toMatchObject({
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
    });

    const responseObj = JSON.parse(result.body);
    expect(responseObj).toMatchObject({
      id: 1,
      idempotentId: 'idempotentId-1',
      title: 'title',
      body: 'body',
    });

    expect(responseObj.lastEditedAt).toBeDefined();

    const eventService = getEventService();
    const events = eventService.getTopicEvents(POST_ENTITY_CHANGE);
    expect(events.length).toEqual(1);
    expect(events[0].type).toEqual(EventType.CREATE);

    const postEvent = events[0].payload as unknown as Post;
    expect(postEvent.version).toEqual(responseObj.version);
    expect(postEvent.id).toEqual(responseObj.version);

    const duplicateResult = await createPost(logger, {
      idempotentId: 'idempotentId-1',
      userId: 1,
      title: 'title',
      body: 'body',
    });
    expect(duplicateResult).toStrictEqual(result);
  });

  it('create: should return 404', async () => {
    expect.assertions(1);
    const result = await createPost(logger, {
      idempotentId: 'idempotentId-2',
      userId: 0,
      title: 'title',
      body: 'body',
    });

    expect(result).toStrictEqual({
      statusCode: 404,
      headers: { 'content-type': 'application/json' },
      body: '{"message":"User not found!"}',
    });
  });
});
