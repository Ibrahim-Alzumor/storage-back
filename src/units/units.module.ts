import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UnitsController } from './units.controller';
import { UnitsService } from './units.service';
import { UnitSchema } from './schema/unit.schema';
import { LogsModule } from '../logs/logs.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Unit', schema: UnitSchema }]),
    forwardRef(() => AuthModule),
    forwardRef(() => LogsModule),
  ],
  controllers: [UnitsController],
  providers: [UnitsService],
  exports: [UnitsService],
})
export class UnitsModule {}
