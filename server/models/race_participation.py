# models/race_participation.py
from config import db
from sqlalchemy_serializer import SerializerMixin

class RaceParticipation(db.Model, SerializerMixin):
    __tablename__ = 'race_participations'

    id = db.Column(db.Integer, primary_key=True)
    race_id = db.Column(db.Integer, db.ForeignKey('races.id', ondelete='CASCADE'), nullable=False)
    athlete_id = db.Column(db.Integer, db.ForeignKey('athletes.id', ondelete='CASCADE'), nullable=False)
    completion_time = db.Column(db.String(255), nullable=True)  # Store finish time for this athlete in this race

    # Relationships
    race = db.relationship('Race', back_populates='race_participations')
    athlete = db.relationship('Athlete', back_populates='race_participations')

    serialize_rules = ('-race.race_participations', '-athlete.race_participations')

    def to_dict(self):
        return {
            'completion_time': self.completion_time,
            'race_name': self.race.race_name if self.race else None,
            'athlete_name': f'{self.athlete.first_name} {self.athlete.last_name}' if self.athlete else None
        }
