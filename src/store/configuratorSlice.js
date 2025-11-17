import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  modelId: null,
  selectedPartId: null,
  parts: {},
  meta: {
    lastSavedAt: null,
    previewDataUrl: null,
  },
  sceneVersion: 0,
}

const configuratorSlice = createSlice({
  name: 'configurator',
  initialState,
  reducers: {
    setModel: (state, action) => {
      const { modelId, partIds = [] } = action.payload
      state.modelId = modelId
      state.selectedPartId = null
      
      // Initialize parts structure for this model
      if (partIds.length > 0) {
        partIds.forEach((partId) => {
          if (!state.parts[partId]) {
            state.parts[partId] = {}
          }
        })
      }
      
      state.sceneVersion += 1
    },
    
    setSelectedPart: (state, action) => {
      state.selectedPartId = action.payload
    },
    
    setPartColor: (state, action) => {
      const { partId, color } = action.payload
      if (!state.parts[partId]) {
        state.parts[partId] = {}
      }
      state.parts[partId].color = color
      state.sceneVersion += 1
    },
    
    setPartTextureUrl: (state, action) => {
      const { partId, textureUrl } = action.payload
      if (!state.parts[partId]) {
        state.parts[partId] = {}
      }
      state.parts[partId].textureUrl = textureUrl
      // Clear temporary imageUrl when persistent URL is set
      if (textureUrl) {
        delete state.parts[partId].imageUrl
      }
      state.sceneVersion += 1
    },
    
    setPartImageUrl: (state, action) => {
      const { partId, imageUrl } = action.payload
      if (!state.parts[partId]) {
        state.parts[partId] = {}
      }
      state.parts[partId].imageUrl = imageUrl
      state.sceneVersion += 1
    },
    
    setPartLogo: (state, action) => {
      const { partId, logoId, imageUrl } = action.payload
      if (!state.parts[partId]) {
        state.parts[partId] = {}
      }
      if (logoId) {
        state.parts[partId].logoId = logoId
      }
      if (imageUrl) {
        state.parts[partId].imageUrl = imageUrl
      }
      state.sceneVersion += 1
    },
    
    setPartText: (state, action) => {
      const { partId, text } = action.payload
      if (!state.parts[partId]) {
        state.parts[partId] = {}
      }
      if (text === null || text === undefined) {
        delete state.parts[partId].text
      } else {
        state.parts[partId].text = text
      }
      state.sceneVersion += 1
    },
    
    setPartNumber: (state, action) => {
      const { partId, number } = action.payload
      if (!state.parts[partId]) {
        state.parts[partId] = {}
      }
      if (number === null || number === undefined) {
        delete state.parts[partId].number
      } else {
        state.parts[partId].number = number
      }
      state.sceneVersion += 1
    },
    
    setPartRepeat: (state, action) => {
      const { partId, repeat } = action.payload
      if (!state.parts[partId]) {
        state.parts[partId] = {}
      }
      state.parts[partId].repeat = repeat
      state.sceneVersion += 1
    },
    
    setPartOffset: (state, action) => {
      const { partId, offset } = action.payload
      if (!state.parts[partId]) {
        state.parts[partId] = {}
      }
      state.parts[partId].offset = offset
      state.sceneVersion += 1
    },
    
    updateMeta: (state, action) => {
      state.meta = { ...state.meta, ...action.payload }
    },
    
    resetConfig: (state) => {
      state.parts = {}
      state.selectedPartId = null
      state.sceneVersion += 1
    },
  },
})

export const {
  setModel,
  setSelectedPart,
  setPartColor,
  setPartTextureUrl,
  setPartImageUrl,
  setPartLogo,
  setPartText,
  setPartNumber,
  setPartRepeat,
  setPartOffset,
  updateMeta,
  resetConfig,
} = configuratorSlice.actions

export default configuratorSlice.reducer
