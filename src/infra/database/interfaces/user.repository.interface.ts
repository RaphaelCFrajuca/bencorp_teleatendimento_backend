import { User } from 'src/modules/users/entity/user.entity';
import { Role } from 'src/modules/users/enum/role.enum';

export interface UserRepositoryInterface {
  getAllUsers(): Promise<User[]>;
  getUserById(id: string): Promise<User | null>;
  createUser(user: User): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User | null>;
  deleteUser(id: string): Promise<boolean>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserByName(name: string): Promise<User | null>;
  getRoleByUserId(id: string): Promise<Role>;
}
