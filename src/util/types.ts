export type HandlerHttpRequestType =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'OPTIONS';

export interface HandlerOutput {
  statusCode: number;
  body: string; // this must be a string for serverless and aws to work,
  headers: Record<string, string>;
}

export type HandlerCallback<Logger, InputType> = (
  logger: Logger,
  input: InputType
) => Promise<HandlerOutput>;
