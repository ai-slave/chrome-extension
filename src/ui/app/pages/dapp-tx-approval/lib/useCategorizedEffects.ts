import { useMemo } from 'react';

import { cleanObjectId } from '.';

import type {
    SuiMoveNormalizedFunction,
    TransactionEffects,
} from '@mysten/sui.js';

export type useCategorizedEffectsArgs = {
    normalizedFunction?: SuiMoveNormalizedFunction;
    effects?: TransactionEffects | null;
    address?: string | null;
};

const useCategorizedEffects = ({
    normalizedFunction,
    effects,
    address,
}: useCategorizedEffectsArgs) => {
    const reading = useMemo(() => {
        if (!normalizedFunction) return [];

        const readObjects = normalizedFunction.parameters
            .filter(
                (param) => typeof param !== 'string' && 'Reference' in param
            )
            .map((param) => {
                if (typeof param !== 'string' && 'Reference' in param) {
                    const reference = param.Reference;
                    if (
                        typeof reference !== 'string' &&
                        'Struct' in reference
                    ) {
                        return reference.Struct;
                    }
                }
                return null;
            });
        return readObjects;
    }, [normalizedFunction]);

    const creating = useMemo(() => {
        if (!effects?.events) return [];

        const newEvents = effects.events.filter(
            (event) =>
                'newObject' in event &&
                event.newObject &&
                typeof event.newObject.recipient !== 'string' &&
                'AddressOwner' in event.newObject.recipient &&
                event.newObject.recipient.AddressOwner === address
        );

        const creating = newEvents.map((event) => {
            if (!('newObject' in event)) return {};

            const objectTypeParts = event.newObject.objectType.split('::');
            return {
                address: objectTypeParts[0],
                module: objectTypeParts[1],
                name: objectTypeParts[2].split('<')[0],
            };
        });

        return creating;
    }, [effects, address]);

    const mutating = useMemo(() => {
        if (!effects?.events) return [];

        const mutating = effects.events
            .filter((event) => {
                if (!('mutateObject' in event)) return false;
                const mutation = event.mutateObject;
                const mutated = effects.mutated;
                return (
                    mutation &&
                    mutated &&
                    mutation.objectType.indexOf(
                        cleanObjectId(mutation.packageId)
                    ) > -1 &&
                    mutated.find(
                        (asset) =>
                            asset.reference.objectId === mutation.objectId &&
                            typeof asset.owner !== 'string' &&
                            'AddressOwner' in asset.owner &&
                            asset.owner.AddressOwner === address
                    )
                );
            })
            .map((event) => {
                if (!('mutateObject' in event)) return {};

                const objectTypeParts =
                    event.mutateObject.objectType.split('::');
                return {
                    address: objectTypeParts[0],
                    module: objectTypeParts[1],
                    name: objectTypeParts[2].split('<')[0],
                };
            });

        return mutating;
    }, [effects, address]);

    const transferring = useMemo(() => {
        if (!effects?.events) return [];

        const transferring = effects.events
            .filter(
                (event) =>
                    'transferObject' in event &&
                    event.transferObject &&
                    typeof event.transferObject.recipient !== 'string' &&
                    'AddressOwner' in event.transferObject.recipient &&
                    event.transferObject.recipient.AddressOwner
            )
            .map((event) => {
                if (!('transferObject' in event)) return {};

                const objectTypeParts =
                    event.transferObject.objectType.split('::');
                return {
                    address: objectTypeParts[0],
                    module: objectTypeParts[1],
                    name: objectTypeParts[2].split('<')[0],
                };
            });

        return transferring;
    }, [effects]);

    const deleting = useMemo(() => {
        if (!effects?.events) return [];

        const deleting = effects.events
            .filter((event) => 'deleteObject' in event)
            .map((event) => {
                if (!('deleteObject' in event)) return {};
                return {
                    name: event.deleteObject.objectId,
                };
            });

        return deleting;
    }, [effects]);

    const coinChanges = useMemo(() => {
        const zero: Record<string, number> = {};

        if (!effects?.events) return zero;

        const coinBalanceChangeEvents = effects.events.filter(
            (e) =>
                'coinBalanceChange' in e &&
                typeof e.coinBalanceChange.owner !== 'string' &&
                'AddressOwner' in e.coinBalanceChange.owner &&
                e.coinBalanceChange.owner.AddressOwner === address
        );

        return coinBalanceChangeEvents.reduce((totals, e) => {
            if (!('coinBalanceChange' in e)) return totals;

            const { coinType, amount } = e.coinBalanceChange;
            if (!totals[coinType]) totals[coinType] = 0;
            totals[coinType] += amount * -1;
            return totals;
        }, zero);
    }, [effects, address]);

    return {
        reading,
        mutating,
        creating,
        deleting,
        transferring,
        coinChanges,
    };
};

export default useCategorizedEffects;
