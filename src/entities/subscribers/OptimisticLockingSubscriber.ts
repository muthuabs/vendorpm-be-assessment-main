import {
  EntitySubscriberInterface,
  EventSubscriber,
  OptimisticLockVersionMismatchError,
  UpdateEvent,
} from 'typeorm';
import { Post } from '../Post';
import { User } from '../User';

type EntityTable = User | Post;

@EventSubscriber()
export class OptimisticLockingSubscriber implements EntitySubscriberInterface {
  // eslint-disable-next-line class-methods-use-this
  beforeUpdate(event: UpdateEvent<EntityTable>) {
    // To know if an entity has a version number, we check if versionColumn
    // is defined in the metadatas of that entity.
    if (event.metadata.versionColumn && event.entity) {
      // Getting the current version of the requested entity update
      const versionFromUpdate = Reflect.get(
        event.entity,
        event.metadata.versionColumn.propertyName
      );

      // Getting the entity's version from the database
      const versionFromDatabase = Reflect.get(
        event.databaseEntity,
        event.metadata.versionColumn.propertyName
      );

      // they should match otherwise someone has changed it underneath us
      if (versionFromDatabase !== versionFromUpdate) {
        throw new OptimisticLockVersionMismatchError(
          `The optimistic lock on entity ${event.metadata.targetName}`,
          versionFromDatabase,
          versionFromUpdate
        );
      }
    }
  }
}
