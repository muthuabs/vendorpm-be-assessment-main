import { APIGatewayEvent, Handler } from 'aws-lambda';
import { z } from 'zod';
import { Logger } from 'winston';
import {
  HandlerOutput,
  generateAPIGatewayEventHandler,
  jsonResp,
} from '../../util';
import { getDataSource } from '../../data-source';
import { Post } from '../../entities/Post';

export const getPostsByUserIdValidator = z.object({
  userId: z.coerce.number(),
});

export type GetPostsByUserIdInput = z.infer<typeof getPostsByUserIdValidator>;

/**
 * Gets all {@link Post}
 */
export async function getUserPosts(
  _logger: Logger,
  input: GetPostsByUserIdInput
): Promise<HandlerOutput> {
  const dataSource = await getDataSource();

  const postRepo = dataSource.getRepository(Post);

  const posts = await postRepo
    .createQueryBuilder('post')
    .where('post.user.id=:userId', { userId: input.userId })
    .getMany();

  return jsonResp(200, posts);
}

export const getPostsByUserIdHandler: Handler<APIGatewayEvent, HandlerOutput> =
  generateAPIGatewayEventHandler(
    'GET',
    getUserPosts,
    getPostsByUserIdValidator
  );
