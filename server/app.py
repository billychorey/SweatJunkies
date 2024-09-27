from dotenv import load_dotenv
load_dotenv()
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from flask_restful import Api, Resource
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_bcrypt import Bcrypt
from config import db, app, serializer
from models import Athlete, Activity, Race, RaceParticipation
from utils.email_utils import send_reset_email  # Ensure this utility is implemented
from datetime import datetime, timedelta
import os
import sendgrid
from sendgrid.helpers.mail import Mail

# JWT and Bcrypt initialization
jwt = JWTManager(app)
bcrypt = Bcrypt(app)

# Configure CORS
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

@app.after_request
def after_request(response):
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response

def send_welcome_email(user_email):
    sg = sendgrid.SendGridAPIClient(api_key=os.getenv('SENDGRID_API_KEY'))
    email_content = Mail(
        from_email='billychorey@gmail.com',
        to_emails=user_email,
        subject="Welcome to Sweat Junkies!",
        plain_text_content=f"Hi {user_email}, welcome to Sweat Junkies! We're glad to have you.",
        html_content=f"<strong>Hi {user_email}, welcome to Sweat Junkies! We're glad to have you.</strong>"
    )
    try:
        response = sg.send(email_content)
        print(f"Email sent to {user_email}, Status Code: {response.status_code}")
    except Exception as e:
        print(f"Error sending email: {str(e)}")

# Register route
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    first_name = data.get('firstName')
    last_name = data.get('lastName')

    # Check for required fields
    if not email or not password or not first_name or not last_name:
        return jsonify({"message": "Missing required fields"}), 400

    if Athlete.query.filter_by(email=email).first():
        return jsonify({"message": "Email already exists"}), 400

    # Proceed with creating new athlete
    new_athlete = Athlete(
        first_name=first_name,
        last_name=last_name,
        email=email,
    )
    new_athlete.set_password(password)
    db.session.add(new_athlete)
    db.session.commit()

    # Send welcome email after successful registration
    send_welcome_email(email)

    return jsonify({"message": "User registered successfully"}), 201

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
        current_user = get_jwt_identity()
        athlete_id = current_user['id']
        
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

        current_user_email = get_jwt_identity()['email']
        athlete = Athlete.query.filter_by(email=current_user_email).first()

        if not athlete:
            return {'message': 'Athlete not found'}, 404

        new_race = Race(
            race_name=data['race_name'],
            date=date,
            distance=data['distance'],
            finish_time=data.get('finish_time')
        )

        db.session.add(new_race)
        db.session.commit()

        race_participation = RaceParticipation(
            race_id=new_race.id,
            athlete_id=athlete.id,
            completion_time=data.get('completion_time')
        )

        db.session.add(race_participation)
        db.session.commit()

        return new_race.to_dict(), 201

# UserRacesResource
class UserRacesResource(Resource):
    @jwt_required()
    def get(self):
        current_user = get_jwt_identity()
        athlete_id = current_user['id']
        races = db.session.query(Race).join(RaceParticipation).filter(RaceParticipation.athlete_id == athlete_id).all()
        return [race.to_dict() for race in races], 200

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
                'distance': race.distance,
                'finish_time': race.finish_time,
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
    
class RaceParticipationResource(Resource):
    @jwt_required()
    def get(self):
        current_user = get_jwt_identity()
        athlete_id = current_user['id']

        participations = RaceParticipation.query.filter_by(athlete_id=athlete_id).all()
        
        return [participation.to_dict() for participation in participations], 200

    @jwt_required()
    def post(self):
        # Implement post method to add race participation
        pass

    @jwt_required()
    def delete(self):
        # Implement delete method for race participation
        pass


# Resource Mappings with /api prefix
api.add_resource(AthleteResource, '/api/athletes')  # CRUD operations for athletes
api.add_resource(ActivityResource, '/api/activities')  # CRUD operations for activities
api.add_resource(RaceResource, '/api/races')  # CRUD operations for races
api.add_resource(RaceParticipationResource, '/api/race_participations')  # CRUD operations for race participations
api.add_resource(ForgotPasswordResource, '/api/forgot-password')  # Endpoint for password reset request
api.add_resource(ResetPasswordResource, '/api/reset-password')  # Endpoint for resetting password
api.add_resource(AthleteProfileResource, '/api/athlete/profile')  # Athlete profile management
api.add_resource(RacesWithParticipantsResource, '/api/races_with_participants')  # Get races along with participant names
api.add_resource(UserRacesResource, '/api/user_races')  # User's specific races

# Root route
@app.route('/')
def index():
    return '<h1>Project Server</h1>'

if __name__ == '__main__':
    with app.app_context():
        print("App context is active")
        db.create_all()
        app.run(port=5555, debug=True)
