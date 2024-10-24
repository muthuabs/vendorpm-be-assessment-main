import { closeDataSource } from '../../../src/data-source';
import { createPostsHandler } from '../../../src/handlers';

import { setupLogger } from '../../../src/util/logger';
import KafkaMockup from '../../../src/util/kafkaMockup';

const kafka = new KafkaMockup({
    clientId: 'my-app',
    brokers: ['localhost:9092'], // Replace with your Kafka brokers
});

  
const consumer = kafka.consumer({groupId: 'mockup-group'});

// are expected to close the datasource in all the tests
afterAll(async () => {
  await closeDataSource();
});

describe('createPost', () => {
  const logger = setupLogger();

  

  it('create: should return 200', async () => {
    // expect.assertions(8);

    await consumer.connect()
    await consumer.subscribe({ topics: ['CUD_API'], fromBeginning: true })
    consumer.run({
    eachMessage: async (res: any) => {
        logger.info('hurray kafka works');
        const obj = JSON.parse(JSON.parse(res.value));
        console.log('res', res, obj)
        console.log("res_from_kafka", obj?.id, obj?.version);
      },
  });

    const event: any = { requestType: 'PUT',
    body: JSON.stringify({
        idempotentId: 'idempotentId-15',
        userId: 1,
        title: 'title',
        body: 'body',
      })
    };
    const context:any = {};
    const callback:any = () => {}
    const result = await createPostsHandler(event, context, callback);
    expect(result).toMatchObject({
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
    });
    if(result) {
        const responseObj = JSON.parse(result.body);
        console.log('responseObj', responseObj)
        expect(responseObj.lastEditedAt).toBeDefined();
    }


    // const eventService = getEventService();
    // const events = eventService.getTopicEvents(POST_ENTITY_CHANGE);
    // expect(events.length).toEqual(1);
    // expect(events[0].type).toEqual(EventType.CREATE);

    // const postEvent = events[0].payload as unknown as Post;
    // expect(postEvent.version).toEqual(responseObj.version);
    // expect(postEvent.id).toEqual(responseObj.version);

    
  });
});
