import { Post } from '../entities/Post';
import { EventType, getEventService } from './publisher';

export const POST_ENTITY_CHANGE = 'vendor-post-changes';

export function publishCreatePostEvent(post: Post) {
  const eventService = getEventService();
  eventService.publish(POST_ENTITY_CHANGE, EventType.CREATE, post);
}

export function publishUpdatePostEvent(post: Post) {
  const eventService = getEventService();
  eventService.publish(POST_ENTITY_CHANGE, EventType.UPDATE, post);
}

export function publishDeletePostEvent(post: Post) {
  const eventService = getEventService();
  eventService.publish(POST_ENTITY_CHANGE, EventType.DELETE, post);
}
