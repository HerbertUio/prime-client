export interface Comment {
  id: number;
  ticketId: number;
  content: string;
  createdAt: Date;
  authorId: number;
  isPrivate: boolean;
}
