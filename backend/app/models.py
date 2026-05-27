from sqlalchemy import Integer, Column, String,Enum,DateTime, ForeignKey
from datetime import datetime
from zoneinfo import ZoneInfo
from app.database import Base
from sqlalchemy.orm import relationship

class Ticket(Base):
    __tablename__ = 'tickets'
    id = Column(Integer, primary_key= True , nullable= False)
    ticket_id = Column(String, unique=True, nullable= False)
    customer_name = Column(String,nullable=False)
    customer_email= Column(String, nullable=False)
    subject = Column(String,nullable=False)
    description = Column(String)
    status=Column(Enum("Open", "Progress", "Closed"), default="Open")
    created_at=Column(DateTime, default=datetime.now(ZoneInfo("Asia/Kolkata")))
    updated_at=Column(DateTime, default=datetime.now(ZoneInfo("Asia/Kolkata")), onupdate=datetime.now(ZoneInfo("Asia/Kolkata")))
    notes = relationship('Note', back_populates='ticket')

class Note(Base):
    __tablename__ = 'notes'
    id = Column(Integer, primary_key=True, nullable= False)
    ticket_id = Column(String, ForeignKey("tickets.ticket_id"))
    note_text = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.now(ZoneInfo("Asia/Kolkata")))
    ticket = relationship('Ticket', back_populates='notes')
