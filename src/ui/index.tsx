// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import {GrowthBookProvider} from '@growthbook/growthbook-react';
import {QueryClientProvider} from '@tanstack/react-query';
import {createRoot} from 'react-dom/client';
import {IntlProvider} from 'react-intl';
import {Provider} from 'react-redux';
import {HashRouter} from 'react-router-dom';

import App from './app';
import {growthbook} from './app/experimentation/feature-gating';
import {queryClient} from './app/helpers/queryClient';
import {init} from "_src/ui/init";
import store from '_store';

import './styles/global.scss';
import './styles/tailwind.css';
import '_font-icons/output/sui-icons.scss';
import 'bootstrap-icons/font/bootstrap-icons.scss';

function renderApp() {
    const rootDom = document.getElementById('root');
    if (!rootDom) {
        throw new Error('Root element not found');
    }
    const root = createRoot(rootDom);
    root.render(
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
    );
}

(async () => {
    await init();
    renderApp();
})();
