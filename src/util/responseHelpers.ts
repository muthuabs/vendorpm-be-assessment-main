import { HandlerOutput } from './types';

/**
 * Automates building a {@link HandlerOutput} for a request from a status code and a result body to JSONify
 * @param statusCode
 * @param body
 */
export function jsonResp(statusCode: number, body: unknown): HandlerOutput {
  return {
    statusCode,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  };
}
