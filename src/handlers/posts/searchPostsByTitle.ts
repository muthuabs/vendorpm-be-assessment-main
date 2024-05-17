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

export const getPostsByTitleValidator = z.object({
  keyword: z.coerce.string(),
});

export type GetPostsByTitleInput = z.infer<typeof getPostsByTitleValidator>;

/**
 * Gets a {@link Post} by its title if it exists
 * @param input
 */
export async function getPostsByTitle(
  _logger: Logger,
  input: GetPostsByTitleInput
): Promise<HandlerOutput> {
  const dataSource = await getDataSource();

  const postRepo = dataSource.getRepository(Post);
  const posts = await postRepo
    .createQueryBuilder('p')
    .where('p.title like :title', { title: `%${input.keyword}%` })
    .getMany();

  return jsonResp(200, posts);
}

export const getPostsByTitleHandler: Handler<APIGatewayEvent, HandlerOutput> =
  generateAPIGatewayEventHandler(
    'GET',
    getPostsByTitle,
    getPostsByTitleValidator
  );
