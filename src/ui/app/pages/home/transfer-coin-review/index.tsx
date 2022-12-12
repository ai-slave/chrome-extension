// Copyright (c) 2022, Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

// import { getTransactionDigest } from '@mysten/sui.js';
import BigNumber from 'bignumber.js';
import { Formik } from 'formik';
import { useCallback, useMemo, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';

import TransferCoinForm from './TransferCoinReviewForm';
import { createTokenValidation } from './validation';
import Loading from '_components/loading';
import { useAppDispatch, useAppSelector } from '_hooks';
import {
    accountAggregateBalancesSelector,
    accountCoinsSelector,
} from '_redux/slices/account';
import { Coin, GAS_TYPE_ARG } from '_redux/slices/sui-objects/Coin';
import { sendTokens } from '_redux/slices/transactions';
import {
    useCoinDecimals,
    useFormatCoin,
} from '_src/ui/app/hooks/useFormatCoin';

import type { SerializedError } from '@reduxjs/toolkit';
import type { FormikHelpers } from 'formik';
import TransferCoinReviewForm from './TransferCoinReviewForm';
import { toast } from 'react-toastify';
import { SuccessAlert } from '_src/ui/app/shared/alerts/SuccessAlert';

const initialValues = {
    to: '',
    amount: '',
};

export type FormValues = typeof initialValues;

// TODO: show out of sync when sui objects locally might be outdated
function TransferCoinReviewPage() {
    const [searchParams] = useSearchParams();
    const coinType = searchParams.get('type');
    const [sendError, setSendError] = useState<string | null>(null);
    const [coinDecimals] = useCoinDecimals(coinType);
    const formData = useAppSelector(({ forms: { sendSui } }) => sendSui);

    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const onHandleSubmit = useCallback(
        async (
            { to, amount }: FormValues,
            { resetForm }: FormikHelpers<FormValues>
        ) => {
            toast(<SuccessAlert text={'Transaction submitted.'} />);

            if (coinType === null) {
                return;
            }
            setSendError(null);
            try {
                const bigIntAmount = BigInt(
                    new BigNumber(amount)
                        .shiftedBy(coinDecimals)
                        .integerValue()
                        .toString()
                );

                console.log('amount: ', bigIntAmount);
                console.log('recipient: ', to);

                await dispatch(
                    sendTokens({
                        amount: bigIntAmount,
                        recipientAddress: to,
                        tokenTypeArg: coinType,
                    })
                );

                resetForm();

                const navLink = `/receipt?${new URLSearchParams({
                    txdigest: '/link-to-tx',
                }).toString()}`;

                toast(
                    <SuccessAlert
                        text={'Transaction successful.'}
                        linkText={'View'}
                        linkUrl={navLink}
                    />,
                    { delay: 500 }
                );

                const receiptUrl = '/tokens';
                navigate(receiptUrl);
            } catch (e) {
                setSendError((e as SerializedError).message || null);
            }
        },
        [dispatch, navigate, coinType, coinDecimals]
    );
    const handleOnClearSubmitError = useCallback(() => {
        setSendError(null);
    }, []);
    const loadingBalance = useAppSelector(
        ({ suiObjects }) => suiObjects.loading && !suiObjects.lastSync
    );

    return (
        <>
            <Loading loading={loadingBalance} big={true}>
                <Formik
                    initialValues={{
                        to: formData.to,
                        amount: formData.amount,
                    }}
                    validateOnMount={true}
                    onSubmit={onHandleSubmit}
                >
                    <TransferCoinReviewForm
                        submitError={sendError}
                        onClearSubmitError={handleOnClearSubmitError}
                    />
                </Formik>
            </Loading>
        </>
    );
}

export default TransferCoinReviewPage;