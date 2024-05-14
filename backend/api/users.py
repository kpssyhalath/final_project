import uuid
import re
from flask import request, jsonify, make_response
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import get_jwt, jwt_required
from flask_restx import Resource, fields, Namespace
from constans.http_status_code import (
    HTTP_200_OK,
    HTTP_201_CREATED,
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
    HTTP_409_CONFLICT,
)
from api.models import User, db

user_ns = Namespace("user", description="User management operations")


signup_model = user_ns.model(
    "SignUp",
    {
        "email": fields.String(),
        "password": fields.String(),
        "confirm_password": fields.String(),
    },
)


user_model = user_ns.model(
    "User",
    {
        "email": fields.String(),
        "old_password": fields.String(),
        "new_password": fields.String(),
        "confirm_password": fields.String(),
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


min_password_length = 8

def checkPasswordPolicy(password):
    if password is None:
        return make_response(
            jsonify({"msg": "No password provided"}), HTTP_400_BAD_REQUEST
        )
    if len(password) < min_password_length:
        return make_response(
            jsonify(
                {
                    "msg": "Passwords must be at least {0} characters".format(
                        min_password_length
                    )
                }
            ),
            HTTP_400_BAD_REQUEST,
        )
    return None


# check hash password
def validatePasswordChange(currentHash, newPassword, confirmPassword):
    checkPassword = checkPasswordPolicy(newPassword)
    reuse_password = check_password_hash(currentHash, newPassword)
    if checkPassword:
        return checkPassword
    if newPassword != confirmPassword:
        return make_response(
            jsonify({"msg": "Passwords do not match"}), HTTP_400_BAD_REQUEST
        )
    if reuse_password:
        return make_response(
            jsonify({"msg": "Can not reuse existing password"}), HTTP_409_CONFLICT
        )
    return None


# Admin management user
@user_ns.route("/")
class UserManagements(Resource):

    # Add user
    @jwt_required()
    @user_ns.expect(signup_model)
    def post(self):
        # protect admin permisstion
        permission_check = check_admin_permission()
        if permission_check:
            return permission_check

        data = request.get_json()
        email = data.get("email")
        password = data.get("password")
        confirm_password = data.get("confirm_password")

        user_id = str(uuid.uuid4())

        if email.strip() == "":
            return make_response(
                jsonify({"msg": "No email provided"}), HTTP_400_BAD_REQUEST
            )

        if not validate_email(email):
            return make_response(
                jsonify({"msg": "Invalid email address"}), HTTP_400_BAD_REQUEST
            )

        checkpass = checkPasswordPolicy(password=password)
        if checkpass is not None:
            return checkpass

        if password != confirm_password:
            return make_response(
                jsonify({"msg": "Passwords do not match"}), HTTP_400_BAD_REQUEST
            )

        db_user = db.session.query(User).filter_by(email=email).first()

        if db_user is not None:
            if db_user.id == user_id:
                return make_response(
                    jsonify({"msg": "Email already taken"}), HTTP_409_CONFLICT
                )
            return make_response(
                jsonify({"msg": "Email already taken"}), HTTP_409_CONFLICT
            )
        hash_password = generate_password_hash(password=password)

        new_user = User(id=user_id, email=email, password=hash_password, role_id=2)
        db.session.add(new_user)
        db.session.commit()

        return make_response(
            jsonify({"msg": "User Created"}), HTTP_201_CREATED
        )

    # Get all users
    @jwt_required()
    def get(self):
        permission_check = check_admin_permission()
        if permission_check:
            return permission_check

        db_users = db.session.query(User).all()
        data = []
        for user in db_users:
            data.append(
                {"id": user.id, "email": user.email, "role": user.role.role_name}
            )
        return make_response(jsonify({"user": data}))


@user_ns.route("/management/<uuid:id>")
class UserManagement(Resource):
    # Delete user
    @jwt_required()
    def delete(self, id):

        permission_check = check_admin_permission()
        if permission_check:
            return permission_check

        db_userid = db.session.query(User).filter_by(id=id).first()

        if not db_userid:
            return make_response(jsonify({"msg": "User not found"}), HTTP_404_NOT_FOUND)

        db.session.delete(db_userid)
        db.session.commit()

        return make_response(jsonify({"msg": "User Deleted"}), HTTP_200_OK)

    # Edit user
    @jwt_required()
    def put(self, id):
        permission_check = check_admin_permission()
        if permission_check:
            return permission_check

        data = request.get_json()

        email = data.get("email")
        new_password = data.get("password")
        confirm_password = data.get("confirm_password")

        if email.strip() == "":
            return make_response(
                jsonify({"msg": "No email provided"}), HTTP_400_BAD_REQUEST
            )

        check_password_policy = checkPasswordPolicy(password=new_password)
        if check_password_policy is not None:
            return check_password_policy

        db_user = db.session.query(User).filter_by(id=id).first()

        # Validate
        validatePass = validatePasswordChange(
            currentHash=db_user.password,
            newPassword=new_password,
            confirmPassword=confirm_password,
        )
        if validatePass is not None:
            return validatePass

        hash_password = generate_password_hash(new_password)
        db_user.email = email
        db_user.password = hash_password
        db.session.commit()

        return make_response(jsonify({"msg": "User Updated"}), HTTP_200_OK)


# User managements Setting
@user_ns.route("/setting/<uuid:id>")
class UserSetting(Resource):
    # User Settings

    @jwt_required()
    @user_ns.expect(user_model)
    def put(self, id):

        data = request.get_json()

        email = data.get("email")
        old_password = data.get("old_password")
        new_password = data.get("new_password")
        confirm_password = data.get("confirm_password")

        db_user = db.session.query(User).filter_by(id=id).first()

        if email is None or email != db_user.email:
            return make_response(
                jsonify({"msg": "Email do not match"}), HTTP_400_BAD_REQUEST
            )
        
        if not db_user:
            return make_response(jsonify({"msg": "User not found"}), HTTP_404_NOT_FOUND)

        check_old_pass_policy = checkPasswordPolicy(old_password)
        if check_old_pass_policy is not None:
            return check_old_pass_policy

        validate_oldpassword = check_password_hash(db_user.password, old_password)
        if validate_oldpassword is False:
            return make_response(
                jsonify({"msg": "Incorrect old password"}), HTTP_400_BAD_REQUEST
            )

        validate_pass = validatePasswordChange(
            currentHash=db_user.password,
            newPassword=new_password,
            confirmPassword=confirm_password,
        )
        if validate_pass:
            return validate_pass

        hash_password = generate_password_hash(new_password)

        db_user.password = hash_password
        db.session.commit()
        return make_response(jsonify({"msg": "User Updated"}), HTTP_200_OK)
