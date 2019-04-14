import { combineReducers } from "redux"
import * as actionsTypes from "../actions/types"

const intialUserState = {
    currentUser: null,
    isLoading: true
}
const user_reducer = (state = intialUserState, action) => {
    switch (action.type) {
        case actionsTypes.SET_USER:
            return {
                currentUser: action.payload.currentUser,
                isLoading: false
            }
        case actionsTypes.CLEAR_USER:
            return {
                ...intialUserState,
                isLoading: false
            }
        default:
            return state
    }
}

const initialChannelState = {
    currentChannel: null,
    isPrivateChannel: false
}
const channel_reducer = (state = initialChannelState, action) => {
    switch (action.type) {
        case actionsTypes.SET_CURRENT_CHANNEL:
            return {
                ...state,
                currentChannel: action.payload.currentChannel
            }
        case actionsTypes.SET_PRIVATE_CHANNEL:
            return {
                ...state,
                isPrivateChannel: action.payload.isPrivateChannel
            }
        default:
            return state
    }
}

const initialColorsState = {
    primaryColor: "#4c3c4c",
    secondaryColor: "#f6f6f6"
}

const colors_reducer = (state = initialColorsState, action) => {
    switch (action.type) {
        case actionsTypes.SET_COLORS:
            return {
                primaryColor: action.payload.primaryColor,
                secondaryColor: action.payload.secondaryColor
            }
        default:
            return state
    }
}

const rootReducer = combineReducers({
    user: user_reducer,
    channel: channel_reducer,
    colors: colors_reducer
})

export default rootReducer
