from pydantic import BaseModel
from datetime import datetime
from enum import Enum


class TicketCreate(BaseModel):
    subject: str
    description: str
    customer_name: str
    customer_email: str

class NoteCreate(BaseModel):
    note_text : str

class NoteResponse(NoteCreate):
    id: int
    created_at: datetime

class TicketResponse(TicketCreate):
    ticket_id: str
    status: str
    updated_at : datetime
    created_at :datetime
    notes :list[NoteResponse] = []

class Status(Enum):
    OPEN = 'open'
    PROGRESS = 'progress'
    CLOSED = 'closed'

class TicketUpdate(BaseModel):
    status : Status
    notes: str | None = None

