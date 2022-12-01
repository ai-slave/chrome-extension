import { Link } from 'react-router-dom';
import Body from '../../typography/Body';
import BodyLarge from '../../typography/BodyLarge';
import { useFormatCoin } from '_src/ui/app/hooks';

type ActivityRowProps = {
    icon: any;
    link: string;
    header: JSX.Element | string;
    subheader: string;
    txAmount?: number;
    amountSubtext?: string;
    coinType?: string;
};

export const ActivityRow = ({
    icon,
    link,
    header,
    subheader,
    txAmount,
    coinType,
    amountSubtext,
}: ActivityRowProps) => {
    const [formattedAmount] = useFormatCoin(
        txAmount,
        coinType || '0x2::sui::SUI'
    );

    return (
        <Link to={link} className="flex flex-row justify-between py-3">
            <div className={'flex flex-row items-center gap-3'}>
                <div>{icon}</div>
                <span className="flex flex-col text-left">
                    <BodyLarge>{header}</BodyLarge>
                    <Body className={'text-ethos-light-text-medium'}>
                        {subheader}
                    </Body>
                </span>
            </div>
            <span className="flex flex-row justify-between">
                {txAmount && (
                    <div className={'text-right'}>
                        <BodyLarge className="float-right font-semibold">
                            {formattedAmount}
                        </BodyLarge>
                        <Body className={'text-ethos-light-text-medium'}>
                            {amountSubtext}
                        </Body>
                    </div>
                )}
            </span>
        </Link>
    );
};