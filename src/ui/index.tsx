// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { GrowthBookProvider } from '@growthbook/growthbook-react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';

import App from './app';
import { growthbook, loadFeatures } from './app/experimentation/feature-gating';
import { queryClient } from './app/helpers/queryClient';
import { initAppType, initNetworkFromStorage } from '_redux/slices/app';
import { getFromLocationSearch } from '_redux/slices/app/AppType';
import { DependenciesContext } from '_shared/utils/dependenciesContext';
import store from '_store';
import { thunkExtras } from '_store/thunk-extras';

import type { Dependencies } from '_shared/utils/dependenciesContext';

import './styles/global.scss';
import './styles/tailwind.css';
import '_font-icons/output/sui-icons.scss';
import 'bootstrap-icons/font/bootstrap-icons.scss';

async function init() {
    if (process.env.NODE_ENV === 'development') {
        Object.defineProperty(window, 'store', { value: store });
    }
    await loadFeatures();
    store.dispatch(initAppType(getFromLocationSearch(window.location.search)));
    await store.dispatch(initNetworkFromStorage()).unwrap();
    await thunkExtras.background.init(store.dispatch);
}

function renderApp() {
    const rootDom = document.getElementById('root');
    if (!rootDom) {
        throw new Error('Root element not found');
    }
    const root = createRoot(rootDom);

    const appDependencies: Dependencies = {
        closeWindow: () => {
            window.close();
        },
    };

    root.render(
        <DependenciesContext.Provider value={appDependencies}>
            <GrowthBookProvider growthbook={growthbook}>
                <HashRouter>
                    <Provider store={store}>
                        <IntlProvider locale={navigator.language}>
                            <QueryClientProvider client={queryClient}>
                                <App />
                            </QueryClientProvider>
                        </IntlProvider>
                    </Provider>
                </HashRouter>
            </GrowthBookProvider>
        </DependenciesContext.Provider>
    );
}

(async () => {
    await init();
    renderApp();
})();
