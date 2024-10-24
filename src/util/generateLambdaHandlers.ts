import { APIGatewayEvent, Handler } from 'aws-lambda';
import { ZodType } from 'zod';
import { Logger } from 'winston';
import {
  HandlerCallback,
  HandlerHttpRequestType,
  HandlerOutput,
} from './types';
import { parseAPIGatewayEventBody } from './eventParser';
import { jsonResp } from './responseHelpers';
import { setupLogger } from './logger';
import KafkaMockup from './kafkaMockup';

const kafka = new KafkaMockup({
  clientId: 'my-app',
  brokers: ['localhost:9092'], // Replace with your Kafka brokers
});

const producer = kafka.producer();

export interface GenerateAPIGatewayEventHandlerOptions {
  waitForEventLoop: boolean;
}

export const defaultGenerateAPIGatewayEventHandlerOptions: GenerateAPIGatewayEventHandlerOptions =
  {
    waitForEventLoop: true,
  };

/**
 * Kafka Consumer
 */
const consumer = kafka.consumer({ groupId: 'mockup-group' });
consumer.connect();
consumer.subscribe({ topics: ['CUD_API'], fromBeginning: true });
consumer.run({
  eachMessage: async (res: any) => {
    const logger = setupLogger();
    logger.info('hurray kafka works');
    const obj = JSON.parse(JSON.parse(res.value));
    console.log('res', res, obj);
    console.log('res_from_kafka', obj?.id, obj?.version);
  },
});

/**
 * generates the glue code around your HandlerCallbacks to ease development
 * @param requestType the kind of http request that is expected for this endpoint
 * @param handler your handler code
 * @param inputValidator the expected input validator that generates valid input from an APIGatewayEvent to pass to handler
 * @param options options for controlling things like waiting for the empty event loop
 */
export function generateAPIGatewayEventHandler<InputType>(
  requestType: HandlerHttpRequestType,
  handler: HandlerCallback<Logger, InputType>,
  inputValidator: ZodType<InputType>,
  options?: GenerateAPIGatewayEventHandlerOptions
): Handler<APIGatewayEvent, HandlerOutput> {
  const validatedOptions =
    options ?? defaultGenerateAPIGatewayEventHandlerOptions;

  return async (event, context): Promise<HandlerOutput> => {
    // this is here to not have the handler get stuck waiting for knex to die
    context.callbackWaitsForEmptyEventLoop = validatedOptions.waitForEventLoop;
    const logger = setupLogger();
    logger.defaultMeta = { requestId: context.awsRequestId };
    const startTimeFn = Date.now();
    try {
      // To verify the request we call safeParse on the JSON.parse result of our helper function parseAPIGatewayEventBody
      // safeParse will return either a success or failure object if the input matched our schema
      const request = parseAPIGatewayEventBody(event, requestType);
      logger.info('Request is ', request);
      const inputResult = inputValidator.safeParse(request);

      if (!inputResult.success) {
        logger.warn('Request input failed to parse', {
          validatorMessage: inputResult.error.toString(),
        });

        return jsonResp(400, {
          message: 'Invalid input processing request',
          errors: inputResult.error,
        });
      }

      const response = await handler(logger, inputResult.data);
      /**
       * Kafka SendMessage for CUD operations
       */
      if (requestType !== 'GET') {
        const sendMessage = (key: string, message: string) => {
          return producer
            .send({
              topic: 'CUD_API',
              messages: [{ key, value: message }],
            })
            .then(console.log)
            .catch((e) => {
              return logger.info(`${e.message}`, e);
            });
        };
        sendMessage(context.functionName, JSON.stringify(response.body));
      }
      const endTimeFn = Date.now();
      logger.info(`function execution time ${endTimeFn - startTimeFn}`);

      return response;
    } catch (error) {
      logger.error('Top level error handler', error);

      return jsonResp(500, {
        message: 'An internal server error occurred!',
      });
    }
  };
}
