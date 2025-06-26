export interface AddCommentDto {
  content: string;
  authorId: number; // Por ahora lo dejaremos fijo, en el futuro vendría del usuario logueado.
  isPrivate: boolean;
}
