import random
import re
from datetime import datetime
from flask import request, jsonify, make_response
from flask_restx import Resource, fields, Namespace
from flask_jwt_extended import get_jwt, jwt_required
from constans.http_status_code import (
    HTTP_200_OK,
    HTTP_201_CREATED,
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
    HTTP_409_CONFLICT,
)
from api.models import Smtp, db


sending_prolfile_ns = Namespace("sending_profile", description="Sending Profile management operations")


sending_prolfile_model = sending_prolfile_ns.model(
    "Smtp",
    {
        "id": fields.Integer(),
        "profile_name": fields.String(),
        "from_address": fields.String(),
        "host": fields.String(),
        "username": fields.String(),
        "password": fields.String(),
    },
)


def check_admin_permission():
    jwt = get_jwt()
    if jwt["role"] != "admin":
        return make_response(
            jsonify({"msg": "Permission denied"}), HTTP_400_BAD_REQUEST
        )


def validate_email(email):
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    if re.match(pattern, email):
        return True
    else:
        return False


def validate_smtp_address(smtp_address):
    pattern = r"^[a-zA-Z0-9.-]+\.[a-zA-Z0-9.-]+\:\d+$"
    if re.match(pattern, smtp_address):
        return True
    else:
        return False


def validate_strip(profile_name, name):
    if profile_name.strip() == "":
        return make_response(
            jsonify({"msg": f"No {name} provided"}), HTTP_400_BAD_REQUEST
        )

def validate_host(host):
    pattern = r'^smtp\.example\.com:(587|25)$'
    if re.match(pattern, host):
        return True
    
    # Check if host includes common email providers
    common_providers = ['gmail', 'live', 'office365']
    for provider in common_providers:
        if provider in host:
            return True
    
    return False


@sending_prolfile_ns.route("/")
class SmtpManagments(Resource):
    # Add smtp profile
    @jwt_required()
    @sending_prolfile_ns.expect(sending_prolfile_model)
    def post(self):
        # protect admin permisstion
        # permission_check = check_admin_permission()
        # if permission_check:
        #     return permission_check

        data = request.get_json()
        profile_name = data.get("profile_name")
        from_address = data.get("from_address")
        host = data.get("host")
        username = data.get("username")
        password = data.get("password")

        # validate empty fields
        validate_name = validate_strip(profile_name, "profile name")
        if validate_name:
            return validate_name

        validate_from = validate_strip(from_address, "from email address")
        if validate_from:
            return validate_from

        validate_host_em = validate_strip(host, "host")
        if validate_host_em:
            return validate_host_em

        validate_username = validate_strip(username, "username")
        if validate_username:
            return validate_username

        validate_password = validate_strip(password, "password")
        if validate_password:
            return validate_password
        
        validate_host_valid = validate_host(host)
        if not validate_host_valid:
            return make_response(
                jsonify({"msg": "Invalid host smtp address"}), HTTP_400_BAD_REQUEST
            )

        # validate format
        if not validate_email(from_address):
            return make_response(
                jsonify({"msg": "Invalid email address"}), HTTP_400_BAD_REQUEST
            )

        if not validate_smtp_address(host):
            return make_response(
                jsonify({"msg": "Invalid host smtp address"}), HTTP_400_BAD_REQUEST
            )

        if not validate_email(username):
            return make_response(
                jsonify({"msg": "Invalid username email address"}), HTTP_400_BAD_REQUEST
            )
        
        profile_id = random.randint(100, 10000)

        db_smtp_profile = db.session.query(Smtp).filter_by(name=profile_name).first()

        if db_smtp_profile is not None:
            if db_smtp_profile.smtp_id == profile_id:
                return make_response(
                    jsonify({"msg": "Profile name already taken"}), HTTP_409_CONFLICT
                )
            return make_response(
                jsonify({"msg": "Profile name already taken"}), HTTP_409_CONFLICT
            )

        new_smtp = Smtp(
            smtp_id = profile_id,
            name = profile_name,
            from_address = from_address,
            host = host,
            username = username,
            password = password,
        )
        db.session.add(new_smtp)
        db.session.commit()

        return make_response(
            jsonify({"msg": "Sending Profile created successfully "}), HTTP_201_CREATED
        )

    #Get all profiles
    @jwt_required()
    def get(self):
        # permission_check = check_admin_permission()
        # if permission_check:
        #     return permission_check

        db_smtp_profiles = db.session.query(Smtp).all()
        data = []
        for profiles in db_smtp_profiles:
            if profiles.modified_date:
                modified_date = profiles.modified_date.strftime('%Y-%m-%d')
            else:
                modified_date = None   
            data.append(
                {
                    "id": profiles.smtp_id,
                    "profile_name": profiles.name,
                    "from_address": profiles.from_address,
                    "host": profiles.host,
                    "username": profiles.username,
                    "password": profiles.password,
                    "modified_date": modified_date,
                }
            )
        
        return make_response(jsonify({"sending_profile": data}), HTTP_200_OK)
    
@sending_prolfile_ns.route("/<int:id>")
class SmtpManagment(Resource):
    
    #Delete smtp profile
    @jwt_required()
    @sending_prolfile_ns.expect(sending_prolfile_model)
    
    def delete(self, id):
        # permission_check = check_admin_permission()
        # if permission_check:
        #     return permission_check
        
        db_smtp_profile = db.session.query(Smtp).filter_by(smtp_id=id).first()
        
        if not db_smtp_profile:
            return make_response(
                jsonify({"msg": "Sending Profile not found"}), HTTP_404_NOT_FOUND
            )
            
        db.session.delete(db_smtp_profile)
        db.session.commit()
        
        return make_response(
            jsonify({"msg": "Sending Profile Deleted"}), HTTP_200_OK
        )
    
    #Update smtp profile
    @jwt_required()
    def put(self,id):
        # permission_check = check_admin_permission()
        # if permission_check:
        #     return permission_check
        
        data = request.get_json()
        
        pro_name = data.get("profile_name")
        from_address = data.get("from_address")
        host = data.get("host")
        username = data.get("username")
        password = data.get("password")
        
        # validate empty fields
        validate_name = validate_strip(pro_name, "profile name")
        if validate_name:
            return validate_name
        
        validate_host_valid = validate_host(host)
        if not validate_host_valid:
            return make_response(
                jsonify({"msg": "Invalid host smtp address"}), HTTP_400_BAD_REQUEST
            )

        if from_address.strip() == "" and host.strip() == "" and username.strip() == "" and password.strip() == "":
            db_profile = (
                db.session.query(Smtp).filter(Smtp.name == pro_name, Smtp.smtp_id != id).first()
            )
            if db_profile:
                return make_response(
                    jsonify({"msg": "Profile name already taken"}), HTTP_409_CONFLICT
                )
                
            current_datetime = datetime.now()
                
            db_pro = db.session.query(Smtp).filter_by(smtp_id = id).first()
            if not db_pro:
                return make_response(
                    jsonify({"msg": "Sending Profile not found"}), HTTP_404_NOT_FOUND
                )
                
            db_pro.name = pro_name
            db_pro.modified_date = current_datetime
            db.session.commit()
            return make_response(jsonify({"msg": "Profile Updated"}), HTTP_200_OK)
        
        
        validate_from = validate_strip(from_address, "from email address")
        if validate_from:
            return validate_from

        validate_host_em = validate_strip(host, "host")
        if validate_host_em:
            return validate_host_em

        validate_username = validate_strip(username, "username")
        if validate_username:
            return validate_username

        validate_password = validate_strip(password, "password")
        if validate_password:
            return validate_password
        
        # validate format
        if not validate_email(from_address):
            return make_response(
                jsonify({"msg": "Invalid email address"}), HTTP_400_BAD_REQUEST
            )

        if not validate_smtp_address(host):
            return make_response(
                jsonify({"msg": "Invalid host smtp address"}), HTTP_400_BAD_REQUEST
            )

        if not validate_email(username):
            return make_response(
                jsonify({"msg": "Invalid username email address"}), HTTP_400_BAD_REQUEST
            )
        
        db_smtp_profile = db.session.query(Smtp).filter_by(smtp_id = id).first()
        if not db_smtp_profile:
            return make_response(
                jsonify({"msg": "Sending Profile not found"}), HTTP_404_NOT_FOUND
            )
        db_usr = (
                db.session.query(Smtp).filter(Smtp.name == pro_name, Smtp.smtp_id != id).first()
            )
        if db_usr :
            return make_response(
                jsonify({"msg": "Profile name already taken"}), HTTP_409_CONFLICT
            )
        
        if not db_smtp_profile:
            return make_response(
                jsonify({"msg": "Sending Profile not found"}), HTTP_404_NOT_FOUND
            )
        current_datetime = datetime.now()
        
        db_smtp_profile.name = pro_name
        db_smtp_profile.from_address = from_address
        db_smtp_profile.host = host
        db_smtp_profile.username = username
        db_smtp_profile.password =  password
        db_smtp_profile.modified_date = current_datetime
        
        db.session.commit()
        
        return make_response(
            jsonify({"msg": "Sending Profile Updated"}), HTTP_200_OK
        )
            
        
        
    @jwt_required()
    def get(self,id):
        # permission_check = check_admin_permission()
        # if permission_check:


        db_smtp_profiles = db.session.query(Smtp).filter_by(smtp_id = id).first()
        data = []
        
        if not db_smtp_profiles:
            return make_response(
                jsonify({"msg": "Sending Profile not found"}), HTTP_404_NOT_FOUND
            )
            
        if db_smtp_profiles.modified_date:
            modified_date = db_smtp_profiles.modified_date.strftime('%Y-%m-%d')
        else:
            modified_date = None     
        
        data.append(
            {
                "id": db_smtp_profiles.smtp_id,
                "profile_name": db_smtp_profiles.name,
                "from_address": db_smtp_profiles.from_address,
                "host": db_smtp_profiles.host,
                "username": db_smtp_profiles.username,
                "password":  db_smtp_profiles.password,
                "modified_date": modified_date
            })
            
        return make_response(
            jsonify({"sending_profile": data}), HTTP_200_OK
        )