import { User } from 'src/modules/users/entity/user.entity';
import { Role } from 'src/modules/users/enum/role.enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
export class UserEntity implements User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name', type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ name: 'email', type: 'varchar', length: 255, nullable: false, unique: true })
  email: string;

  @Column({ name: 'password', type: 'varchar', length: 255, nullable: false })
  password: string;

  @Column({ name: 'active', type: 'boolean', nullable: false, default: true })
  active: boolean;

  @Column({ name: 'role', type: 'enum', enum: Role, nullable: false })
  role: Role;
}
