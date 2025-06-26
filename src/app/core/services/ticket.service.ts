import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Ticket } from '../models/ticket.model';
import { AddCommentDto } from '../models/add-comment.dto';
import { ChangeStatusDto } from '../models/change-status.dto';
import { ChangePriorityDto } from '../models/change-priority.dto';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiUrl = 'http://localhost:5169/api/tickets';

  constructor(private http: HttpClient) { }

  getAllTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.apiUrl);
  }
  getTicketById(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/${id}`);
  }
  getComments(ticketId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/${ticketId}/comments`);
  }
  addComment(ticketId: number, commentData: AddCommentDto): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/${ticketId}/comments`, commentData);
  }
  changeStatus(ticketId: number, dto: ChangeStatusDto): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.apiUrl}/${ticketId}/status`, dto);
  }
  changePriority(ticketId: number, dto: ChangePriorityDto): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.apiUrl}/${ticketId}/priority`, dto);
  }
}
