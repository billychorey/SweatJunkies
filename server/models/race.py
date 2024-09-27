# models/race.py

from config import db
from sqlalchemy_serializer import SerializerMixin

class Race(db.Model, SerializerMixin):
    __tablename__ = 'races'
    id = db.Column(db.Integer, primary_key=True)
    race_name = db.Column(db.String(255), nullable=False)
    date = db.Column(db.Date, nullable=False)
    distance = db.Column(db.Float, nullable=False, default=0.0)  # Check default value and nullability
    time = db.Column(db.String(255))  
    athlete_id = db.Column(db.Integer, db.ForeignKey('athletes.id'), nullable=False)

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
            'distance': self.distance,
            'time': self.time,
            'athlete_id': self.athlete_id,
            'athlete_name': f'{self.athlete.first_name} {self.athlete.last_name}' if self.athlete else None  # Include athlete's full name
        }
