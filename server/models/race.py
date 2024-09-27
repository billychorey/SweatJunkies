# models/race.py

from config import db
from sqlalchemy_serializer import SerializerMixin

class Race(db.Model, SerializerMixin):
    __tablename__ = 'races'

    id = db.Column(db.Integer, primary_key=True)
    race_name = db.Column(db.String(255), nullable=False)  # Race name/title
    date = db.Column(db.Date, nullable=False)  # Date of the race
    result = db.Column(db.String(255), nullable=True)  # Result or finish time
    athlete_id = db.Column(db.Integer, db.ForeignKey('athletes.id', ondelete='CASCADE'), nullable=False)  # Athlete reference

    # Relationship with the Athlete model
    athlete = db.relationship('Athlete', back_populates='races')

    # Serialization rules to avoid circular references
    serialize_rules = ('-athlete.races',)

    # Convert the object to a dictionary
    def to_dict(self):
        return {
            'id': self.id,
            'race_name': self.race_name,
            'date': self.date.strftime('%Y-%m-%d'),  # Format date as string
            'result': self.result,
            'athlete_id': self.athlete_id,
            'athlete_name': f'{self.athlete.first_name} {self.athlete.last_name}' if self.athlete else None  # Include athlete's full name
        }
