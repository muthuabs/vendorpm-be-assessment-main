import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
  VersionColumn,
} from 'typeorm';
// eslint-disable-next-line import/no-cycle
import { User } from './User';

@Entity()
@Unique(['idempotentId'])
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  idempotentId: string;

  @Column()
  title: string;

  @Column()
  body: string;

  @Column()
  lastEditedAt: Date;

  @VersionColumn()
  version: number;

  @ManyToOne(
    () => {
      return User;
    },
    (user) => {
      return user.posts;
    }
  )
  user: User;
}
