import { ALBEvent, APIGatewayEvent } from 'aws-lambda';
import { HandlerHttpRequestType } from './types';

/**
 * A small helper function for parsing out APIGatewayEvent bodies since they can optionally be base64 encoded
 *
 * @param event
 * @param requestType since the event.httpMethod is actually undefined at runtime we need to manually track what kind of request
 */
export function parseAPIGatewayEventBody(
  event: APIGatewayEvent | ALBEvent,
  requestType: HandlerHttpRequestType
): Record<string, unknown> {
  switch (requestType) {
    case 'GET':
      return {
        ...(event.queryStringParameters || {}),
        ...((event as APIGatewayEvent)?.pathParameters || {}),
      };
    default:
      return {
        ...JSON.parse(
          event.body && event.isBase64Encoded
            ? Buffer.from(event.body, 'base64').toString()
            : event.body ?? '{}'
        ),
        ...((event as APIGatewayEvent)?.pathParameters || {}),
      };
  }
}
