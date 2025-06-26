export interface CreateTicketDto {
  requesterId: number;
  title: string;
  description: string;
  subjectId?: number;
  officeId?: number;
  areaId?: number;
  typeTicketId?: number;
}
