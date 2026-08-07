import { User } from '../models/User.js';
import { hashPassword } from './bcrypt.js';

export const seedDemoAccounts = async () => {
  try {
    const demoUsers = [
      {
        name: 'Alex Morgan',
        username: 'alex',
        email: 'alex@pulsechat.com',
        role: 'user'
      },
      {
        name: 'Sarah Connor',
        username: 'sarah',
        email: 'sarah@pulsechat.com',
        role: 'user'
      },
      {
        name: 'David Beckham',
        username: 'david',
        email: 'david@pulsechat.com',
        role: 'user'
      },
      {
        name: 'System Admin',
        username: 'admin',
        email: 'admin@pulsechat.com',
        role: 'admin'
      }
    ];

    const password = await hashPassword('password123');

    for (const demoUser of demoUsers) {
      const exists = await User.findOne({ email: demoUser.email });
      if (!exists) {
        await User.create({
          ...demoUser,
          password,
        });
        console.log(`[Seed] Created demo account: ${demoUser.email}`);
      }
    }
  } catch (error) {
    console.error('[Seed] Error seeding demo accounts:', error);
  }
};
