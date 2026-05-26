from pydantic import BaseModel
from datetime import datetime

class Ticket(BaseModel):
    id : str

class TicketCreate(Ticket):
    subject: str
    description: str
    customer_name: str
    customer_email: str


class TicketResponse(Ticket):
    ticket_id: str
    status: str
    Updated_at : datetime
    created_at :datetime


