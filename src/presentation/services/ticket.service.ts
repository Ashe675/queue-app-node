import { UuidAdapter } from "../../config/uuid.adapter";
import { Ticket } from "../../domain/interfaces/ticket.interface";
import { WssService } from "./wss.service";

export class TicketService {

    constructor(
        private readonly wssService = WssService.instance,
    ) { }

    public tickets: Ticket[] = [
        // {
        //     id: UuidAdapter.v4(),
        //     number: 1,
        //     createdAt: new Date(),
        //     done: false,
        // },
        // {
        //     id: UuidAdapter.v4(),
        //     number: 2,
        //     createdAt: new Date(),
        //     done: false,
        // },
        // {
        //     id: UuidAdapter.v4(),
        //     number: 3,
        //     createdAt: new Date(),
        //     done: false,
        // },
        // {
        //     id: UuidAdapter.v4(),
        //     number: 4,
        //     createdAt: new Date(),
        //     done: false,
        // },
        // {
        //     id: UuidAdapter.v4(),
        //     number: 5,
        //     createdAt: new Date(),
        //     done: false,
        // },
        // {
        //     id: UuidAdapter.v4(),
        //     number: 6,
        //     createdAt: new Date(),
        //     done: false,
        // }
    ];

    private readonly _workingOnTickets: Ticket[] = [];

    public get pendingTickets(): Ticket[] {
        return this.tickets.filter(ticket => !ticket.handleAtDesk && !ticket.done);
    };

    public get lastWorkingOnTickets(): Ticket[] {
        return this._workingOnTickets.slice(0, 4);
    }

    public get lastTicketNumber() {
        return this.tickets.length > 0 ? this.tickets.at(-1)!.number : 0
    }

    public createTicket(): Ticket {
        const lastNumber = this.lastTicketNumber + 1;

        const ticket: Ticket = {
            id: UuidAdapter.v4(),
            number: lastNumber,
            createdAt: new Date(),
            done: false,
        }

        this.tickets.push(ticket);
        this.onTicketPendingNumberChanged();


        return ticket;
    }

    public drawTicket(desk: string) {
        const ticket = this.tickets.find(ticket => !ticket.handleAtDesk);

        if (!ticket) return {
            status: 'error',
            message: 'There are not ticket yet'
        }

        ticket.handleAtDesk = desk;
        ticket.handleAt = new Date();

        this._workingOnTickets.unshift({ ...ticket });
        this.onTicketPendingNumberChanged();
        this.onWorkingOnChanged();

        return {
            status: 'ok',
            ticket
        }
    }

    public onFinishedTicket(id: string) {
        const ticket = this.tickets.find(ticket => ticket.id === id);

        if (!ticket) return {
            status: 'error',
            message: 'Ticket not found.'
        };

        this.tickets = this.tickets.map(ticket => {
            if (ticket.id === id) {
                ticket.done = true;
                ticket.doneAt = new Date();
            }
            return ticket;
        });

        return {
            status: 'ok'
        }
    };

    private onTicketPendingNumberChanged() {
        this.wssService.sendMessage('on-ticket-count-changed', this.pendingTickets.length);
    }

    private onWorkingOnChanged() {
        this.wssService.sendMessage('on-working-changed', this.lastWorkingOnTickets);
    }
}