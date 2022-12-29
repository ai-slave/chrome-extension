import Typography, { type TypographyProps } from './Typography';

const Title = (props: TypographyProps) => {
    const titleClasses =
        'font-weight-ethos-title text-size-ethos-title leading-line-height-ethos-title tracking-letter-spacing-ethos-title';
    return (
        <Typography {...props} className={props.className + ' ' + titleClasses}>
            {props.children}
        </Typography>
    );
};

export default Title;
