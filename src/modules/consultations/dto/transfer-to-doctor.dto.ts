import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class TransferToDoctorDto {
  @IsUUID()
  @ApiProperty({
    description: 'ID do médico para quem será transferido',
    format: 'uuid',
  })
  doctorId: string;
}
