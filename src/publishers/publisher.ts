import { v4 as uuidv4 } from 'uuid';
import { Post } from '../entities/Post';
import { User } from '../entities/User';

export enum EventType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export interface Event {
  id: string;
  sentAt: number;
  type: string;
  payload: User | Post;
}

// Note: this is okay as event store is in memory and for assignment otherwise we need outbox transactional pattern
class EventService {
  private store: Map<string, Event[]>;

  constructor() {
    this.store = new Map<string, Event[]>();
  }

  publish(topic: string, type: EventType, payload: User | Post) {
    if (!this.store.has(topic)) {
      this.store.set(topic, []);
    }
    const events = this.store.get(topic);
    events?.push({
      id: uuidv4(),
      sentAt: Date.now(),
      payload,
      type: type.toString(),
    } as Event);
  }

  getTopicEvents(topic: string): Event[] {
    if (this.store.has(topic)) {
      const events = this.store.get(topic);
      if (events) {
        return events;
      }
    }
    return [];
  }
}

let eventService: EventService | null = null;

export function getEventService(): EventService {
  if (!eventService) {
    eventService = new EventService();
  }
  return eventService;
}
