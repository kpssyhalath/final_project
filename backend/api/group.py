from flask import request, jsonify, make_response
from flask_restx import Resource, fields, Namespace
from flask_jwt_extended import get_jwt, jwt_required

from sqlalchemy import and_

from api.models import Group, db, Target
from constans.http_status_code import (
    HTTP_200_OK,
    HTTP_201_CREATED,
    HTTP_400_BAD_REQUEST,
    HTTP_409_CONFLICT,
)
group_ns = Namespace("group", description="Group management operations")



# def validate():

# groupManangemet in website

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

@group_ns.route('/')
class GroupManagments(Resource):

    def post(self):
        data = request.get_json()
        group_name = data.get("group_name")
        target_list = data.get("target_list")

        db_group = (
            db.session.query(Group).filter_by(groupname = group_name).first()
        ) 
        if db_group is not None:
            return make_response(
                jsonify({"msg": "Group name already taken"}), HTTP_409_CONFLICT
            )
        

        g = Group(groupname=group_name)

        for target in target_list:
            t = Target(email=target["email"], firstname=target["firstname"])
            g.target.append(t)

        db.session.add(g)
        db.session.commit()

        return make_response(jsonify({"msg": "Group created"}), HTTP_201_CREATED)

    def get(self):

        groups = db.session.query(Group).all()
        group_target = []
        for g in groups:
            group_name = g.groupname
            data = []
            for i in g.target:
                data.append(
                    {
                        "id": i.id,
                        "email": i.email,
                        "firstname": i.firstname,
                        "lastname": i.lastname,
                        "ip_addr": i.ip_addr,
                    }
                )
            group_target.append(
                {"group_name": group_name, "group_id": g.id, "target_list": data}
            )
        return make_response(jsonify({"group_target": group_target}), HTTP_200_OK)

@group_ns.route('/<int:id>')
class GroupManagments(Resource):

    def put(self, id):

        group_id = request.json.get("group_id", None)
        group_name = request.json.get("group_name", None)
        target_list = request.json.get("target_id", None)

        group = db.session.query(Group).filter_by(id=group_id).first()
        gname = (
            db.session.query(Group)
            .filter(and_(Group.id != group_id, Group.groupname == group_name))
            .first()
        )

        if gname is not None:
            return make_response(
                jsonify({"msg": "Group name already taken"}), HTTP_409_CONFLICT
            )
        group.groupname = group_name
        db.session.commit()

        return make_response(jsonify({"msg": "Updated"}), HTTP_200_OK)


    
    def delete(self, id):

        group_id = request.json.get("group_id", None)
        targets = []
        group = db.session.query(Group).filter_by(id=group_id).first()
        for t in group.target:
            targets.append(t.id)
        group.target.clear()
        for t in targets:
            db.session.query(Target).filter_by(id=t).delete()
        db.session.query(Group).filter_by(id=group_id).delete()
        db.session.commit()

        if group_id is None:
            return make_response(
                jsonify({"msg": "No group id provided"}), HTTP_400_BAD_REQUEST
            )
        if group is None:
            return make_response(jsonify({"msg": "No group"}), HTTP_400_BAD_REQUEST)
        return make_response(jsonify({"msg", "Group deleted"}), HTTP_200_OK)
