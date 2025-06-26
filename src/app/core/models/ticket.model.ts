import { TicketPriority } from "./ticket-priority.enum";
import { TicketStatus } from "./ticket-status.enum";
import { TicketType } from "./ticket-type.enum";

export interface Ticket {
  id: number;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  type: TicketType;
  tags?: string;
  createdDate: Date;
  closedDate?: Date;
  resolutionDate?: Date;
  requesterId?: number;
  assignedAgentId?: number;
  assignedGroupId?: number;
  typeTicketId?: number;
  officeId?: number;
  areaId?: number;
  subjectId?: number;
  primaryTicketId?: number;
  parentTicketId?: number;
  childTickets?: Ticket[];
  comments?: Comment[];
  // attachments?: Attachment[]; // Lo añadiremos cuando implementemos la subida de archivos
}
