import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { accountTicketsSelector } from '../../../redux/slices/account/index';
import Body from '../../typography/Body';
import Loading from '_src/ui/app/components/loading';
import { growthbook } from '_src/ui/app/experimentation/feature-gating';
import { useAppSelector } from '_src/ui/app/hooks';
import { api } from '_src/ui/app/redux/store/thunk-extras';

export interface TicketProjectProps {
    objectId: string;
    packageObjectId: string;
    agentObjectId: string;
    module: string;
    name: string;
    description: string;
    coverImage: string;
    url: string;
    token?: string;
    tokenUrl?: string;
}

const TicketProject = ({
    ticketProject,
}: {
    ticketProject: TicketProjectProps;
}) => {
    const drilldownLink = `/ticket-project?${new URLSearchParams({
        objectId: ticketProject.objectId,
    }).toString()}`;

    return (
        <Link to={drilldownLink}>
            <div className="flex flex-col gap-3 items-center w-11/12 mx-auto">
                <div className="bg-[#F2F2F2] dark:bg-[#717377] p-4 rounded-xl">
                    <img
                        src={ticketProject.coverImage}
                        alt={`${ticketProject.name} Ticket`}
                    />
                </div>
                <div className="text-left">
                    <span className="font-semibold">{ticketProject.name}</span>{' '}
                    | {ticketProject.description}
                </div>
            </div>
        </Link>
    );
};

const TicketProjectList = () => {
    const loadingTickets = useAppSelector(
        ({ suiObjects }) => suiObjects.loading && !suiObjects.lastSync
    );
    const [loading, setLoading] = useState(true);

    const tickets = useAppSelector(accountTicketsSelector);
    const [ticketProjects, setTicketProjects] = useState<TicketProjectProps[]>(
        []
    );

    useEffect(() => {
        const getTicketProjects = async () => {
            if (loadingTickets) return;

            const ticketProjectIds = await growthbook.getFeatureValue(
                'ticket-projects',
                []
            );

            const ticketProjectObjects =
                await api.instance.fullNode.getObjectBatch(ticketProjectIds);

            const ticketProjects = ticketProjectObjects
                .map((ticketProjectObject) => {
                    const { details } = ticketProjectObject;
                    if (typeof details === 'string' || !('data' in details))
                        return null;

                    const { data } = details;
                    if (!('fields' in data)) return null;

                    const token = data.type.replace('>', '').split('<')[1];
                    const { fields } = data;
                    return {
                        objectId: details.reference.objectId,
                        packageObjectId: data.type.split('::')[0],
                        agentObjectId: details.reference.objectId,
                        module: data.type.split('::')[1],
                        name: fields.name,
                        description: fields.description,
                        url: fields.url,
                        token: token,
                        tokenUrl: fields.token_url,
                        coverImage: fields.cover_image,
                    };
                })
                .filter(
                    (ticketProject) =>
                        !!ticketProject &&
                        !tickets.find(
                            (ticket) =>
                                'type' in ticket.data &&
                                'fields' in ticket.data &&
                                (ticket.data.fields.count || 0) > 0 &&
                                ticket.data.fields.ticket_agent_id ===
                                    ticketProject.agentObjectId
                        )
                ) as TicketProjectProps[];

            setLoading(false);
            setTicketProjects(ticketProjects);
        };

        getTicketProjects();
    }, [loadingTickets, tickets]);

    return (
        <Loading loading={loading}>
            <div className="p-3 flex flex-col gap-3">
                {ticketProjects.map((ticketProject, index) => (
                    <TicketProject
                        key={`ticket-project-${index}`}
                        ticketProject={ticketProject}
                    />
                ))}
                {ticketProjects.length === 0 && (
                    <Body>
                        There are no active ticket projects for you to discover.
                        Please check back later.
                    </Body>
                )}
            </div>
        </Loading>
    );
};

export default TicketProjectList;
