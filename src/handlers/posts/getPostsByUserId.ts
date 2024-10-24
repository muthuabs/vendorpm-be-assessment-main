import { APIGatewayEvent, Handler } from 'aws-lambda';
import { z } from 'zod';
import { Logger } from 'winston';
import {
  HandlerOutput,
  generateAPIGatewayEventHandler,
  jsonResp,
} from '../../util';
import { FindManyOptions, Like } from 'typeorm';
import { getDataSource } from '../../data-source';
import { Post } from '../../entities/Post';

export const getPostsByUserIdValidator = z.object({
  userId: z.coerce.number(),
  keyword: z.coerce.string(),
  page: z.coerce.number(),
  pageSize: z.coerce.number(),
}).partial();

export type GetPostsByUserIdInput = z.infer<typeof getPostsByUserIdValidator>;

/**
 * Gets all {@link Post}
 */
export async function getUserPosts(
  _logger: Logger,
  input: GetPostsByUserIdInput
): Promise<HandlerOutput> {
  const dataSource = await getDataSource();
  const { page = 1, pageSize = 5 } = input;
  const offset = (page -1) * pageSize;

  const postRepo = dataSource.getRepository(Post);

  const query:FindManyOptions<Post> = {
    order: {
      createdDate: "ASC",
    },
    relations: ['user'],
    where: {
      user: {
        id: input.userId
      }
    },
    skip: offset,
    take: pageSize
  };
  if(input.keyword && query.where) {
    // @ts-ignore
    query.where.title = Like(`%${input.keyword}%`);
  }

  const posts = await postRepo.findAndCount(query);

  // const query = postRepo
  //   .createQueryBuilder('post')
  //   .where('post.user.id=:userId', { userId: input.userId });
  //   if(input.keyword) {
  //     query.where('post.title ILIKE :title', { title: `%${input.keyword}%` })
  //   }
    
  //   const posts = await query
  //       .offset(offset)
  //       .limit(pageSize).getMany();
    const data = posts[0] || [];
    const count = posts[1];

  //   // check of decimal
  const remainingPages = Math.ceil(
    (count - page * pageSize - pageSize) / pageSize
  )+1;
    
  return jsonResp(200, {
    remainingPages,
    data,
  });
}

export const getPostsByUserIdHandler: Handler<APIGatewayEvent, HandlerOutput> =
  generateAPIGatewayEventHandler(
    'GET',
    getUserPosts,
    getPostsByUserIdValidator
  );
