# models/activity.py
from config import db
from sqlalchemy_serializer import SerializerMixin

class Activity(db.Model, SerializerMixin):
    __tablename__ = 'activities'

    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(255), nullable=False)
    duration = db.Column(db.Integer, nullable=False)  # Duration in minutes
    date = db.Column(db.Date, nullable=False)
    athlete_id = db.Column(db.Integer, db.ForeignKey('athletes.id', ondelete='CASCADE'), nullable=False)

    # Relationship with Athlete model
    athlete = db.relationship('Athlete', back_populates='activities')

    # Serialization rules to prevent circular references
    serialize_rules = ('-athlete.activities',)

    # Include athlete's name in the serialized activity data
    def to_dict(self):
        return {
            'id': self.id,
            'description': self.description,
            'duration': self.duration,
            'date': self.date.strftime('%Y-%m-%d'),  # Format date as string
            'athlete_id': self.athlete_id,
            'athlete_name': self.athlete.first_name + ' ' + self.athlete.last_name  # Include athlete's full name
        }
