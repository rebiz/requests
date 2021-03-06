import {combineReducers} from 'redux';
import {routerReducer as router} from 'react-router-redux';
import {loadingBarReducer} from './loading';
import {notificationReducer} from './notification';

export const makeRootReducer = (asyncReducers) => {
  return combineReducers({
    // Add sync reducers here
    router,
    loadingBar: loadingBarReducer,
    notification: notificationReducer,
    ...asyncReducers
  });
};

export const injectReducer = (store, {key, reducer}) => {
  store.asyncReducers[key] = reducer;
  store.replaceReducer(makeRootReducer(store.asyncReducers));
};

export default makeRootReducer;
