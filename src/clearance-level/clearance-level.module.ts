import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClearanceLevelService } from './clearance-level.service';
import { ClearanceLevelController } from './clearance-level.controller';
import { ClearanceLevel, ClearanceLevelSchema } from './schemas/clearance-level.schema';
import { FunctionPermission, FunctionPermissionSchema } from './schemas/function-permission.schema';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ClearanceLevel.name, schema: ClearanceLevelSchema },
      { name: FunctionPermission.name, schema: FunctionPermissionSchema },
    ]),
    LogsModule,
  ],
  providers: [ClearanceLevelService],
  controllers: [ClearanceLevelController],
  exports: [ClearanceLevelService],
})
export class ClearanceLevelModule {}
