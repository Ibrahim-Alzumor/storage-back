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

    const rawLogs = await this.activityLogModel.find(match).lean();

    const groupedByProduct: Record<string, Record<string, number>> = {};
    const groupedOrdersPerDate: Record<string, number> = {};

    for (const log of rawLogs) {
      let payload;
      try {
        payload = JSON.parse(log.payload);
      } catch {
        continue;
      }

      const date = new Date(log.timestamp).toISOString().split('T')[0];
      groupedOrdersPerDate[date] = (groupedOrdersPerDate[date] || 0) + 1;

      if (Array.isArray(payload.items)) {
        for (const item of payload.items) {
          const productId = item.productId;
          const quantity = item.quantity;

          if (!groupedByProduct[productId]) {
            groupedByProduct[productId] = {};
          }
          groupedByProduct[productId][date] =
            (groupedByProduct[productId][date] || 0) + quantity;
        }
      }
    }

    const response: any[] = [];

    const allDates = new Set([
      ...Object.keys(groupedOrdersPerDate),
      ...Object.values(groupedByProduct).flatMap((m) => Object.keys(m)),
    ]);

    for (const date of allDates) {
      let hasProduct = false;
      for (const [productId, dateMap] of Object.entries(groupedByProduct)) {
        if (dateMap[date]) {
          response.push({
            productId,
            date,
            totalSold: dateMap[date],
            orderCount: groupedOrdersPerDate[date] || 0,
          });
          hasProduct = true;
        }
      }
      if (!hasProduct) {
        response.push({
          productId: null,
          date,
          totalSold: 0,
          orderCount: groupedOrdersPerDate[date] || 0,
        });
      }
    }

    return response.sort((a, b) => a.date.localeCompare(b.date));
  }
}
