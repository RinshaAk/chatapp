import { Call } from '../models/Call.js';

export class CallService {
  static async createCallLog(callerId: string, receiverId: string, type: 'audio' | 'video', chatId?: string) {
    return Call.create({
      caller: callerId,
      receiver: receiverId,
      chatId,
      type,
      status: 'offered',
      startedAt: new Date().toISOString()
    });
  }

  static async updateCallStatus(callId: string, status: string, duration = 0) {
    const call = await Call.findById(callId);
    if (!call) throw new Error('Call log not found');

    call.status = status as any;
    if (status === 'ended' || status === 'rejected' || status === 'missed') {
      call.endedAt = new Date().toISOString();
      call.duration = duration;
    }
    await call.save();
    return call;
  }

  static async getCallHistory(userId: string) {
    return Call.find({
      $or: [{ caller: userId }, { receiver: userId }]
    })
      .populate('caller', '_id name username avatar status')
      .populate('receiver', '_id name username avatar status')
      .sort({ createdAt: -1 })
      .limit(50);
  }
}
