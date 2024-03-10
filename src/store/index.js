// Combine sub-modules + export store instances

import {configureStore} from '@reduxjs/toolkit'
import userReducer from './modules/user'
import messageReducer from './modules/messages'
import modelsReducer from './modules/models'

const store = configureStore({
    reducer:{
        user: userReducer,
        message: messageReducer,
        model: modelsReducer
    }
})

export default store