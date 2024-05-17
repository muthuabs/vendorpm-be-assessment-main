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
import { publishDeletePostEvent } from '../../publishers/postEventPublisher';

export const deletePostByIdValidator = z.object({
  userId: z.coerce.number(),
  postId: z.coerce.number(),
});

export type DeletePostByIdInput = z.infer<typeof deletePostByIdValidator>;

/**
 * Delete a {@link Post} by its id if it exists
 * @param input
 */
export async function deletePostsById(
  logger: Logger,
  input: DeletePostByIdInput
): Promise<HandlerOutput> {
  const dataSource = await getDataSource();
  const postRepo = dataSource.getRepository(Post);

  const post = await postRepo
    .createQueryBuilder('post')
    .where('post.id=:postId', { postId: input.postId })
    .andWhere('post.user.id=:userId', { userId: input.userId })
    .getOne();

  if (!post) {
    logger.warn('Post not found!', input);
    return jsonResp(404, { message: 'Post not found!' });
  }

  await postRepo.delete({ id: post.id });
  publishDeletePostEvent(post);

  return jsonResp(200, post);
}

export const deletePostByIdHandler: Handler<APIGatewayEvent, HandlerOutput> =
  generateAPIGatewayEventHandler(
    'DELETE',
    deletePostsById,
    deletePostByIdValidator
  );
