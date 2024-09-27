# models/athlete.py

from config import db
from sqlalchemy_serializer import SerializerMixin
from werkzeug.security import generate_password_hash, check_password_hash

class Athlete(db.Model, SerializerMixin):
    __tablename__ = 'athletes'

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

    # Relationships
    activities = db.relationship('Activity', back_populates='athlete', cascade='all, delete-orphan')
    races = db.relationship('Race', back_populates='athlete', cascade='all, delete-orphan')

    # Password management methods
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    # Include a list of related workout descriptions in the serialized athlete data
    def to_dict(self):
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'email': self.email,
            'activities': [activity.to_dict() for activity in self.activities],
            'races': [race.to_dict() for race in self.races]
        }
