// Copyright (c) 2022, Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { AppState } from '../hooks/useInitializedGuard';
import {
    unlock,
    loadAccountInformationFromStorage,
} from '../redux/slices/account';
import DescriptionList from '../shared/content/rows-and-lists/DescriptionList';
import PassphraseForm from '../shared/forms/PassphraseForm';
import GetStartedCard from '../shared/layouts/GetStartedCard';
import Loading from '_components/loading';
import { useAppDispatch, useInitializedGuard } from '_hooks';
import PageLayout from '_pages/layout';

const LockedPage = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const checkingInitialized = useInitializedGuard(AppState.LOCKED);

    const _save = useCallback(
        async (passphrase: string) => {
            await dispatch(unlock(passphrase));
            await dispatch(loadAccountInformationFromStorage());
            navigate('/');
        },
        [dispatch, navigate]
    );

    return (
        <PageLayout forceFullscreen={true}>
            <Loading loading={checkingInitialized}>
                <GetStartedCard showBack={true}>
                    <DescriptionList
                        labelAndDescriptions={[
                            {
                                label: 'Welcome Back!',
                                description: (
                                    <>
                                        Enter your password to unlock your
                                        wallet.
                                    </>
                                ),
                            },
                        ]}
                    />

                    <PassphraseForm onSubmit={_save} confirm={false} />
                </GetStartedCard>
            </Loading>
        </PageLayout>
    );
};

export default LockedPage;
