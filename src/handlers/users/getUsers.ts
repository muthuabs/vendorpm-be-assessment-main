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
// no-need below function
// import { toUserDto } from './userDto';

export const pageValidator = z
  .object({
    page: z.coerce.number(),
    pageSize: z.coerce.number(),
  })
  .partial();

export type PageInput = z.infer<typeof pageValidator>;

/**
 * Gets all {@link User}
 */
export async function getUsers(
  _logger: Logger,
  input: PageInput
): Promise<HandlerOutput> {
  const dataSource = await getDataSource();
  const userRepo = dataSource.getRepository(User);
  // @TODO move this to global configuraion
  const { page = 0, pageSize = 10 } = input;
  const offset = page * pageSize;

  // Not an optimal query but i belive its okay for assignment
  const query = userRepo
    .createQueryBuilder('u')
    .addOrderBy('id')
    .offset(offset);

  const users = await query.limit(pageSize).getMany();
  if (users.length === 0) {
    return jsonResp(200, {
      remainingPages: 0,
      data: [],
    });
  }

  const count = await query.getCount();
  // check of decimal
  const remainingPages = Math.ceil(
    (count - page * pageSize - pageSize) / pageSize
  );

  return jsonResp(200, {
    remainingPages,
    data: users,
  });
}

// We separate the serverless side from the logic side to allow for handlers to be tested without a http context
// the generateAPIGatewayEventHandler method will take a function and serverless-ify it for you
export const getUsersHandler: Handler<APIGatewayEvent, HandlerOutput> =
  generateAPIGatewayEventHandler('GET', getUsers, pageValidator);
