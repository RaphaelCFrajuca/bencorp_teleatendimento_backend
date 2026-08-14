import { Role } from '../enum/role.enum';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  active: boolean;
  role: Role;
}
