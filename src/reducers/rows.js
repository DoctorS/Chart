import { SET_ROWS } from '../constants/ActionTypes'

const initialState = []

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_ROWS:
      return action.rows
    default:
      return state
  }
}
