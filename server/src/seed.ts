import mongoose from 'mongoose';
import { ENV } from './config/env.js';
import { User } from './models/User.js';
import { Chat } from './models/Chat.js';
import { Message } from './models/Message.js';
import { hashPassword } from './utils/bcrypt.js';

const seedDatabase = async () => {
  try {
    await mongoose.connect(ENV.MONGO_URI);
    console.log('[Seed] Connected to MongoDB...');

    // Clear existing data
    await User.deleteMany({});
    await Chat.deleteMany({});
    await Message.deleteMany({});

    const passwordHash = await hashPassword('password123');

    // Create Admin User
    const admin = await User.create({
      name: 'System Admin',
      username: 'admin',
      email: 'admin@pulsechat.com',
      password: passwordHash,
      role: 'admin',
      bio: 'Platform Administrator & Technical Lead',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      status: 'online'
    });

    // Create Demo Users
    const alex = await User.create({
      name: 'Alex Morgan',
      username: 'alex',
      email: 'alex@pulsechat.com',
      password: passwordHash,
      bio: 'Frontend Architect & UI Enthusiast ✨',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      status: 'online'
    });

    const sarah = await User.create({
      name: 'Sarah Connor',
      username: 'sarah',
      email: 'sarah@pulsechat.com',
      password: passwordHash,
      bio: 'Cybersecurity specialist | Coffee lover ☕',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      status: 'away'
    });

    const david = await User.create({
      name: 'David Beckham',
      username: 'david',
      email: 'david@pulsechat.com',
      password: passwordHash,
      bio: 'Building real-time WebRTC apps 🚀',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      status: 'online'
    });

    console.log('[Seed] Created demo users (password: password123):');
    console.log(' - admin@pulsechat.com (Admin)');
    console.log(' - alex@pulsechat.com');
    console.log(' - sarah@pulsechat.com');
    console.log(' - david@pulsechat.com');

    // Create Direct Chat: Alex & Sarah
    const directChat = await Chat.create({
      type: 'direct',
      participants: [alex._id, sarah._id]
    });

    const msg1 = await Message.create({
      chatId: directChat._id,
      sender: alex._id,
      text: 'Hey Sarah! Did you see the new PulseChat interface design?',
      type: 'text',
      status: 'read',
      readBy: [alex._id, sarah._id]
    });

    const msg2 = await Message.create({
      chatId: sarah._id,
      sender: sarah._id,
      text: 'Yes! The glassmorphism dark theme looks insanely sleek! 🔥',
      type: 'text',
      status: 'read',
      readBy: [alex._id, sarah._id]
    });

    directChat.lastMessage = msg2._id as any;
    await directChat.save();

    // Create Group Chat: Engineering Team
    const groupChat = await Chat.create({
      type: 'group',
      groupName: 'Engineering Core',
      groupDescription: 'Real-Time WebSockets & WebRTC Discussion Group',
      groupAvatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
      participants: [admin._id, alex._id, sarah._id, david._id],
      groupAdmin: [admin._id],
      groupMembers: [
        { user: admin._id, role: 'admin', joinedAt: new Date().toISOString() },
        { user: alex._id, role: 'member', joinedAt: new Date().toISOString() },
        { user: sarah._id, role: 'member', joinedAt: new Date().toISOString() },
        { user: david._id, role: 'member', joinedAt: new Date().toISOString() }
      ]
    });

    const gMsg = await Message.create({
      chatId: groupChat._id,
      sender: admin._id,
      text: 'Welcome everyone to the official PulseChat Engineering workspace! High-definition audio and video calling is live.',
      type: 'text',
      status: 'delivered',
      readBy: [admin._id, alex._id]
    });

    groupChat.lastMessage = gMsg._id as any;
    await groupChat.save();

    console.log('[Seed] Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedDatabase();
