import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { axios_instance } from '@/utils'

const messagesStore = createSlice({
    name: "messages",
    initialState: {
        loading: 'idle',
        error: '',
        activeId: '',
        tabsInfo: [],
        updateMessageRender: false,
        usingModel: []
    },
    reducers: {
        setActiveId (state, action) {
            state.activeId = action.payload
        },
        setUpdateMessageRender (state) {
            state.updateMessageRender = !state.updateMessageRender
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(sendUserMessage.pending,(state,action) =>{
            state.loading = 'pending'
        })
        .addCase(sendUserMessage.fulfilled,(state,action) =>{
            console.log("Redux Store (messages) | extraReducers action.payload: ",action.payload)
            state.activeId = action.payload.chat_id
            state.loading = 'succeeded'
        })
        .addCase(sendUserMessage.rejected, (state, action) => {
            state.loading = 'failed'
            state.error = action.payload
        })
        .addCase(sendUserMessageToBot.fulfilled,(state,action) =>{
            console.log("Redux Store (messages) | extraReducers action.payload: ",action.payload)
            state.loading = 'succeeded'
        })
        .addCase(fetchTabsInfo.fulfilled,(state,action) =>{
            state.tabsInfo = action.payload.chats
            state.loading = 'succeeded'
        })
    }
})

export const sendUserMessage = createAsyncThunk(
    'messages/sendUserMessage',
    async (userMessage, {rejectWithValue}) => {
        try {
            console.log("asdasddasdasdas",userMessage)
            const req = await axios_instance.post('/chats/update_chats',userMessage)
            return req.data
        } catch (error) {
            console.log(error)
            return rejectWithValue(error.code);
        }
    }
)

export const sendUserMessageToBot = createAsyncThunk(
    'messages/sendUserMessageToBot',
    async (userMessage, {rejectWithValue}) => {
        try {
            console.log("看看这里的userMessage",userMessage)
            const req = await axios_instance.post('/v1/completions',userMessage)
            return req.data
        } catch (error) {
            console.log(error)
            return rejectWithValue(error.code);
        }
    }
)


export const fetchTabsInfo = createAsyncThunk(
    'messages/fetchTabsInfo',
    async (_,{rejectWithValue}) => {
        try {
            const req = await axios_instance.get('/chats/get_all_chat_ids_titles')
            return req.data
        } catch (error) {
            console.log(error)
            return rejectWithValue(error.code);
        }
    }
)

export const {  setActiveId, setUpdateMessageRender } = messagesStore.actions
export default messagesStore.reducer





