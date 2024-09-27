from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from flask_restful import Api, Resource
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_bcrypt import Bcrypt
from config import db, app, serializer
from models import Athlete, Activity, Race
from utils.email_utils import send_reset_email
from datetime import datetime

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

    access_token = create_access_token(identity={'email': user.email, 'id': user.id})
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
        athlete.last_name = data.get('last_name', athlete.last_name)
        athlete.date_of_birth = data.get('date_of_birth', athlete.date_of_birth)
        athlete.gender = data.get('gender', athlete.gender)
        athlete.profile_picture = data.get('profile_picture', athlete.profile_picture)
        athlete.bio = data.get('bio', athlete.bio)

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

# RaceResource with authentication
from datetime import datetime

class RaceResource(Resource):
    @jwt_required()
    def get(self):
        current_user_email = get_jwt_identity()['email']
        athlete = Athlete.query.filter_by(email=current_user_email).first()

        if not athlete:
            return {'message': 'Athlete not found'}, 404

        races = Race.query.filter_by(athlete_id=athlete.id).all()
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
            time=data['time'],
            athlete_id=athlete.id
        )

        db.session.add(new_race)
        db.session.commit()
        return new_race.to_dict(), 201

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

# Resource Mappings with /api prefix
api.add_resource(AthleteResource, '/api/athletes')
api.add_resource(ActivityResource, '/api/activities')
api.add_resource(RaceResource, '/api/races') 
api.add_resource(ForgotPasswordResource, '/api/forgot-password') 
api.add_resource(ResetPasswordResource, '/api/reset-password') 
api.add_resource(AthleteProfileResource, '/api/athlete/profile')

# Root route
@app.route('/')
def index():
    return '<h1>Project Server</h1>'

if __name__ == '__main__':
    with app.app_context():
        print("App context is active")
        db.create_all()
        app.run(port=5555, debug=True)
