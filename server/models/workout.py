# models/workout.py

from config import db
from sqlalchemy_serializer import SerializerMixin

class Workout(db.Model, SerializerMixin):
    __tablename__ = 'workouts'

    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(255), nullable=False)  # Workout description
    duration = db.Column(db.Integer, nullable=False)  # Duration in minutes
    date = db.Column(db.Date, nullable=False)  # Date of the workout
    athlete_id = db.Column(db.Integer, db.ForeignKey('athletes.id', ondelete='CASCADE'), nullable=False)  # Athlete reference

    # Relationship with the Athlete model
    athlete = db.relationship('Athlete', back_populates='workouts')

    # Serialization rules to avoid circular references
    serialize_rules = ('-athlete.workouts',)

    # Convert the object to a dictionary
    def to_dict(self):
        return {
            'id': self.id,
            'description': self.description,
            'duration': self.duration,
            'date': self.date.strftime('%Y-%m-%d'),  # Format date as string
            'athlete_id': self.athlete_id,
            'athlete_name': f'{self.athlete.first_name} {self.athlete.last_name}' if self.athlete else None  # Include athlete's full name
        }
