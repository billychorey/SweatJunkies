# models/race.py
from config import db
from sqlalchemy_serializer import SerializerMixin

class Race(db.Model, SerializerMixin):
    __tablename__ = 'races'

    id = db.Column(db.Integer, primary_key=True)
    race_name = db.Column(db.String(255), nullable=False)
    date = db.Column(db.Date, nullable=False)
    distance = db.Column(db.String(255), nullable=False)  # Distance of the race
    finish_time = db.Column(db.String(255), nullable=True)  # Finish time of the race

    # Many-to-Many Relationship with Athletes through RaceParticipation
    race_participations = db.relationship('RaceParticipation', back_populates='race', cascade='all, delete-orphan')

    # Serialization rules to avoid circular references
    serialize_rules = ('-race_participations.race',)

    # Convert the object to a dictionary
    def to_dict(self):
        return {
            'id': self.id,
            'race_name': self.race_name,
            'date': self.date.strftime('%Y-%m-%d'),  # Format date as string
            'distance': self.distance,
            'finish_time': self.finish_time  # Updated to reflect the new column name
        }
