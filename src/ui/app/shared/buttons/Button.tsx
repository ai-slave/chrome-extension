import { Link } from 'react-router-dom';

import Body from '../typography/Body';

import type { MouseEventHandler } from 'react';

export interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
    buttonStyle: 'primary' | 'secondary';
    className?: string;
    onClick?: MouseEventHandler<HTMLButtonElement>;
    to?: string;
    type?: 'button' | 'submit' | 'reset' | undefined;
    disabled?: boolean;
    isInline?: boolean;
    children?: React.ReactNode;
}

const buttonChildrenClassNames =
    'inline-flex items-center justify-center gap-2';

const baseButtonClassNames =
    'w-full w-full p-4 mb-6 border border-transparent rounded-2xl';

const primaryButtonClassNames =
    baseButtonClassNames +
    ' ' +
    'text-ethos-light-background-default bg-ethos-light-primary-light disabled:opacity-50';

const secondaryButtonClassNames =
    baseButtonClassNames +
    ' ' +
    'text-ethos-light-primary-light bg-ethos-light-background-accent dark:text-ethos-dark-text-default dark:bg-ethos-dark-background-accent';

const Button = (props: ButtonProps) => {
    const { buttonStyle, to, className, isInline, children, ...reactProps } =
        props;
    // Note - in order to override an existing class, prepend the name with "!"
    // ex) !py-2. This will only work if done from the component implementation
    // (not adding the "!") later in this file

    const buttonWrapperClassNames = isInline ? '' : 'px-6';

    const classes =
        (className ? className : '') +
        ' ' +
        (buttonStyle === 'primary'
            ? primaryButtonClassNames
            : secondaryButtonClassNames);

    const buttonElement = (
        <button className={classes} {...reactProps}>
            <Body
                as="span"
                isSemibold={true}
                className={buttonChildrenClassNames}
            >
                {children}
            </Body>
        </button>
    );

    if (to) {
        return (
            // tabIndex of -1 will make the <Link> element not tabbable, because the button inside it already is
            <div className={buttonWrapperClassNames}>
                <Link to={to} tabIndex={-1}>
                    {buttonElement}
                </Link>
            </div>
        );
    } else {
        return <div className={buttonWrapperClassNames}>{buttonElement}</div>;
    }
};

export default Button;
