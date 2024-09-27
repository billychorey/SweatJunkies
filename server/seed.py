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

    athlete3 = Athlete(
        first_name='Alice',
        last_name='Johnson',
        email='alice@example.com',
    )
    athlete3.set_password('password123')

    athlete4 = Athlete(
        first_name='Bob',
        last_name='Brown',
        email='bob@example.com',
    )
    athlete4.set_password('password123')

    athlete5 = Athlete(
        first_name='Charlie',
        last_name='Davis',
        email='charlie@example.com',
    )
    athlete5.set_password('password123')

    # Add athletes to the session
    db.session.add_all([athlete1, athlete2, athlete3, athlete4, athlete5])

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

    activity3 = Activity(
        description='Running',
        duration=45,
        date=date(2024, 9, 5),
        athlete=athlete3
    )

    activity4 = Activity(
        description='Yoga',
        duration=30,
        date=date(2024, 9, 6),
        athlete=athlete4
    )

    activity5 = Activity(
        description='Hiking',
        duration=120,
        date=date(2024, 9, 7),
        athlete=athlete5
    )

    # Add activities to the session
    db.session.add_all([activity1, activity2, activity3, activity4, activity5])

    # Create some races
    race1 = Race(
        race_name='5K Marathon',
        date=date(2024, 9, 5),
        distance=5.0,  # Distance in kilometers
        time='00:20:45',  # Time in HH:MM:SS format
        athlete=athlete1
    )

    race2 = Race(
        race_name='10K City Run',
        date=date(2024, 9, 6),
        distance=10.0,  # Distance in kilometers
        time='00:42:30',  # Time in HH:MM:SS format
        athlete=athlete2
    )

    race3 = Race(
        race_name='Half Marathon',
        date=date(2024, 9, 8),
        distance=21.097,  # Distance in kilometers
        time='01:45:00',  # Time in HH:MM:SS format
        athlete=athlete3
    )

    race4 = Race(
        race_name='Marathon',
        date=date(2024, 9, 9),
        distance=42.195,  # Distance in kilometers
        time='03:30:15',  # Time in HH:MM:SS format
        athlete=athlete4
    )

    race5 = Race(
        race_name='Trail Run',
        date=date(2024, 9, 10),
        distance=15.0,  # Distance in kilometers
        time='01:20:00',  # Time in HH:MM:SS format
        athlete=athlete5
    )

    # Add races to the session
    db.session.add_all([race1, race2, race3, race4, race5])

    # Commit the session
    db.session.commit()
    print('Database seeded successfully!')

# Create tables and seed data
if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Create all tables
        seed_data()  # Seed the database
