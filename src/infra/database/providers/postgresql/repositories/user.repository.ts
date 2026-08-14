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
    return dataSource.getRepository(UserEntity);
  }

  async getAllUsers(): Promise<User[]> {
    const repository = await this.getRepository();
    this.logger.log('Buscando todos os usuários.');
    return repository.find();
  }

  async getUserById(id: string): Promise<User | null> {
    const repository = await this.getRepository();
    this.logger.log(`Buscando usuário por ID: ${id}`);
    return repository.findOne({ where: { id } });
  }

  async createUser(user: User): Promise<User> {
    const repository = await this.getRepository();

    const existingUser = await repository.findOne({
      where: [{ email: user.email }, { id: user.id }],
    });
    if (existingUser) {
      this.logger.warn(
        `Tentativa de criação de usuário já existente. Email: ${user.email}, ID: ${user.id}`,
      );
      throw new Error('Usuário já existe.');
    }

    this.logger.log(`Criando usuário: ${user.email}`);
    return repository.save(user);
  }

  async updateUser(id: string, user: Partial<User>): Promise<User | null> {
    const repository = await this.getRepository();
    const existingUser = await repository.findOne({ where: { id } });

    if (!existingUser) {
      this.logger.error(`Tentativa de atualização falhou. Usuário com ID ${id} não encontrado.`);
      throw new Error(`Usuário com ID ${id} não encontrado.`);
    }

    if (user.email && user.email !== existingUser.email) {
      const userWithSameEmail = await repository.findOne({ where: { email: user.email } });
      if (userWithSameEmail && userWithSameEmail.id !== id) {
        this.logger.warn(`Tentativa de atualização falhou. E-mail já cadastrado: ${user.email}`);
        throw new Error('E-mail já cadastrado para outro usuário.');
      }
    }

    this.logger.log(`Atualizando usuário ID: ${id}`);
    await repository.update(id, user);
    return repository.findOne({ where: { id } });
  }

  async deleteUser(id: string): Promise<boolean> {
    const repository = await this.getRepository();
    const existingUser = await repository.findOne({ where: { id } });

    if (!existingUser) {
      this.logger.error(`Tentativa de exclusão falhou. Usuário com ID ${id} não encontrado.`);
      throw new Error(`Usuário com ID ${id} não encontrado.`);
    }

    this.logger.log(`Excluindo usuário ID: ${id}`);
    const result = await repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const repository = await this.getRepository();
    this.logger.log(`Buscando usuário por email: ${email}`);
    return repository.findOne({ where: { email } });
  }

  async getUserByName(name: string): Promise<User | null> {
    const repository = await this.getRepository();
    this.logger.log(`Buscando usuário por nome: ${name}`);
    return repository.findOne({ where: { name } });
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
