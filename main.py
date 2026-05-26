from fastapi import FastAPI
from database import engine, Base
from model import Ticket
from schemas import TicketCreate, TicketResponse

app = FastAPI()

Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {'message':'hello world'}

@app.post("/api/tickets")
def create_ticket(tickets:str) -> TicketCreate:
    return 