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
import { publishUpdatePostEvent } from '../../publishers/postEventPublisher';

export const updatePostByIdValidator = z.object({
  userId: z.coerce.number(),
  postId: z.coerce.number(),
  title: z.ostring(),
  body: z.ostring(),
});

export type UpdatePostByIdInput = z.infer<typeof updatePostByIdValidator>;

/**
 * Update a {@link Post} by its id if it exists
 * @param input
 */
export async function updatePostById(
  logger: Logger,
  input: UpdatePostByIdInput
): Promise<HandlerOutput> {
  const dataSource = await getDataSource();
  const postRepo = dataSource.getRepository(Post);

  const post = await postRepo
    .createQueryBuilder('post')
    .where('id=:postId', { postId: input.postId })
    .andWhere('post.user.id=:userId', { userId: input.userId })
    .getOne();

  if (!post) {
    logger.warn('Post not found!', input);
    return jsonResp(404, { message: 'Post not found!' });
  }

  await postRepo.save({
    ...post,
    title: input.title,
    body: input.body,
    lastEditedAt: new Date(),
  });

  const updatedPost = await postRepo.findOneBy({ id: input.postId });
  if (updatedPost) {
    publishUpdatePostEvent(updatedPost);
    return jsonResp(200, updatedPost);
  }
  logger.error('Not able to retrive updated post from DB', {
    postId: input.postId,
  });
  return jsonResp(500, { message: 'Internal server error' });
}

export const updatePostByIdByIdHandler: Handler<
  APIGatewayEvent,
  HandlerOutput
> = generateAPIGatewayEventHandler(
  'PATCH',
  updatePostById,
  updatePostByIdValidator
);
