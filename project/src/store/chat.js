import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useChatStore = create(
  persist(
    (set, get) => ({
      chatSessions: {},
      
      getChatHistory: (spaceId) => {
        const { chatSessions } = get();
        return chatSessions[spaceId] || [];
      },
      
      addMessage: (spaceId, message) => {
        set((state) => ({
          chatSessions: {
            ...state.chatSessions,
            [spaceId]: [...(state.chatSessions[spaceId] || []), message]
          }
        }));
      },
      
      clearChatHistory: (spaceId) => {
        set((state) => ({
          chatSessions: {
            ...state.chatSessions,
            [spaceId]: []
          }
        }));
      },
      
      updateLastMessage: (spaceId, updatedMessage) => {
        set((state) => {
          const messages = state.chatSessions[spaceId] || [];
          const updatedMessages = [...messages];
          updatedMessages[updatedMessages.length - 1] = updatedMessage;
          
          return {
            chatSessions: {
              ...state.chatSessions,
              [spaceId]: updatedMessages
            }
          };
        });
      }
    }),
    {
      name: 'tutorwise-chat-sessions',
    }
  )
);