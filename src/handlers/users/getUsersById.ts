import { APIGatewayEvent, Handler } from 'aws-lambda';
import { z } from 'zod';
import { Logger } from 'winston';
import {
  HandlerOutput,
  generateAPIGatewayEventHandler,
  jsonResp,
} from '../../util';
import { getDataSource } from '../../data-source';
import { User } from '../../entities/User';
import { toUserDto } from './userDto';

// Here we write a validator that ensures the path/query/body parameters we receive for a request match what we expect
// The framework will automatically return a 400 series error for you if the request doesn't match this validator.
// URI parameters are spread automatically into one object for you which is how userId in this validator validates the
//  userId in the /users/{userId} URI for this handler
export const getUserByIdValidator = z.object({
  userId: z.coerce.number(),
});

export type GetUserByIdInput = z.infer<typeof getUserByIdValidator>;

/**
 * Gets a {@link User} by its id if it exists
 * @param input
 */
export async function getUserById(
  logger: Logger,
  input: GetUserByIdInput
): Promise<HandlerOutput> {
  const dataSource = await getDataSource();

  const userRepo = dataSource.getRepository(User);

  const user = await userRepo.findOneBy({ id: input.userId });

  if (!user) {
    logger.warn('User not found!', input);
    return jsonResp(404, { message: 'User not found!' });
  }
  return jsonResp(200, toUserDto(user));
}

// We separate the serverless side from the logic side to allow for handlers to be tested without a http context
// the generateAPIGatewayEventHandler method will take a function and serverless-ify it for you
export const getUsersByIdHandler: Handler<APIGatewayEvent, HandlerOutput> =
  generateAPIGatewayEventHandler('GET', getUserById, getUserByIdValidator);
