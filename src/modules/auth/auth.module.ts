import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { EnvironmentModule } from 'src/common/environment/environment.module';
import { DatabaseModule } from 'src/infra/database/database.module';

@Module({
  imports: [
    DatabaseModule,
    EnvironmentModule,
    JwtModule.registerAsync({
      imports: [EnvironmentModule],
      inject: ['JWT_SECRET'],
      useFactory: (jwtSecret: string) => ({
        global: true,
        secret: jwtSecret,
        signOptions: { expiresIn: '60s' },
      }),
    }),
  ],
  controllers: [],
  providers: [],
})
export class AuthModule {}
