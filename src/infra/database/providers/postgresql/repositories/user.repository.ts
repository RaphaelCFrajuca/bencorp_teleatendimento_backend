import { Logger } from 'nestjs-pino';
import { Database } from 'src/infra/database/interfaces/database.interface';
import { UserRepositoryInterface } from 'src/infra/database/interfaces/user.repository.interface';
import { User } from 'src/modules/users/entity/user.entity';
import { Role } from 'src/modules/users/enum/role.enum';
import { UserEntity } from '../entities/user.entity';

export class UserRepository implements UserRepositoryInterface {
  constructor(
    private readonly database: Database,
    private readonly logger: Logger,
  ) {}

  private async getRepository() {
    const dataSource = await this.database.connect();

    try {
      return dataSource.getRepository(UserEntity);
    } finally {
      await dataSource.destroy();
    }
  }

  async getAllUsers(): Promise<User[]> {
    throw new Error('Método não implementado.');
  }
  async getUserById(id: string): Promise<User | null> {
    throw new Error('Método não implementado.');
  }
  async createUser(user: User): Promise<User> {
    throw new Error('Método não implementado.');
  }
  async updateUser(id: string, user: Partial<User>): Promise<User | null> {
    throw new Error('Método não implementado.');
  }
  async deleteUser(id: string): Promise<boolean> {
    throw new Error('Método não implementado.');
  }
  async getUserByEmail(email: string): Promise<User | null> {
    throw new Error('Método não implementado.');
  }
  async getUserByName(name: string): Promise<User | null> {
    throw new Error('Método não implementado.');
  }
  async getRoleByUserId(id: string): Promise<Role> {
    const repository = await this.getRepository();
    const user = await repository.findOne({ where: { id } });
    if (!user) {
      this.logger.error(`Usuário com ID ${id} não encontrado.`);
      throw new Error(`Usuário com ID ${id} não encontrado.`);
    }
    return user.role;
  }
}
