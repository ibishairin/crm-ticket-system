from fastapi import FastAPI, HTTPException, status,Depends,Query
from typing import Annotated
from app.database import engine, Base, get_db
from app.models import Ticket, Note
from app.schemas import TicketCreate, TicketResponse, Status , TicketUpdate
from sqlalchemy import select
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from uuid import uuid4
from datetime import datetime
from zoneinfo import ZoneInfo


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {'message':'Hello world !'}

@app.post("/api/tickets", status_code=status.HTTP_201_CREATED)
def create_ticket(ticket:TicketCreate, db:Annotated[Session,Depends(get_db)]):
    new_ticket = Ticket(
        ticket_id = f"TMP-{uuid4().hex}",
        customer_name = ticket.customer_name,
        customer_email = ticket.customer_email,
        subject = ticket.subject,
        description = ticket.description
    )
    db.add(new_ticket)
    db.flush()
    new_ticket.ticket_id =(f'TKT-{new_ticket.id:03d}')
    db.commit()
    db.refresh(new_ticket)
    return new_ticket


@app.get("/api/tickets")
def get_tickets(db : Annotated[Session, Depends(get_db)],
                status:Status | None = None,
                q: Annotated[str|None, Query(max_length=10)] = None):
    query = db.query(Ticket)
    if status:
        query = query.filter(
            Ticket.status == status.value.capitalize()
        )
    if q:
        query = query.filter(
            Ticket.customer_name.contains(q)
        )
    tickets = query.all()
    return tickets


@app.get("/api/tickets/{ticket_id}")
def get_ticket(ticket_id:str, db:Annotated[Session,Depends(get_db)] ) -> TicketResponse:
    ticket = db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail= "Ticket not found")
    return ticket

@app.put("/api/tickets/{ticket_id}")
def update_ticket(ticket_id: str,ticket_update: TicketUpdate,db: Annotated[Session, Depends(get_db)]) :
    ticket = db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Ticket not found")
    ticket.status = ticket_update.status.value.capitalize()
    ticket.updated_at = datetime.now(ZoneInfo("Asia/Kolkata"))
    if ticket_update.notes:
        new_note = Note(ticket_id=ticket.ticket_id,note_text=ticket_update.notes)
        db.add(new_note)
    db.commit()
    db.refresh(ticket)
    return {
        "success": True,
        "updated_at": ticket.updated_at
    }