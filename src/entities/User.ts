import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
// eslint-disable-next-line import/no-cycle
import { Post } from './Post';
// import { calculateAge } from '../util/ageCalulator';
import { AgeTransformer } from './Transformers/ageTransformer';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    transformer: new AgeTransformer()
  })
  age: number;

  @OneToMany(() => Post, (item) => item.user)
  posts: Post[];

  // @OneToMany(
  //   () => {
  //     return Post;
  //   },
  //   (post: Post) => {
  //     return post.user;
  //   }
  // )
  // posts: Post[];

  // public get age(): number {
  //   return calculateAge(this.ageOffset);
  // }
}
