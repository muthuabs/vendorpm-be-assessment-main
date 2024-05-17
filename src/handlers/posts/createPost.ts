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
import { User } from '../../entities/User';
import { publishCreatePostEvent } from '../../publishers/postEventPublisher';

export const createPostValidator = z.object({
  userId: z.coerce.number(),
  idempotentId: z.coerce.string(),
  title: z.coerce.string(),
  body: z.coerce.string(),
});

export type CreatePostInput = z.infer<typeof createPostValidator>;

/**
 * Gets a {@link User} by its id if it exists
 * @param input
 */
export async function createPost(
  logger: Logger,
  input: CreatePostInput
): Promise<HandlerOutput> {
  const dataSource = await getDataSource();
  const postRepo = dataSource.getRepository(Post);
  const existingPost = await postRepo.findOneBy({
    idempotentId: input.idempotentId,
  });

  // return existing data if post is already saved
  if (existingPost) {
    logger.info(`Post already exists postId:${existingPost.id}`, {
      idempotentId: input.idempotentId,
    });
    return jsonResp(200, existingPost);
  }

  const userRepo = dataSource.getRepository(User);
  const creator = await userRepo.findOneBy({ id: input.userId });

  if (!creator) {
    logger.warn('User not found!', input);
    return jsonResp(404, { message: 'User not found!' });
  }

  const savedPost = await postRepo.save({
    idempotentId: input.idempotentId,
    title: input.title,
    body: input.body,
    user: creator,
    lastEditedAt: new Date(),
  });

  const post = await postRepo.findOneBy({ id: savedPost.id });
  if (post) {
    publishCreatePostEvent(post);
    return jsonResp(200, post);
  }

  logger.error('Not able to retrive saved post from DB', {
    idempotentId: input.idempotentId,
  });
  return jsonResp(500, { message: 'Internal server error' });
}

// We separate the serverless side from the logic side to allow for handlers to be tested without a http context
// the generateAPIGatewayEventHandler method will take a function and serverless-ify it for you
export const createPostsHandler: Handler<APIGatewayEvent, HandlerOutput> =
  generateAPIGatewayEventHandler('PUT', createPost, createPostValidator);
