from datetime import date
from config import db, app
from models import Athlete, Activity, Race, RaceParticipation
from faker import Faker

fake = Faker()

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

    # Create some races with the updated `finish_time` field
    race1 = Race(
        race_name='5K Marathon',
        date=date(2024, 9, 5),
        distance='5.0 km',  # Use a string format for distance
        finish_time='00:20:45'  # Updated field name
    )

    race2 = Race(
        race_name='10K City Run',
        date=date(2024, 9, 6),
        distance='10.0 km',  # Use a string format for distance
        finish_time='00:42:30'  # Updated field name
    )

    race3 = Race(
        race_name='Half Marathon',
        date=date(2024, 9, 8),
        distance='21.097 km',  # Use a string format for distance
        finish_time='01:45:00'  # Updated field name
    )

    race4 = Race(
        race_name='Marathon',
        date=date(2024, 9, 9),
        distance='42.195 km',  # Use a string format for distance
        finish_time='03:30:15'  # Updated field name
    )

    race5 = Race(
        race_name='Trail Run',
        date=date(2024, 9, 10),
        distance='15.0 km',  # Use a string format for distance
        finish_time='01:20:00'  # Updated field name
    )

    # Add races to the session
    db.session.add_all([race1, race2, race3, race4, race5])

    # Commit the session before creating race participations
    db.session.commit()

    # Create race participations to link athletes with races
    race_participation1 = RaceParticipation(
        race_id=race1.id, 
        athlete_id=athlete1.id,
        completion_time='00:25:00'
    )
    race_participation2 = RaceParticipation(
        race_id=race2.id, 
        athlete_id=athlete2.id,
        completion_time='00:45:00'
    )
    race_participation3 = RaceParticipation(
        race_id=race3.id, 
        athlete_id=athlete3.id,
        completion_time='01:30:00'
    )

    # Add race participations to the session
    db.session.add_all([race_participation1, race_participation2, race_participation3])

    # Commit the session for race participations
    db.session.commit()
    print('Database seeded successfully!')

# Create tables and seed data
if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Create all tables
        seed_data()  # Seed the database
