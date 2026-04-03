import { z } from 'zod';
import { AnalyticsEvent } from '../models/AnalyticsEvent';
import { Order } from '../models/Order';

const trackSchema = z.object({
  eventType: z.string().min(1),
  properties: z.any().optional(),
  occurredAt: z.coerce.date().default(() => new Date()),
  anonymousId: z.string().optional()
});

export async function track(req: any, res: any) {
  const data = trackSchema.parse(req.body);
  const userId = req.user?.sub;

  const ev = await AnalyticsEvent.create({
    userId,
    anonymousId: data.anonymousId,
    eventType: data.eventType,
    properties: data.properties,
    occurredAt: data.occurredAt
  });

  res.status(201).json(ev);
}

export async function metrics(_req: any, res: any) {
  const [orders, events] = await Promise.all([Order.countDocuments(), AnalyticsEvent.countDocuments()]);
  res.json({ orders, events });
}

export async function reports(_req: any, res: any) {
  // placeholder: build aggregated reports later (Mongo aggregation pipeline)
  res.json({ status: 'ok', report: { message: 'Reports endpoint stub. Implement aggregation pipelines as needed.' } });
}

export async function recommendations(_req: any, res: any) {
  // placeholder: build recommendation engine later
  res.json({ status: 'ok', recommendations: [] });
}
