import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { Channel } from "../../types/recipe";

interface ChannelState {
  channels: Channel[];
  loading: boolean;
  error: string | null;
  selectedChannel: Channel | null;
}

const initialState: ChannelState = {
  channels: [],
  loading: false,
  error: null,
  selectedChannel: null,
};

const channelSlice = createSlice({
  name: "channels",
  initialState,
  reducers: {
    setChannels: (state, action: PayloadAction<Channel[]>) => {
      state.channels = action.payload;
    },
    addChannel: (state, action: PayloadAction<Channel>) => {
      state.channels.push(action.payload);
    },
    updateChannel: (state, action: PayloadAction<Channel>) => {
      const index = state.channels.findIndex(
        (channel) => channel.id === action.payload.id,
      );
      if (index !== -1) {
        state.channels[index] = action.payload;
      }
    },
    deleteChannel: (state, action: PayloadAction<string>) => {
      state.channels = state.channels.filter(
        (channel) => channel.id !== action.payload,
      );
    },
    setSelectedChannel: (state, action: PayloadAction<Channel | null>) => {
      state.selectedChannel = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setChannels,
  addChannel,
  updateChannel,
  deleteChannel,
  setSelectedChannel,
  setLoading,
  setError,
} = channelSlice.actions;

export default channelSlice.reducer;
