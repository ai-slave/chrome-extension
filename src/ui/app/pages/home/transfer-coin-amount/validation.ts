// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import BigNumber from 'bignumber.js';
import * as Yup from 'yup';

import { formatBalance } from '_app/hooks/useFormatCoin';
import { GAS_SYMBOL, GAS_TYPE_ARG } from '_redux/slices/sui-objects/Coin';

export function createTokenValidation(
    coinType: string,
    coinBalance: bigint,
    coinSymbol: string,
    gasBalance: bigint,
    decimals: number,
    gasDecimals: number,
    gasBudget: number
) {
    return Yup.object().shape({
        amount: Yup.mixed()
            .transform((_, original) => {
                let v;

                if (original.includes(',')) {
                    v = original.replace(',', '.');
                } else {
                    v = original;
                }

                return new BigNumber(parseFloat(v));
            })
            .test('required', `\${path} is a required field`, (value) => {
                return !!value;
            })
            .test(
                'max',
                `You have no ${coinSymbol}. Please use the faucet to get more.`,
                () => coinBalance >= 0
            )
            .test(
                'valid',
                'The value provided is not valid.',
                (value?: BigNumber) => {
                    if (!value || value.isNaN() || !value.isFinite()) {
                        return false;
                    }
                    return true;
                }
            )
            .test(
                'min',
                `Amount must be greater than 0 ${coinSymbol}`,
                (amount?: BigNumber) => (amount ? amount.gt(0) : false)
            )
            .test(
                'max',
                `Amount must be less than ${formatBalance(
                    coinBalance,
                    decimals
                )} ${coinSymbol}`,
                (amount?: BigNumber) => {
                    return amount && coinBalance >= 0
                        ? amount.shiftedBy(decimals).lte(coinBalance.toString())
                        : false;
                }
            )
            .test(
                'max-decimals',
                `The value exeeds the maximum decimals (${decimals}).`,
                (amount?: BigNumber) => {
                    return amount
                        ? amount.shiftedBy(decimals).isInteger()
                        : false;
                }
            )
            .test(
                'gas-balance-check',
                `Insufficient ${GAS_SYMBOL} balance to cover gas fee (${formatBalance(
                    gasBudget,
                    gasDecimals
                )} ${GAS_SYMBOL})`,
                (amount?: BigNumber) => {
                    if (!amount) {
                        return false;
                    }
                    try {
                        let availableGas = gasBalance;
                        if (coinType === GAS_TYPE_ARG) {
                            availableGas -= BigInt(
                                amount.shiftedBy(decimals).toString()
                            );
                        }
                        return availableGas >= gasBudget;
                    } catch (e) {
                        return false;
                    }
                }
            )
            .label('amount'),
    });
}
