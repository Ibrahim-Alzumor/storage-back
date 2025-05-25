import { Injectable } from '@nestjs/common';
import {
  ActivityLog,
  ActivityLogDocument,
} from './schemas/activity-log.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class LogsService {
  constructor(
    @InjectModel(ActivityLog.name)
    private readonly activityLogModel: Model<ActivityLogDocument>,
  ) {}

  async logAction({
    userEmail,
    action,
    resourceType,
    resourceId,
    payload,
  }: {
    userEmail: string;
    action: string;
    resourceType: string;
    resourceId: string;
    payload?: any;
  }) {
    const log = new this.activityLogModel({
      userEmail,
      action,
      resourceType,
      resourceId,
      payload,
      timestamp: new Date(),
    });
    await log.save();
  }

  async getLogsByUser(email: string) {
    return this.activityLogModel
      .find({ userEmail: email })
      .sort({ timestamp: -1 })
      .exec();
  }

  async getOrderStats({
    startDate,
    endDate,
    email,
  }: {
    startDate: Date;
    endDate: Date;
    email?: string;
  }) {
    const match: any = {
      resourceType: 'order',
      timestamp: { $gte: startDate, $lte: endDate },
    };
    if (email) match.userEmail = email;

    return this.activityLogModel.aggregate([
      { $match: match },
      { $unwind: '$payload.items' },
      {
        $group: {
          _id: {
            productId: '$payload.items.productId',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          },
          totalSold: { $sum: '$payload.items.quantity' },
        },
      },
      {
        $project: {
          _id: 0,
          productId: '$_id.productId',
          date: '$_id.date',
          totalSold: 1,
        },
      },
      { $sort: { date: 1 } },
    ]);
  }
}
