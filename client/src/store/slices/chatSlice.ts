import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IChat, IMessage } from '@pulsechat/shared';

interface ChatState {
  chats: IChat[];
  activeChatId: string | null;
  messages: Record<string, IMessage[]>; // chatId -> IMessage[]
  typingUsers: Record<string, string[]>; // chatId -> username[]
  recordingUsers: Record<string, string[]>; // chatId -> username[]
  onlineUsers: Record<string, { status: string; lastSeen?: string }>;
  searchQuery: string;
}

const initialState: ChatState = {
  chats: [],
  activeChatId: null,
  messages: {},
  typingUsers: {},
  recordingUsers: {},
  onlineUsers: {},
  searchQuery: ''
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChats: (state, action: PayloadAction<IChat[]>) => {
      state.chats = action.payload;
    },
    setActiveChatId: (state, action: PayloadAction<string | null>) => {
      state.activeChatId = action.payload;
    },
    setMessages: (state, action: PayloadAction<{ chatId: string; messages: IMessage[] }>) => {
      state.messages[action.payload.chatId] = action.payload.messages;
    },
    addMessage: (state, action: PayloadAction<IMessage>) => {
      const { chatId } = action.payload;
      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }
      // avoid duplicates
      if (!state.messages[chatId].some(m => m._id === action.payload._id)) {
        state.messages[chatId].push(action.payload);
      }

      // Update last message in chat list
      const chatIndex = state.chats.findIndex(c => c._id === chatId);
      if (chatIndex > -1) {
        state.chats[chatIndex].lastMessage = action.payload;
        state.chats[chatIndex].updatedAt = action.payload.createdAt;
      }
    },
    updateMessage: (state, action: PayloadAction<IMessage>) => {
      const { chatId, _id } = action.payload;
      if (state.messages[chatId]) {
        const idx = state.messages[chatId].findIndex(m => m._id === _id);
        if (idx > -1) {
          state.messages[chatId][idx] = action.payload;
        }
      }
    },
    updateMessageStatus: (state, action: PayloadAction<{ chatId: string; messageId: string; status: 'delivered' | 'read' }>) => {
      const { chatId, messageId, status } = action.payload;
      if (state.messages[chatId]) {
        const msg = state.messages[chatId].find(m => m._id === messageId);
        if (msg) msg.status = status;
      }
    },
    markChatAsRead: (state, action: PayloadAction<string>) => {
      const chatId = action.payload;
      if (state.messages[chatId]) {
        state.messages[chatId].forEach(msg => {
          if (msg.status !== 'read') msg.status = 'read';
        });
      }
    },
    setTyping: (state, action: PayloadAction<{ chatId: string; username: string; isTyping: boolean }>) => {
      const { chatId, username, isTyping } = action.payload;
      if (!state.typingUsers[chatId]) state.typingUsers[chatId] = [];
      if (isTyping) {
        if (!state.typingUsers[chatId].includes(username)) {
          state.typingUsers[chatId].push(username);
        }
      } else {
        state.typingUsers[chatId] = state.typingUsers[chatId].filter(u => u !== username);
      }
    },
    setRecording: (state, action: PayloadAction<{ chatId: string; username: string; isRecording: boolean }>) => {
      const { chatId, username, isRecording } = action.payload;
      if (!state.recordingUsers[chatId]) state.recordingUsers[chatId] = [];
      if (isRecording) {
        if (!state.recordingUsers[chatId].includes(username)) {
          state.recordingUsers[chatId].push(username);
        }
      } else {
        state.recordingUsers[chatId] = state.recordingUsers[chatId].filter(u => u !== username);
      }
    },
    setUserOnlineStatus: (state, action: PayloadAction<{ userId: string; status: string; lastSeen?: string }>) => {
      state.onlineUsers[action.payload.userId] = {
        status: action.payload.status,
        lastSeen: action.payload.lastSeen
      };
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearUnreadCount: (state, action: PayloadAction<string>) => {
      const chatIndex = state.chats.findIndex(c => c._id === action.payload);
      if (chatIndex > -1) {
        state.chats[chatIndex].unreadCount = 0;
      }
    }
  }
});

export const {
  setChats,
  setActiveChatId,
  setMessages,
  addMessage,
  updateMessage,
  updateMessageStatus,
  markChatAsRead,
  setTyping,
  setRecording,
  setUserOnlineStatus,
  setSearchQuery,
  clearUnreadCount
} = chatSlice.actions;

export default chatSlice.reducer;
