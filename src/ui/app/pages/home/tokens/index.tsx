// Copyright (c) 2022, Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import CoinBalance from './CoinBalance';
import AccountAddress, { AddressMode } from '_components/account-address';
import Alert from '_components/alert';
import Loading from '_components/loading';
import { useAppSelector, useObjectsState } from '_hooks';
import { accountAggregateBalancesSelector } from '_redux/slices/account';
import { GAS_TYPE_ARG } from '_redux/slices/sui-objects/Coin';
import { TextColor, LinkType } from '_src/enums/TypographyEnums';
import { DASHBOARD_LINK } from '_src/shared/constants';
import { useNextMenuUrl } from '_src/ui/app/components/menu/hooks';
import Divider from '_src/ui/app/shared/Divider';
import Body from '_src/ui/app/shared/typography/Body';
import BodyLarge from '_src/ui/app/shared/typography/BodyLarge';
import EthosLink from '_src/ui/app/shared/typography/EthosLink';

import type { AccountInfo } from '_src/ui/app/KeypairVault';
import WalletRow from '_src/ui/app/shared/content/rows-and-lists/WalletRow';
import {
    CreditCardIcon,
    PaperAirplaneIcon,
    ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import InlineButtonGroup from '_src/ui/app/shared/buttons/InlineButtonGroup';
import AmountRow from '_src/ui/app/shared/content/rows-and-lists/AmountRow';
import ContentBlock from '_src/ui/app/shared/typography/ContentBlock';

function TokensPage() {
    const [editWallet, setEditWallet] = useState<boolean>(false);

    const accountInfo = useAppSelector(
        ({ account: { accountInfos, activeAccountIndex } }) =>
            accountInfos.find(
                (accountInfo: AccountInfo) =>
                    (accountInfo.index || 0) === activeAccountIndex
            )
    );

    const { loading, error, showError } = useObjectsState();
    const balances = useAppSelector(accountAggregateBalancesSelector);
    const suiBalance = balances[GAS_TYPE_ARG] || BigInt(0);
    const isBalanceZero = useMemo(
        () => suiBalance.toString() === '0',
        [suiBalance]
    );

    const otherCoinTypes = useMemo(
        () => Object.keys(balances).filter((aType) => aType !== GAS_TYPE_ARG),
        [balances]
    );

    const sendUrl = useMemo(
        () => `/send?${new URLSearchParams({ type: GAS_TYPE_ARG }).toString()}`,
        [GAS_TYPE_ARG]
    );

    return (
        <div className="pt-2">
            {showError && error ? (
                <Alert>
                    <strong>Sync error (data might be outdated).</strong>{' '}
                    <small>{error.message}</small>
                </Alert>
            ) : null}
            <WalletRow />
            <Loading loading={loading}>
                <AmountRow balance={suiBalance} type={GAS_TYPE_ARG} />
                <InlineButtonGroup
                    buttonPrimaryTo={isBalanceZero ? '/buy' : sendUrl}
                    buttonPrimaryChildren={
                        <>
                            {isBalanceZero ? (
                                <CreditCardIcon className="h-4 w-4" />
                            ) : (
                                <PaperAirplaneIcon className="h-4 w-4" />
                            )}

                            {isBalanceZero ? 'Buy' : 'Send'}
                        </>
                    }
                    buttonSecondaryTo="/receive"
                    buttonSecondaryChildren={
                        <>
                            <ArrowDownTrayIcon className="h-4 w-4" />
                            Receive
                        </>
                    }
                />

                {otherCoinTypes.length ? (
                    otherCoinTypes.map((aCoinType) => {
                        const aCoinBalance = balances[aCoinType];
                        return (
                            <>
                                <div className="">OTHER COINS</div>
                                <CoinBalance
                                    type={aCoinType}
                                    balance={aCoinBalance}
                                    key={aCoinType}
                                />
                            </>
                        );
                    })
                ) : (
                    <ContentBlock>
                        <BodyLarge as="h3">Get started with Sui</BodyLarge>
                        <Body as="p" textColor={TextColor.Medium}>
                            Interested in Sui but don&apos;t know where to
                            start? We&apos;ve got you covered.
                        </Body>
                        <Body>
                            <EthosLink
                                type={LinkType.External}
                                to={DASHBOARD_LINK}
                            >
                                Discover new apps →
                            </EthosLink>
                        </Body>
                    </ContentBlock>
                )}
            </Loading>
        </div>
    );
}

export default TokensPage;
