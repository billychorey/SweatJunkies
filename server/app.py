# server/app.py
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from flask_restful import Api, Resource
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, create_access_token
from flask_bcrypt import Bcrypt
from config import db, app, serializer  # Import your config and serializer
from models import Athlete, Workout, Activity, Race  # Import your models
from utils.email_utils import send_reset_email  # Import your email utility

# JWT and Bcrypt initialization
jwt = JWTManager(app)
bcrypt = Bcrypt(app)

# Configure CORS to allow all methods and handle preflight OPTIONS request properly
CORS(app, resources={r"/*": {"origins": "http://localhost:3000", "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"], "allow_headers": ["Content-Type", "Authorization"]}})

# Set up database migration
migrate = Migrate(app, db)

# Initialize API
api = Api(app)

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
    first_name = data.get('firstName')
    last_name = data.get('lastName')

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
    if not user or not user.check_password(password):
        return jsonify({"message": "Invalid email or password"}), 401

    access_token = create_access_token(identity={'email': user.email})
    return jsonify({"token": access_token, "user": user.to_dict()}), 200


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
        date_of_birth = data.get('date_of_birth')
        gender = data.get('gender')
        profile_picture = data.get('profile_picture')
        bio = data.get('bio')

        if Athlete.query.filter_by(email=email).first():
            return {'message': 'Email already exists'}, 400

        new_athlete = Athlete(
            first_name=first_name,
            last_name=last_name,
            email=email,
            date_of_birth=date_of_birth,
            gender=gender,
            profile_picture=profile_picture,
            bio=bio
        )
        new_athlete.set_password(password)
        db.session.add(new_athlete)
        db.session.commit()
        return new_athlete.to_dict(), 201

# Similar structure for other resources...
class WorkoutResource(Resource):
    def get(self):
        workouts = Workout.query.all()
        return [workout.to_dict() for workout in workouts], 200

    def post(self):
        data = request.get_json()
        new_workout = Workout(**data)  # Assuming data keys match model attributes
        db.session.add(new_workout)
        db.session.commit()
        return new_workout.to_dict(), 201

class ActivityResource(Resource):
    def get(self):
        activities = Activity.query.all()
        return [activity.to_dict() for activity in activities], 200

    def post(self):
        data = request.get_json()
        new_activity = Activity(**data)
        db.session.add(new_activity)
        db.session.commit()
        return new_activity.to_dict(), 201

class RaceResource(Resource):
    def get(self):
        races = Race.query.all()
        return [race.to_dict() for race in races], 200

    def post(self):
        data = request.get_json()
        new_race = Race(**data)
        db.session.add(new_race)
        db.session.commit()
        return new_race.to_dict(), 201

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

# Resource Mappings
api.add_resource(AthleteResource, '/athletes')
api.add_resource(WorkoutResource, '/workouts')
api.add_resource(ActivityResource, '/activities')
api.add_resource(RaceResource, '/races')
api.add_resource(ForgotPasswordResource, '/forgot-password')
api.add_resource(ResetPasswordResource, '/reset-password')

# Root route
@app.route('/')
def index():
    return '<h1>Project Server</h1>'

if __name__ == '__main__':
    with app.app_context():
        print("App context is active")
        db.create_all()
        app.run(port=5555, debug=True)
