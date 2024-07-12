import re
from flask import request, jsonify ,make_response
from flask_restx import Resource ,fields, Namespace
from werkzeug.security import check_password_hash
from flask_jwt_extended import jwt_required, create_access_token, create_refresh_token, get_jwt, get_jwt_identity
from constans.http_status_code import HTTP_200_OK, HTTP_400_BAD_REQUEST, HTTP_500_INTERNAL_SERVER_ERROR

from api.models import User, db

#authentication Login and create token for User
auth_ns = Namespace("auth", description="Authentication operations")


login_model = auth_ns.model(
    "Login", 
    {
        "email": fields.String(),
        "password": fields.String()
    }
)
 


def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if re.match(pattern, email):
        return True
    else:
        return False


#Login
@auth_ns.route('/login')
class LoginResource(Resource):
    @auth_ns.expect(login_model)
    def post(self):
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not validate_email(email):
            return make_response(jsonify({"msg":"Invalid email address"}), HTTP_400_BAD_REQUEST)

        db_auth = db.session.query(User).filter_by(email=email).first()           

        if not db_auth:
            return make_response(jsonify({"msg":"Invalid email/password"}), HTTP_400_BAD_REQUEST) 

        isPasswordCorrect = check_password_hash(db_auth.password, password)
        if not isPasswordCorrect:
            return make_response(jsonify({"msg":"Invalid email/password"}), HTTP_400_BAD_REQUEST)
        user_email = db_auth.email
        role_permissions = db_auth.role.permissions
        permissions = [perm.perm_name for perm in role_permissions]
        user_id = db_auth.id
        role = db_auth.role.role_name
        
        access_token = create_access_token(identity = db_auth.id, additional_claims = {'user_id':user_id ,'user_email':user_email ,'role': role, 'permissions': permissions})
        refresh_token = create_refresh_token(identity = db_auth.id, additional_claims = {'user_id':user_id ,'user_email':user_email, 'role': role, 'permissions': permissions})
        
        return make_response(jsonify({"access_token":access_token,"refresh_token":refresh_token}), HTTP_200_OK)
            


@auth_ns.route('/token/refresh')
class RefreshResource(Resource):

    @jwt_required(refresh=True)
    def get(self):
        try:
            current_user = get_jwt_identity()

            current_token = get_jwt()
            role = current_token['role']
            permissions = current_token['permissions']
            user_id = current_token['user_id']
            user_email = current_token['user_email']
            

            new_access_token = create_access_token(identity = current_user, additional_claims = {'user_id':user_id ,'user_email':user_email, 'role': role, 'permissions':permissions})
            new_refresh_token = create_refresh_token(identity = current_user, additional_claims = {'user_id':user_id ,'user_email':user_email, 'role': role, 'permissions':permissions})

            return make_response(jsonify({"access_token": new_access_token, "refresh_token":new_refresh_token}), HTTP_200_OK)
        except Exception as e:
            return make_response(jsonify({"error": str(e)}), HTTP_500_INTERNAL_SERVER_ERROR)