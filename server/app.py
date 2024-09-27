from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from flask_restful import Api, Resource
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_bcrypt import Bcrypt
from config import db, app, serializer
from models import Athlete, Activity, Race, RaceParticipation
from utils.email_utils import send_reset_email
from datetime import datetime, timedelta
import os  # Added import for os

# JWT and Bcrypt initialization
jwt = JWTManager(app)
bcrypt = Bcrypt(app)

# Configure CORS to allow all methods and handle preflight OPTIONS request properly
CORS(app, resources={r"/*": {
    "origins": ["http://localhost:3000"],
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"],
    "supports_credentials": True
}})

# Set up database migration
migrate = Migrate(app, db)

# Initialize API
api = Api(app)

@app.before_request
def handle_options():
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        return response

# Handle CORS preflight requests globally
@app.after_request
def after_request(response):
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response

# Register route
@app.route('/api/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        response = jsonify({"status": "preflight check"})
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
        return response

    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    first_name = data.get('firstName')  # Match the frontend's 'firstName'
    last_name = data.get('lastName')  # Match the frontend's 'lastName'

    if Athlete.query.filter_by(email=email).first():
        return jsonify({"message": "Email already exists"}), 400

    new_athlete = Athlete(
        first_name=first_name,
        last_name=last_name,
        email=email,
    )
    new_athlete.set_password(password)
    db.session.add(new_athlete)
    db.session.commit()

    response = jsonify({"message": "User registered successfully"})
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
    return response, 201  # Include CORS headers in the response

# Login route
@app.route('/api/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        response = jsonify({"status": "preflight check"})
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
        return response

    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = Athlete.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "Email not found"}), 401  # Return specific message for email not found

    if not user.check_password(password):
        return jsonify({"message": "Incorrect password"}), 401  # Return specific message for incorrect password

    # Create an access token with a 1-day expiry
    access_token = create_access_token(identity={'email': user.email, 'id': user.id}, expires_delta=timedelta(days=1))
    return jsonify({"token": access_token, "user": user.to_dict()}), 200

# AthleteProfileResource
class AthleteProfileResource(Resource):
    @jwt_required()
    def get(self):
        current_user_email = get_jwt_identity()['email']
        athlete = Athlete.query.filter_by(email=current_user_email).first()

        if not athlete:
            return {'message': 'Athlete profile not found'}, 404

        return athlete.to_dict(), 200

    @jwt_required()
    def put(self):
        current_user_email = get_jwt_identity()['email']
        athlete = Athlete.query.filter_by(email=current_user_email).first()

        if not athlete:
            return {'message': 'Athlete profile not found'}, 404

        data = request.get_json()

        athlete.first_name = data.get('first_name', athlete.first_name)
        athlete.email = data.get('email', athlete.email)

        db.session.commit()

        return athlete.to_dict(), 200

    @jwt_required()
    def delete(self):
        current_user_email = get_jwt_identity()['email']
        athlete = Athlete.query.filter_by(email=current_user_email).first()

        if not athlete:
            return {'message': 'Athlete profile not found'}, 404

        db.session.delete(athlete)
        db.session.commit()

        return {'message': 'Athlete profile deleted'}, 200

# ActivityResource for managing activities
class ActivityResource(Resource):
    @jwt_required()
    def get(self):
        current_user_email = get_jwt_identity()['email']
        athlete = Athlete.query.filter_by(email=current_user_email).first()

        if not athlete:
            return {'message': 'Athlete not found'}, 404

        activities = Activity.query.filter_by(athlete_id=athlete.id).all()
        return [activity.to_dict() for activity in activities], 200

    @jwt_required()
    def post(self):
        current_user_email = get_jwt_identity()['email']
        athlete = Athlete.query.filter_by(email=current_user_email).first()

        if not athlete:
            return {'message': 'Athlete not found'}, 404

        data = request.get_json()
        
        # Convert date from string to datetime.date object
        try:
            date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        except ValueError:
            return {'message': 'Invalid date format. Use YYYY-MM-DD.'}, 400

        new_activity = Activity(
            description=data['description'],
            duration=data['duration'],
            date=date,
            athlete_id=athlete.id
        )
        
        db.session.add(new_activity)
        db.session.commit()
        return new_activity.to_dict(), 201

class RaceResource(Resource):
    @jwt_required()
    def get(self):
        # Get the current user's ID from JWT
        current_user = get_jwt_identity()
        athlete_id = current_user['id']  # Ensure your token includes the user's ID
        
        # Get races associated with this athlete through RaceParticipation
        races = db.session.query(Race).join(RaceParticipation).filter(RaceParticipation.athlete_id == athlete_id).all()
        
        return [race.to_dict() for race in races], 200

    @jwt_required()
    def post(self):
        data = request.get_json()

        # Convert date from string to datetime.date object
        try:
            date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        except ValueError:
            return {'message': 'Invalid date format. Use YYYY-MM-DD.'}, 400

        # Get the current user information from JWT
        current_user_email = get_jwt_identity()['email']
        athlete = Athlete.query.filter_by(email=current_user_email).first()

        if not athlete:
            return {'message': 'Athlete not found'}, 404

        # Create a new race entry
        new_race = Race(
            race_name=data['race_name'],
            date=date,
            distance=data['distance'],
            finish_time=data.get('finish_time')  # Include finish_time if provided in the request
        )

        db.session.add(new_race)
        db.session.commit()
        
        # Create RaceParticipation entry to link the athlete with the race
        race_participation = RaceParticipation(
            race_id=new_race.id,
            athlete_id=athlete.id,
            completion_time=data.get('completion_time')  # Include completion_time if provided in the request
        )

        db.session.add(race_participation)
        db.session.commit()

        return new_race.to_dict(), 201
# RaceParticipationResource for managing race participations
class RaceParticipationResource(Resource):
    @jwt_required()
    def get(self):
        # Get all race participations with race name and athlete name
        participations = RaceParticipation.query.all()

        result = [
            {
                'race_name': participation.race.race_name,
                'athlete_name': f'{participation.athlete.first_name} {participation.athlete.last_name}',
                'completion_time': participation.completion_time
            }
            for participation in participations
        ]

        return result, 200

# ForgotPasswordResource for handling password resets
class ForgotPasswordResource(Resource):
    def post(self):
        data = request.get_json()
        email = data.get('email')
        user = Athlete.query.filter_by(email=email).first()

        if not user:
            return {'message': 'Email not found'}, 404

        token = serializer.dumps(email, salt='password-reset-salt')
        reset_link = f'http://localhost:3000/reset-password?token={token}'
        send_reset_email(user.email, reset_link)
        
        return {'message': 'Password reset email sent'}, 200

class ResetPasswordResource(Resource):
    def post(self):
        data = request.get_json()
        token = data.get('token')
        new_password = data.get('new_password')

        try:
            email = serializer.loads(token, salt='password-reset-salt', max_age=3600)  # 1 hour expiry
        except Exception:
            return {'message': 'The reset link is invalid or has expired.'}, 400

        user = Athlete.query.filter_by(email=email).first()
        if not user:
            return {'message': 'User not found.'}, 404

        user.set_password(new_password)
        db.session.commit()
        return {'message': 'Your password has been updated!'}, 200

# Resource to list races with participants
class RacesWithParticipantsResource(Resource):
    def get(self):
        races = Race.query.all()
        response = []
        for race in races:
            participants = [f"{rp.athlete.first_name} {rp.athlete.last_name}" for rp in race.race_participations]
            race_info = {
                'id': race.id,
                'race_name': race.race_name,
                'date': race.date.strftime('%Y-%m-%d'),
                'distance': race.distance,  # Include other fields as needed
                'finish_time': race.finish_time,  # If you want to include finish time
                'participants': participants
            }
            response.append(race_info)
        return jsonify(response)

# Define your resource classes
class AthleteResource(Resource):
    def get(self):
        athletes = Athlete.query.all()
        return [athlete.to_dict() for athlete in athletes], 200

    def post(self):
        data = request.get_json()
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        email = data.get('email')
        password = data.get('password')
        # Removing fields like date_of_birth, gender, and profile_picture
        bio = data.get('bio', '')  # Default to an empty string if bio is not provided

        if Athlete.query.filter_by(email=email).first():
            return {'message': 'Email already exists'}, 400

        new_athlete = Athlete(
            first_name=first_name,
            last_name=last_name,
            email=email,
            bio=bio  # Include only fields that are necessary
        )
        new_athlete.set_password(password)
        db.session.add(new_athlete)
        db.session.commit()
        return new_athlete.to_dict(), 201

# Resource Mappings with /api prefix
api.add_resource(AthleteResource, '/api/athletes')  # CRUD operations for athletes
api.add_resource(ActivityResource, '/api/activities')  # CRUD operations for activities
api.add_resource(RaceResource, '/api/races')  # CRUD operations for races
api.add_resource(RaceParticipationResource, '/api/race_participations')  # CRUD operations for race participations
api.add_resource(ForgotPasswordResource, '/api/forgot-password')  # Endpoint for password reset request
api.add_resource(ResetPasswordResource, '/api/reset-password')  # Endpoint for resetting password
api.add_resource(AthleteProfileResource, '/api/athlete/profile')  # Athlete profile management
api.add_resource(RacesWithParticipantsResource, '/api/races_with_participants')  # Get races along with participant names


# Root route
@app.route('/')
def index():
    return '<h1>Project Server</h1>'

if __name__ == '__main__':
    with app.app_context():
        print("App context is active")
        db.create_all()
        app.run(port=5555, debug=True)
