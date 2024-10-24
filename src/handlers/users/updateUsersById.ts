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

export const updateUsersByIdValidator = z
  .object({
    userId: z.coerce.number(),
    firstName: z.coerce.string(),
    lastName: z.coerce.string(),
    age: z.coerce.number(),
  })
  .partial({
    firstName: true,
    lastName: true,
    age: true,
  })
  .required({
    userId: true,
  })
  .strict();

export type UpdateUserByIdInput = z.infer<typeof updateUsersByIdValidator>;

/**
 * Gets a {@link User} by its id if it exists
 * @param input
 */
export async function updateUsersById(
  logger: Logger,
  input: UpdateUserByIdInput
): Promise<HandlerOutput> {
  const dataSource = await getDataSource();
  const userRepo = dataSource.getRepository(User);
  const user = await userRepo.findOneBy({ id: input.userId });

  if (!user) {
    logger.warn('User not found!', input);
    return jsonResp(404, { message: 'User not found!' });
  }

  await userRepo.save({
    ...user,
    firstName: input.firstName || user.firstName,
    lastName: input.lastName || user.lastName,
    age: input.age || user.age,
  });

  const updatedUser = await userRepo.findOneBy({ id: input.userId });
  if (updatedUser) {
    return jsonResp(200, toUserDto(updatedUser));
  }

  logger.error('Not able to retrive saved post from DB', input.userId);
  return jsonResp(500, { message: 'Internal server error' });
}

// We separate the serverless side from the logic side to allow for handlers to be tested without a http context
// the generateAPIGatewayEventHandler method will take a function and serverless-ify it for you
export const updateUsersByIdHandler: Handler<APIGatewayEvent, HandlerOutput> =
  generateAPIGatewayEventHandler(
    'PATCH',
    updateUsersById,
    updateUsersByIdValidator
  );
