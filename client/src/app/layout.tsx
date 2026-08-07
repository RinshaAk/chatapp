'use client';

import React from 'react';
import './globals.css';
import { Provider } from 'react-redux';
import { store } from '../store/index';
import { SocketProvider } from '../context/SocketContext';
import { CallModal } from '../components/calling/CallModal';

import { RegistrationToast } from '../components/layout/RegistrationToast';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <title>PulseChat - Real-Time Messaging & Calling Platform</title>
        <meta name="description" content="Production-ready WhatsApp-inspired real-time chat and HD video calling platform" />
      </head>
      <body>
        <Provider store={store}>
          <SocketProvider>
            {children}
            <CallModal />
            <RegistrationToast />
          </SocketProvider>
        </Provider>
      </body>
    </html>
  );
}
