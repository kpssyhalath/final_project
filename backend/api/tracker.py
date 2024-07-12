import os
import socket
from datetime import datetime
from flask import request, jsonify, make_response, render_template
from flask_restx import Namespace, Resource

from api.models import Group, Target, Page, Campaign, t_grouptarget, Result, db
from utils.file_path_excel import file_path_excel
from utils.xlsx import edit_excel_file, check_empty


from constans.http_status_code import (
    HTTP_200_OK,
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
)

tracker_ns = Namespace("tracker", description="Track email operations")


def get_result_by_target_id(target_id):
    try:
        result = (
            db.session.query(Result.rid)
            .join(Campaign, Campaign.cam_id == Result.cam_id)
            .join(Group, Group.cam_id == Campaign.cam_id)
            .join(t_grouptarget, t_grouptarget.c.groupid == Group.id)
            .join(Target, t_grouptarget.c.targetid == Target.id)
            .filter(Target.id == target_id)
            .first()
        )

        if not result:
            return make_response(
                jsonify({"error": "Target ID not found"}), HTTP_404_NOT_FOUND
            )

        db_result = db.session.query(Result).filter(Result.rid == result.rid).first()
        return db_result

    except Exception as e:
        return make_response(jsonify({"error": str(e)}), 500)


def get_campaign_by_target_id(target_id):
    try:
        # Get campaign id by target id
        campaign = (
            db.session.query(Campaign.cam_id)
            .join(Group, Group.cam_id == Campaign.cam_id)
            .join(t_grouptarget, t_grouptarget.c.groupid == Group.id)
            .join(Target, t_grouptarget.c.targetid == Target.id)
            .filter(Target.id == target_id)
            .first()
        )
        if not campaign:
            return make_response(
                jsonify({"error": "Target ID not found"}), HTTP_404_NOT_FOUND
            )
        db_campaign = (
            db.session.query(Campaign)
            .filter(Campaign.cam_id == campaign.cam_id)
            .first()
        )

        return db_campaign
    except Exception as e:
        return make_response(jsonify({"error": str(e)}), 500)


def get_client_ip():
    if request.headers.get("X-Forwarded-For"):
        ip = request.headers.get("X-Forwarded-For").split(",")[0]
    else:
        ip = request.remote_addr
    return ip


def get_host_name(ip_address):
    try:
        host_name = socket.gethostbyaddr(ip_address)[0]
    except (socket.herror, socket.gaierror):
        host_name = "Unknown"
    return host_name


def get_status_counts(status):
    counts = status.split(" | ")
    return list(map(int, counts))


def update_status_counts(counts, index):
    counts[index] += 1
    return " | ".join(map(str, counts))


@tracker_ns.route("/open")
class Tracker_click(Resource):

    def get(self):
        target_id = request.args.get("id")
        if not target_id:
            return make_response(
                jsonify({"error": "Target ID is required"}), HTTP_400_BAD_REQUEST
            )
        try:
            db_campaign = get_campaign_by_target_id(target_id)
        except Exception as e:
            return make_response(
                jsonify({"error": "Target ID not found"}), HTTP_404_NOT_FOUND
            )
        complete_date = db_campaign.completed_date

        if datetime.now() < complete_date:

            cam_name = db_campaign.cam_name
            db_target = db.session.query(Target).filter_by(id=target_id).first()
            receiver_email = db_target.email
            file_path = file_path_excel(cam_name)
            check_loop = check_empty(file_path, receiver_email, 5)
            if not check_loop:

                db_result = get_result_by_target_id(target_id)

                counts = get_status_counts(db_result.status)
                db_result.status = update_status_counts(counts, 2)
                db.session.commit()

                edit_excel_file(file_path, receiver_email, 5, char="✓")

                return make_response(jsonify({"status": db_result.status}), HTTP_200_OK)


@tracker_ns.route("/click")
class Tracker_open(Resource):
    def get(self):
        target_id = request.args.get("id")
        if not target_id:
            return make_response(
                jsonify({"error": "Target ID is required"}), HTTP_400_BAD_REQUEST
            )

        # count click
        db_campaign = get_campaign_by_target_id(target_id)
        try:
            complete_date = db_campaign.completed_date
        except Exception as e:
            return make_response(
                jsonify({"error": "Target ID not found"}), HTTP_404_NOT_FOUND
            )

        if datetime.now() < complete_date:

            cam_name = db_campaign.cam_name
            file_path = file_path_excel(cam_name)

            db_target = db.session.query(Target).filter_by(id=target_id).first()
            receiver_email = db_target.email

            check_loop = check_empty(file_path, receiver_email, 6)
            if not check_loop:

                db_result = get_result_by_target_id(target_id)

                counts = get_status_counts(db_result.status)
                db_result.status = update_status_counts(counts, 3)
                db.session.commit()

                edit_excel_file(file_path, receiver_email, 6, char="✓")

        # render template
        page_id = db_campaign.page_id

        page_id_result = (
            db.session.query(Page.path).filter(Page.page_id == page_id).first()
        )
        page_path = page_id_result.path

        if page_path:
            page_path = os.path.basename(page_path)
            rendered_html = render_template(
                page_path
            )  # it can pass parameters in to the template
            response = make_response(rendered_html)
            response.headers["Content-Type"] = "text/html"
            return response
        else:
            return make_response(
                jsonify({"error": "No campaign found for the given target ID"}),
                HTTP_400_BAD_REQUEST,
            )


@tracker_ns.route("/send")
class Tracker_send(Resource):
    def get(self):
        recv_data = request.args.get("email") + request.args.get("password")
        session = request.args.get("session")
        ip_address = get_client_ip()
        host_name = get_host_name(ip_address)
        target_id = request.args.get("id")

        recv_data = "*" * len(recv_data)

        if not target_id:
            return make_response(
                jsonify({"error": "Target ID is required"}), HTTP_400_BAD_REQUEST
            )

        db_campaign = get_campaign_by_target_id(target_id)
        complete_date = db_campaign.completed_date
        if datetime.now() < complete_date:
            # result column

            cam_name = db_campaign.cam_name
            file_path = file_path_excel(cam_name)
            db_target = db.session.query(Target).filter_by(id=target_id).first()
            receiver_email = db_target.email

            check_loop = check_empty(file_path, receiver_email, 7)
            if not check_loop:

                db_result = get_result_by_target_id(target_id)

                counts = get_status_counts(db_result.status)
                db_result.status = update_status_counts(counts, 4)

                db_target.ip_addr = ip_address
                db_target.hostname = host_name
                db_target.recv_data = recv_data
                db_target.sess_id = session
                db_target.status = "Success"

                db.session.commit()

                edit_excel_file(file_path, receiver_email, 7, char="✓")

        return None
