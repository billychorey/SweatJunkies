# models/__init__.py
from config import db  
from .athlete import Athlete
from .activity import Activity
from .race import Race
from .race_participation import RaceParticipation

__all__ = ['db', 'Athlete', 'Activity', 'Race', 'RaceParticipation']
