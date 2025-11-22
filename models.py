from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class EventCreation(BaseModel):
    title: str              #Isar Grillen
    description: str        #Bringt Bier mit!
    category: str           #"Party" "Freunde finden"
    date: datetime
    location_name: str      #"Isar"
    lat: float              #Breitengrad
    lng: float              #Längengrad
    creator_name: str       #Max Mustermann

