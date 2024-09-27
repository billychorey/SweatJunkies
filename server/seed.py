# seed.py

from datetime import date
from config import db, app
from models.athlete import Athlete
from models.activity import Activity
from models.race import Race
from werkzeug.security import generate_password_hash

# Function to seed the database
def seed_data():
    # Create some athletes
    athlete1 = Athlete(
        first_name='John',
        last_name='Doe',
        email='john@example.com',
    )
    athlete1.set_password('password123')

    athlete2 = Athlete(
        first_name='Jane',
        last_name='Smith',
        email='jane@example.com',
    )
    athlete2.set_password('password123')

    # Add athletes to the session
    db.session.add(athlete1)
    db.session.add(athlete2)

    # Create some activities
    activity1 = Activity(
        description='Swimming',
        duration=60,
        date=date(2024, 9, 3),
        athlete=athlete1
    )

    activity2 = Activity(
        description='Cycling',
        duration=90,
        date=date(2024, 9, 4),
        athlete=athlete2
    )

    # Create some races
    race1 = Race(
        race_name='5K Marathon',
        date=date(2024, 9, 5),
        result='20:45',
        athlete=athlete1
    )

    race2 = Race(
        race_name='10K City Run',
        date=date(2024, 9, 6),
        result='42:30',
        athlete=athlete2
    )

    # Add all to the session
    db.session.add(activity1)
    db.session.add(activity2)
    db.session.add(race1)
    db.session.add(race2)

    # Commit the session
    db.session.commit()
    print('Database seeded successfully!')

# Create tables and seed data
if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Create all tables
        seed_data()  # Seed the database
