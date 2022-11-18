import {
    CheckCircleIcon,
    MinusCircleIcon,
    PencilIcon,
} from '@heroicons/react/24/solid';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextColor } from '_src/enums/Typography';
import {
    useEditWalletUrl,
    useNextWalletPickerUrl,
} from '../../components/menu/hooks';
import { useAppDispatch, useMiddleEllipsis } from '../../hooks';
import { type AccountInfo } from '../../KeypairVault';
import { saveActiveAccountIndex } from '../../redux/slices/account';
import Body from '../typography/Body';
import BodyLarge from '../typography/BodyLarge';

interface WalletButtonProps {
    wallet: AccountInfo;
    isActive: boolean;
    isWalletEditing: boolean;
}

const WalletButton = ({
    wallet,
    isActive,
    isWalletEditing,
}: WalletButtonProps) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const shortenedAddress = useMiddleEllipsis(wallet.address, 9, 5);
    const editWalletUrl = useEditWalletUrl(wallet.index);

    const switchToThisWallet = useCallback(async () => {
        if (isActive || isWalletEditing) return;
        await dispatch(saveActiveAccountIndex(wallet.index));
        navigate('/');
    }, [wallet.index, isActive, isWalletEditing]);

    const editThisWallet = useCallback(() => {
        console.log('editWalletUrl :>> ', editWalletUrl);
        navigate(editWalletUrl);
    }, [wallet.index]);

    const hideThisWallet = useCallback(() => {
        console.log('hiding wallet.index :>> ', wallet.index);
    }, [wallet.index]);

    return (
        <div
            className={`py-[10px] px-3 flex justify-between items-center ${
                !isWalletEditing && 'cursor-pointer'
            }`}
            onClick={switchToThisWallet}
        >
            <div className="flex gap-3">
                <div
                    className="h-10 w-10 rounded-full flex items-center justify-center"
                    style={{
                        backgroundColor: wallet.color,
                    }}
                />
                <div className="flex flex-col text-left">
                    <BodyLarge>{wallet.name}</BodyLarge>
                    <Body textColor={TextColor.Medium}>{shortenedAddress}</Body>
                </div>
            </div>
            <div>
                {isWalletEditing && (
                    <div className="flex gap-4">
                        <button onClick={editThisWallet}>
                            <PencilIcon className="h-5 w-5 text-black dark:text-white" />
                        </button>
                        <button onClick={hideThisWallet}>
                            <MinusCircleIcon className="h-5 w-5 text-black dark:text-white" />
                        </button>
                    </div>
                )}
                {isActive && !isWalletEditing && (
                    <CheckCircleIcon className="h-5 w-5 text-ethos-light-primary-light" />
                )}
            </div>
        </div>
    );
};

export default WalletButton;