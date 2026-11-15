import random
import asyncio
from enum import Enum
from pydantic import BaseModel, Field
from fastapi import FastAPI, HTTPException, status
from fastapi.staticfiles import StaticFiles

MAX_ID = 10000
clients = {}

app = FastAPI(title="Fileshare Garden Backend API", version="0.0.1")

class ClientId(BaseModel):
    id: str = Field(examples=["26391", "blue-dinosaur"])

class Location(BaseModel):
    latitude: float = Field(examples=[33.418091])
    longitude: float = Field(examples=[-111.93379])

class Client(BaseModel):
    id: str = Field(examples=["26391", "blue-dinosaur"])
    location: Location | None

class ClientList(BaseModel):
    clients: list[Client]

class Status(Enum):
    ALIVE = 1
    DEAD = 2
    RECEIVE = 3
    REJECT = 4

class PingResponse(BaseModel):
    status: Status = Field(examples=[
        Status.ALIVE,
        Status.DEAD,
        Status.RECEIVE,
        Status.REJECT
    ])

@app.get("/register")
async def register_endpoint() -> ClientId:
    """
    Obtain a device "registration" in the form of an unique ID 
    """
    id = random.randint(0, MAX_ID)

    for i in range(MAX_ID):
        cur_id = str((id+i)%MAX_ID)
        if cur_id not in clients:
            clients[cur_id] = Client(id=cur_id, location=None)
            return ClientId(id=cur_id)

    raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="All device IDs are currently taken"
            )

@app.get("/all-clients") 
async def all_clients_endpoint() -> ClientList:
    """
    DEBUG endpoint for checking client tracking functionality.
    Do not use this for the production frontend!
    """
    return ClientList(clients=list(clients.values()))

@app.get("/clients-at")
async def clients_at_endpoint(id: ClientId) -> ClientList:
    """
    Get a list of clients close to the location associated with your ID

    TODO: Implement
    """
    return ClientList(clients=[])

@app.get("/client-exists")
async def client_exists_endpoint(id: ClientId) -> bool:
    """
    Check if a client with a certain ID exists

    TODO: Implement
    """
    return False

@app.get("/ping")
async def ping_endpoint(id: ClientId) -> PingResponse:
    """
    Tell the server you're alive and get updates on what to do.

    On the response, if you get ALIVE, your ID is still valid and
    you can keep executing operations.

    In the case of a DEAD status, it is the client's responsibility
    to get a new ID by fetching the /register endpoint.

    RECEIVE and REJECT responses are meant to initiate file receival
    and terminate it by rejection, respectively. In the case of these,
    the response body will also include more information on the receival
    or rejection.
    """
    # TODO: Implement ping and timeout manager
    return PingResponse(status=Status.ALIVE)

app.mount("/", StaticFiles(directory="static", html=True), name="static")
