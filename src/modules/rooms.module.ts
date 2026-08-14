import { Module } from '@nestjs/common';
import { EnvironmentModule } from 'src/common/environment/environment.module';
import { RoomTokenGuard } from 'src/common/guards/room-token.guard';
import { DatabaseModule } from 'src/infra/database/database.module';
import { LivekitAdapter } from './rooms/adapter/livekit.adapter';
import { RoomsController } from './rooms/controller/rooms.controller';
import { RoomsService } from './rooms/service/rooms.service';

@Module({
  imports: [EnvironmentModule, DatabaseModule],
  controllers: [RoomsController],
  providers: [RoomsService, LivekitAdapter, RoomTokenGuard],
  exports: [RoomsService],
})
export class RoomsModule {}
