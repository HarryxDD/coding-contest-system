import {
  // common
  Module,
} from '@nestjs/common';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [InfrastructureModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule { }
