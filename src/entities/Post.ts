import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
  VersionColumn,
  JoinColumn,
  UpdateDateColumn,
  CreateDateColumn,
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

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  lastEditedAt: Date;

  @VersionColumn()
  version: number;

  @ManyToOne((type) => {
    return User;
  })
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user: User;

  // @ManyToOne(
  //   () => {
  //     return User;
  //   },
  //   (user) => {
  //     return user.posts;
  //   }
  // )
  // user: User;
}
