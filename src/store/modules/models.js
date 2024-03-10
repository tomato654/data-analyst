import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { axios_instance } from '@/utils'


const modelsStore = createSlice({
    name: "messages",
    initialState: {
        // 选中的公司
        selectedToUseCompany: "local-ai",
        // 选中的具体的模型
        selectedToUseModel: ["private-gpt", "LLM Chat"],
        // 该公司的全部子模型
        childrenModels: [],
        // 该公司的设置信息中的当前设置
        currentSetting: {}
    },
    reducers: {
        setSelectedToUseCompany (state,action) {
            state.selectedToUseCompany = action.payload
        },
        setSelectedToUseModel (state,action) {
            state.selectedToUseModel = action.payload
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(fetchChildrenModels.pending,(state,action) =>{
            state.loading = 'pending'
        })
        .addCase(fetchChildrenModels.fulfilled,(state,action) =>{
            console.log("fulfilled",action.payload)
            state.currentSetting = action.payload.setting
            state.childrenModels = action.payload.children
            state.loading = 'succeeded'
        })
        .addCase(fetchChildrenModels.rejected, (state, action) => {
            state.loading = 'failed'
            state.error = action.payload
        })
        .addCase(fetchToUseModel.pending,(state,action) =>{
            state.loading = 'pending'
        })
        .addCase(fetchToUseModel.fulfilled,(state,action) =>{
            if(action.payload.setting.model.length !== 0) {
                state.selectedToUseModel = action.payload.setting.model
            }
            state.loading = 'succeeded'
        })
        .addCase(fetchToUseModel.rejected, (state, action) => {
            state.loading = 'failed'
            state.error = action.payload
        })
    }
})

export const fetchChildrenModels = createAsyncThunk(
    'models/fetchChildrenModels',
    async (selectedModel, {rejectWithValue}) => {
        try {
            if (selectedModel && selectedModel.hasOwnProperty('assistant_id')) {
                const req = await axios_instance.get('/gpt_assistant/retrieve_assistant', {
                    params: {
                        assistant_id: selectedModel.assistant_id
                    }
                })
                return req.data
            }
            else if (selectedModel && selectedModel.hasOwnProperty('reset')) {
                const req = await axios_instance.get('/gpt_assistant/reset_assistant')
                return req.data
            }
            else {
                const req = await axios_instance.get('/models/get_setting_children',{
                    params: {
                        model: selectedModel
                    }
                })
                return req.data[0]
            }
        } catch (error) {
            console.log(error)
            return rejectWithValue(error.code);
        }
    }
)

// 这是给回答问答交互用的模型
export const fetchToUseModel = createAsyncThunk(
    'models/fetchSettingModel',
    async (selectedModel, {rejectWithValue}) => {
        try {
            const req = await axios_instance.get('/models/get_setting_children',{
                params: {
                    model: selectedModel
                }
            })
            return req.data[0]
        } catch (error) {
            console.log(error)
            return rejectWithValue(error.code);
        }
    }
)

export const { setSelectedToUseCompany, setSelectedToUseModel } = modelsStore.actions
export default modelsStore.reducer