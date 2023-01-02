// Copyright (c) 2022, Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { useFormatCoin } from '../../../hooks/useFormatCoin';
import CoinList from './CoinList';
import WalletBalanceAndIconHomeView from './WalletBalanceAndIconHomeView';
import { useAppSelector } from '_hooks';
import { accountAggregateBalancesSelector } from '_redux/slices/account';
import { GAS_TYPE_ARG } from '_redux/slices/sui-objects/Coin';
import { LinkType } from '_src/enums/LinkType';
import { DASHBOARD_LINK } from '_src/shared/constants';
import SendReceiveButtonGroup from '_src/ui/app/shared/buttons/SendReceiveButtonGroup';
import Body from '_src/ui/app/shared/typography/Body';
import ContentBlock from '_src/ui/app/shared/typography/ContentBlock';
import EthosLink from '_src/ui/app/shared/typography/EthosLink';
import Subheader from '_src/ui/app/shared/typography/Subheader';

import type { AccountInfo } from '_src/ui/app/KeypairVault';

function TokensPage() {
    const balances = useAppSelector(accountAggregateBalancesSelector);
    const mistBalance = balances[GAS_TYPE_ARG] || 0;
    const [, , usdAmount] = useFormatCoin(mistBalance, GAS_TYPE_ARG);

    const accountInfo = useAppSelector(
        ({ account: { accountInfos, activeAccountIndex } }) =>
            accountInfos.find(
                (accountInfo: AccountInfo) =>
                    (accountInfo.index || 0) === activeAccountIndex
            )
    );

    return (
        <>
            <WalletBalanceAndIconHomeView
                accountInfo={accountInfo}
                dollarValue={usdAmount}
            />

            <SendReceiveButtonGroup mistBalance={mistBalance} />
            <div className="flex flex-col gap-6 pb-6 overflow-auto">
                <ContentBlock>
                    <CoinList balances={balances} />

                    {(!balances || Object.keys(balances).length < 2) && (
                        <div className="py-3">
                            <Subheader as="h3">Get started with Sui</Subheader>
                            <Body as="p" isTextColorMedium>
                                Interested in SUI but not sure where to start?
                            </Body>
                            <Body as="p" isTextColorMedium>
                                <EthosLink
                                    type={LinkType.External}
                                    to={DASHBOARD_LINK}
                                >
                                    Discover New Apps →
                                </EthosLink>
                            </Body>
                        </div>
                    )}
                </ContentBlock>
            </div>
        </>
    );
}

export default TokensPage;
