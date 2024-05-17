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
import { Post } from '../../entities/Post';

export const getPostsByIdValidator = z.object({
  userId: z.coerce.number(),
  postId: z.coerce.number(),
});

export type GetPostsByIdInput = z.infer<typeof getPostsByIdValidator>;

/**
 * Gets a {@link Post} by its id if it exists
 * @param input
 */
export async function getPostsById(
  logger: Logger,
  input: GetPostsByIdInput
): Promise<HandlerOutput> {
  const dataSource = await getDataSource();

  const userRepo = dataSource.getRepository(User);
  const user = await userRepo.findOneBy({ id: input.userId });
  if (!user) {
    logger.warn('User not found!', input);
    return jsonResp(404, { message: 'User not found!' });
  }

  const postRepo = dataSource.getRepository(Post);
  const post = await postRepo.findOneBy({ id: input.postId });
  if (!post) {
    logger.warn('Post not found!', input);
    return jsonResp(404, { message: 'Post not found!' });
  }

  return jsonResp(200, post);
}

export const getPostsByIdHandler: Handler<APIGatewayEvent, HandlerOutput> =
  generateAPIGatewayEventHandler('GET', getPostsById, getPostsByIdValidator);
