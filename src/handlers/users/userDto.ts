import { User } from '../../entities/User';

// User exposed to API
export interface UserDto {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
}

export function toUserDto(user: User): UserDto {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    age: user.age,
  } as UserDto;
}
