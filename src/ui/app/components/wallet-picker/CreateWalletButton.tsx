import { useRef, useCallback } from 'react';

import { type AccountInfo } from '../../KeypairVault';
import getNextWalletColor from '../../helpers/getNextWalletColor';
import { useAppDispatch, useAppSelector } from '../../hooks';
import {
    setAccountInfos,
    saveAccountInfos,
    saveActiveAccountIndex,
} from '../../redux/slices/account';
import { thunkExtras } from '../../redux/store/thunk-extras';
import Button from '../../shared/buttons/Button';
import Authentication from '_src/background/Authentication';

const CreateWalletButton = () => {
    const dispatch = useAppDispatch();
    const accountInfos = useAppSelector(({ account }) => account.accountInfos);
    const authentication = useAppSelector(
        ({ account }) => account.authentication
    );
    const keypairVault = thunkExtras.keypairVault;
    const draftAccountInfos = useRef<AccountInfo[]>(accountInfos);

    const getAccountInfos = useCallback(async () => {
        if (authentication) return;

        if (draftAccountInfos.current.length === 0) {
            draftAccountInfos.current = [
                {
                    index: 0,
                    address: keypairVault.getAddress(0) || '',
                    seed: (keypairVault.getSeed(0) || '').toString(),
                },
            ];
        }

        const accountInfosWithAddresses = draftAccountInfos.current.map(
            (accountInfo: AccountInfo) => {
                const address =
                    accountInfo.address ||
                    keypairVault.getAddress(accountInfo.index) ||
                    '';
                return {
                    ...accountInfo,
                    address,
                };
            }
        );
        setAccountInfos(accountInfosWithAddresses);
    }, [authentication, keypairVault]);

    const _saveAccountInfos = useCallback(async () => {
        if (authentication) {
            Authentication.updateAccountInfos(draftAccountInfos.current);
            await dispatch(setAccountInfos(draftAccountInfos.current));
            setAccountInfos(draftAccountInfos.current);
        } else {
            await dispatch(saveAccountInfos(draftAccountInfos.current));
            await dispatch(
                saveActiveAccountIndex(draftAccountInfos.current.length - 1)
            );
            getAccountInfos();
        }
    }, [authentication, dispatch, getAccountInfos]);

    const createWallet = useCallback(() => {
        const loadAccFromStorage = async () => {
            const sortedAccountIndices = accountInfos
                .map((a) => a.index || 0)
                .sort(function (a, b) {
                    return a - b;
                });
            const nextAccountIndex =
                +sortedAccountIndices[sortedAccountIndices.length - 1] + 1;

            let newAccountInfos: AccountInfo[];
            if (authentication) {
                const newAccount = await Authentication.createAccount(
                    nextAccountIndex
                );
                newAccountInfos = newAccount
                    ? [...accountInfos, newAccount]
                    : accountInfos;

                draftAccountInfos.current = newAccountInfos;
            } else {
                newAccountInfos = [
                    ...accountInfos,
                    {
                        index: nextAccountIndex,
                        name: `Wallet ${accountInfos.length + 1}`,
                        color: getNextWalletColor(nextAccountIndex),
                        address:
                            keypairVault.getAddress(nextAccountIndex) || '',
                        seed: (
                            keypairVault.getSeed(nextAccountIndex) || ''
                        ).toString(),
                    },
                ];

                draftAccountInfos.current = newAccountInfos;
            }

            setAccountInfos(newAccountInfos);
        };
        loadAccFromStorage();
        _saveAccountInfos();
    }, [keypairVault, authentication, accountInfos, _saveAccountInfos]);

    return (
        <Button buttonStyle="primary" onClick={createWallet}>
            Create Wallet
        </Button>
    );
};

export default CreateWalletButton;
