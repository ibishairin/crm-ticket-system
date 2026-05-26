from sqlalchemy import Integer, Column, String,Enum,DateTime
from datetime import datetime
from database import Base


class Ticket(Base):
    __tablename__ = 'tickets'
    id = Column(Integer, primary_key= True , nullable= False)
    ticket_id = Column(Integer, unique=True, nullable= False)
    customer_name = Column(String,nullable=False)
    customer_email= Column(String, nullable=False)
    Subject = Column(String,nullable=False)
    Description = Column(String)
    status=Column(Enum("Open""Progress","Closed"),default="Open")
    created_at=Column(DateTime, default=datetime.utcnow)
    updated_at=Column(DateTime, default=datetime.utcnow)

