import { createSlice } from '@reduxjs/toolkit';

const { reducer, actions } = createSlice({
  name: 'fuelRequests',
  initialState: {
    items: {},
    lastUpdated: null, // Add timestamp to force change detection
  },
  reducers: {
    refresh(state, action) {
      state.items = {};
      action.payload.forEach((item) => state.items[item.id] = item);
      state.lastUpdated = Date.now(); // Force change detection
    },
    update(state, action) {
      let hasChanges = false;
      action.payload.forEach((item) => {
        const existing = state.items[item.id];
        const isNew = !existing;
        const isChanged = existing && JSON.stringify(existing) !== JSON.stringify(item);
        
        if (isNew || isChanged) {
          state.items[item.id] = item;
          hasChanges = true;
        }
      });
      
      if (hasChanges) {
        state.lastUpdated = Date.now(); // Force change detection
      }
    },
    remove(state, action) {
      if (state.items[action.payload]) {
        delete state.items[action.payload];
        state.lastUpdated = Date.now(); // Force change detection
      }
    },
  },
});

export { actions as fuelRequestsActions };
export { reducer as fuelRequestsReducer };






