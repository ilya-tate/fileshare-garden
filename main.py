import random
import time
import asyncio
from enum import Enum
from typing import Annotated
from pydantic import BaseModel, Field
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.staticfiles import StaticFiles

MAX_ID = 10000
DEAD_TIME_S = 5 # Seconds
clients = {}

app = FastAPI(title="Fileshare Garden Backend API", version="0.0.1")

def prune_dead_clients():
    toPrune = []
    for clientId in clients:
        client = clients[clientId]
        cur_time = time.time()
        elapsed = cur_time - client.last_ping_time
        if (elapsed > DEAD_TIME_S):
            toPrune.append(clientId)
        else:
            clients[clientId].last_ping_time = cur_time

    for id in toPrune:
        del clients[id]

class ClientId(BaseModel):
    id: str = Field(examples=["26391", "blue-dinosaur"])

class Location(BaseModel):
    latitude: float = Field(examples=[33.418091])
    longitude: float = Field(examples=[-111.93379])

class Client(BaseModel):
    id: str = Field(examples=["26391", "blue-dinosaur"])
    location: Location | None
    last_ping_time: float

class ClientList(BaseModel):
    clients: list[Client]

class ResponseStatus(str, Enum):
    ALIVE = "ALIVE"
    DEAD = "DEAD"
    SEND = "SEND"
    RECEIVE = "RECEIVE"
    REJECTED = "REJECTED"

class ClientStatus(str, Enum):
    SENDING = "SENDING"
    # TODO: KEEP WORKING

class PingResponse(BaseModel):
    status: ResponseStatus = Field(examples=[
        ResponseStatus.ALIVE,
        ResponseStatus.DEAD,
        ResponseStatus.SEND,
        ResponseStatus.RECEIVE,
        ResponseStatus.REJECTED,
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
            clients[cur_id] = Client(
                id=cur_id,
                location=None,
                last_ping_time=time.time()
            )
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
async def clients_at_endpoint(client: Annotated[ClientId, Depends()]) -> ClientList:
    """
    Get a list of clients close to the location associated with your ID

    TODO: Implement
    """
    return ClientList(clients=[])

@app.get("/client-exists")
async def client_exists_endpoint(client: Annotated[ClientId, Depends()]) -> bool:
    """
    Check if a client with a certain ID exists

    TODO: Implement
    """
    return False

@app.get("/ping")
async def ping_endpoint(client: Annotated[ClientId, Depends()]) -> PingResponse:
    """
    Tell the server you're alive and get updates on what to do.

    On the response, if you get **ALIVE**, your ID is still valid and
    you can keep executing operations.

    In the case of a **DEAD** status, it is the client's responsibility
    to get a new ID by fetching the `/register` endpoint.

    **SEND**, **RECEIVE** and **REJECTED** responses are meant to initiate
    file sending, initiate file receival, and terminate it by rejection,
    respectively. In the case of these, the response body will also include
    more information on the sending, receival or rejection.
    """
    prune_dead_clients()

    if (client.id not in clients):
        return PingResponse(status=ResponseStatus.DEAD)

    # Else, it's here!
    return PingResponse(status=ResponseStatus.ALIVE)

@app.get("/try-send")
async def try_send_endpoint(
    sender: Annotated[ClientId, Depends()],
    receiver: Annotated[ClientId, Depends()]
) -> None:
    """
    Attempt to start a file send from `sender` to `receiver`. 

    This GET request won't return success/failure information.
    This information will be available as the "status" inside
    the /ping response. The client that "tried send"ing will
    get a ping response of SEND once the receiver accepted
    their file or REJECTED once they rejected it.
    """

app.mount("/", StaticFiles(directory="static", html=True), name="static")
