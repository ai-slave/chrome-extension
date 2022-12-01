import store from "_store";
import {loadFeatures} from "_app/experimentation/feature-gating";
import {initAppType, initNetworkFromStorage} from "_redux/slices/app";
import {getFromLocationSearch} from "_redux/slices/app/AppType";
import {thunkExtras} from "_store/thunk-extras";

export async function init() {
    if (process.env.NODE_ENV === 'development') {
        Object.defineProperty(window, 'store', {value: store});
    }
    await loadFeatures();
    store.dispatch(initAppType(getFromLocationSearch(window.location.search)));
    await store.dispatch(initNetworkFromStorage()).unwrap();
    await thunkExtras.background.init(store.dispatch);
}