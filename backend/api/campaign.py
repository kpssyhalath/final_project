import random
import os
from pathlib import Path
from datetime import datetime
from flask import request, jsonify, make_response
from flask_restx import Resource, fields, Namespace
from flask_jwt_extended import get_jwt, jwt_required

from api.models import db, Group, User, Smtp, Template, Page, Campaign, Result
from utils.mail_sender import send_emails
from utils.xlsx import create_excel_file
from utils.file_path_excel import file_path_excel, update_excel_file

from constans.http_status_code import (
    HTTP_200_OK,
    HTTP_201_CREATED,
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
    HTTP_409_CONFLICT,
    HTTP_500_INTERNAL_SERVER_ERROR,
)

campaign_ns = Namespace("campaign", description="Campaign management operations")

campaign_model = campaign_ns.model(
    "Template",
    {
        "cam_id": fields.Integer(),
        "cam_name": fields.String(),
        "status": fields.String(),
        "created_date": fields.DateTime(),
        "completed_date": fields.DateTime(),
        "launch_date": fields.DateTime(),
        "send_data": fields.DateTime(),
        "user_id": fields.Integer(),
        "group_id": fields.Integer(),
        "page_id": fields.Integer(),
        "temp_id": fields.Integer(),
        "smtp_id": fields.Integer(),
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


@campaign_ns.route("/")
class CampaignManagments(Resource):

    @jwt_required()
    @campaign_ns.expect(campaign_model)
    def post(self):
        # permission_check = check_admin_permission()
        # if permission_check:
        #     return permission_check

        data = request.get_json()
        cam_name = data.get("cam_name")
        # status = data.get("status")
        user_id = data.get(
            "user_id"
        )               # user belong to (not mean that user create this campaign)
        group_id = data.get("group_id")
        page_id = data.get("page_id")
        temp_id = data.get("temp_id")
        smtp_id = data.get("smtp_id")
        completed_date = data.get("completed_date")

        # validate empty fields

        validate_user = validate_strip(user_id, "user belong")
        if validate_user:
            return validate_user

        validate_completed = validate_strip(completed_date, "completed date")
        if validate_completed:
            return validate_completed

        validate_name = validate_strip(cam_name, "campaign name")
        if validate_name:
            return validate_name
        
        db_campaign = db.session.query(Campaign).filter_by(cam_name = cam_name).first()
        if db_campaign:
            return make_response(
                jsonify({"msg": "Campaign name already taken"}), HTTP_409_CONFLICT
            )
        try:
            db_User = db.session.query(User).filter_by(id=user_id).first()
            user_belongs_to = db_User.email

            db_group = db.session.query(Group).filter_by(id=group_id).first()
            targets = []
            group_name = db_group.groupname
            for target in db_group.target:
                targets.append(
                    {
                        "email": target.email,
                        "user_id": target.id,
                        "first_name": target.firstname,
                        "last_name": target.lastname,
                    }
                )

            db_page = db.session.query(Page).filter_by(page_id=page_id).first()
            page_path = db_page.path

            db_template = db.session.query(Template).filter_by(temp_id=temp_id).first()
            subject = db_template.temp_subject
            text = db_template.temp_text
            html = db_template.temp_html
            if not text:
                email_template = html
            else:
                email_template = text

            db_smtp = db.session.query(Smtp).filter_by(smtp_id=smtp_id).first()
            smtp_username = db_smtp.username
            smtp_password = db_smtp.password
            smtp_sender = db_smtp.from_address
            smtp_host, smtp_port = (db_smtp.host).split(":")

            current_date = datetime.now()
            cam_id = random.randint(100, 10000)

            # total target
            total_targets = len(targets)
            status_result = f"{total_targets} | 0 | 0 | 0 | 0 | 0 "

            new_campaign = Campaign(
                cam_id=cam_id,
                cam_name=cam_name,
                status="In Progress",
                user_id=user_id,
                group_id=group_id,
                page_id=page_id,
                temp_id=temp_id,
                smtp_id=smtp_id,
                launch_date=current_date,
                completed_date=completed_date,
                created_date=current_date,
                send_data=current_date,
            )
            new_resualt = Result(
                email = user_belongs_to, cam_id=cam_id, status=status_result
            )

            db.session.add(new_resualt)
            db.session.add(new_campaign)
            db.session.commit()
            db_group.cam_id = cam_id
            db.session.commit()

            file_path = file_path_excel(cam_name)

            create_excel_file(file_path, targets, user_belongs_to, cam_name)
            send_emails(
                subject,
                smtp_sender,
                smtp_password,
                smtp_host,
                smtp_port,
                targets,
                email_template,
                file_path,
            )

            return make_response(
                jsonify({"msg": "Campaign created successfully "}), HTTP_201_CREATED
            )
        except Exception as e:
            db.session.rollback()
            print(f"Error creating campaign: {e}")
            return make_response(
                jsonify({"msg": "Error creating campaign", "error": str(e)}), HTTP_500_INTERNAL_SERVER_ERROR
            )

    @jwt_required()
    def get(self):
        # permission_check = check_admin_permission()
        # if permission_check:
        #     return permission_check

        db_campaign = db.session.query(Campaign).all()
        data = []
        for campaign in db_campaign:
            if campaign.launch_date:
                launch_date = campaign.launch_date.strftime("%Y-%m-%d")
            else:
                launch_date = None
            data.append(
                {
                    "cam_id": campaign.cam_id,
                    "cam_name": campaign.cam_name,
                    "launch_date": launch_date,
                    "status": campaign.status,
                }
            )

        return make_response(jsonify({"campaign": data}), HTTP_200_OK)


@campaign_ns.route("/<int:id>")
class CampaignManagment(Resource):
    @jwt_required()

    def delete(self, id):
        # permission_check = check_admin_permission()
        # if permission_check:
        #     return permission_check

        db_campaign = db.session.query(Campaign).filter_by(cam_id=id).first()
        if not db_campaign:
            return make_response(
                jsonify({"msg": "Campaign not found"}), HTTP_404_NOT_FOUND
            )

        cam_name = db_campaign.cam_name

        if db_campaign.group:
            db_campaign.group.cam_id = None
        db.session.commit()

        db.session.delete(db_campaign)
        db.session.commit()

        base_dir = Path(__file__).resolve().parent.parent
        file_path = base_dir / "result" / f"{cam_name}_result.xlsx"
        try:
            os.remove(file_path)
        except FileNotFoundError:
            pass


        return make_response(
            jsonify({"msg": "Campaign deleted successfully "}), HTTP_200_OK
        )


@campaign_ns.route("/user/<uuid:uid>")
class CampaignManagment(Resource):

    @jwt_required()
    def get(self, uid):
        
        db_campaigns = db.session.query(Campaign).filter_by(user_id = uid).all()
        data = []

        if not db_campaigns:
            return make_response(jsonify({"message": "No campaigns found for this user_id"}), 404)

        for db_campaign in db_campaigns:
            if db_campaign.launch_date:
                launch_date = db_campaign.launch_date.strftime("%Y-%m-%d")
            else:
                launch_date = None
            data.append(
                {
                    "cam_id": db_campaign.cam_id,
                    "cam_name": db_campaign.cam_name,
                    "launch_date": launch_date,
                    "status": db_campaign.status,
                }
            )

        return make_response(jsonify({"campaign": data}), HTTP_200_OK)


@campaign_ns.route("/dashboard/")
class DashboardCampaign(Resource):
    @jwt_required()
    
    def get(self):
        db_campaign = db.session.query(Campaign).all()
        data = []

        for campaign in db_campaign:
            for result in campaign.results:
                status = result.status
                status_list = [int(num.strip()) for num in status.split("|")]

                if result.modified_date:
                    modified_date = result.modified_date.strftime("%Y-%m-%d")
                else:
                    modified_date = None

                data.append(
                    {
                        "cam_name": campaign.cam_name,
                        "cam_id": result.cam_id,
                        "email": result.email,
                        "status": {
                            "total": status_list[0],
                            "send_mail": status_list[1],
                            "open": status_list[2],
                            "click": status_list[3],
                            "submit": status_list[4],
                            "error": status_list[5],
                        },
                        "modified_date": modified_date,
                        "create_date": campaign.created_date.strftime("%Y-%m-%d"),
                        "full_create_date_time": campaign.created_date,
                        "completed_date": campaign.completed_date.strftime("%Y-%m-%d"),
                        
                    }
                )

        return make_response(jsonify({"result": data}), HTTP_200_OK)

@campaign_ns.route("/dashboard/<uuid:uid>")
class DashboardCampaign(Resource):
    @jwt_required()
    
    def get(self, uid):
        db_campaign = db.session.query(Campaign).filter_by(user_id = uid).all()
        data = []
        
        for campaign in db_campaign:
            for result in campaign.results:
                status = result.status
                status_list = [int(num.strip()) for num in status.split("|")]

                if result.modified_date:
                    modified_date = result.modified_date.strftime("%Y-%m-%d")
                else:
                    modified_date = None

                data.append(
                    {
                        "cam_name": campaign.cam_name,
                        "cam_id": result.cam_id,
                        "email": result.email,
                        "status": {
                            "total": status_list[0],
                            "send_mail": status_list[1],
                            "open": status_list[2],
                            "click": status_list[3],
                            "submit": status_list[4],
                            "error": status_list[5],
                        },
                        "modified_date": modified_date,
                        "create_date": campaign.created_date.strftime("%Y-%m-%d"),
                        "full_create_date_time": campaign.created_date,
                        "completed_date": campaign.completed_date.strftime("%Y-%m-%d"),
                        
                    }
                )

        return make_response(jsonify({"result": data}), HTTP_200_OK)








@campaign_ns.route("/alldata")
class AllData(Resource):
    @jwt_required()
    
    def get(self):

        db_users = db.session.query(User).all()
        db_groups = db.session.query(Group).all()
        db_smtps = db.session.query(Smtp).all()
        db_templates = db.session.query(Template).all()
        db_pages = db.session.query(Page).all()

        users = [{"id": str(user.id), "email": user.email} for user in db_users]
        groups = [{"id": group.id, "groupname": group.groupname} for group in db_groups]
        smtps = [{"smtp_id": smtp.smtp_id, "name": smtp.name} for smtp in db_smtps]
        templates = [
            {"temp_id": template.temp_id, "temp_name": template.temp_name}
            for template in db_templates
        ]
        pages = [
            {"page_id": page.page_id, "path": Path(page.path).stem}
            for page in db_pages
        ]

        response = {
            "users": users,
            "groups": groups,
            "smtps": smtps,
            "templates": templates,
            "pages": pages,
        }
        return make_response(jsonify(response), HTTP_200_OK)





@campaign_ns.route("/finish_campaign/<int:id>")
class FinishCampaign(Resource):
    @jwt_required()
    
    def get(self, id):
        db_campaign = db.session.query(Campaign).filter_by(cam_id=id).first()
        if not db_campaign:
            return make_response(
                jsonify({"msg": "Campaign not found"}), HTTP_404_NOT_FOUND
            )
        cam_name = db_campaign.cam_name
        db_campaign.status = "Finished"
        db_campaign.completed_date = datetime.now()
        
        db_result = db.session.query(Result).filter_by(cam_id=db_campaign.cam_id).first()
        db_result.modified_date = datetime.now()

        for target in db_campaign.group.target:
            if target.status is None or (
                isinstance(target.status, str) and target.status.strip() == ""
            ):
                target.status = "Failure"
        groupId = db_campaign.group_id
        db_group = db.session.query(Group).filter_by(id = groupId).first()
        db_group.cam_id = None
        
        db.session.commit()
        
        file_path = file_path_excel(cam_name)
        update_excel_file(file_path)

        return make_response(
            jsonify({"msg": "Campaign finished successfully "}), HTTP_200_OK
        )