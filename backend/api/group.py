from flask import request, jsonify, make_response
from flask_restx import Resource, fields, Namespace
from flask_jwt_extended import get_jwt, jwt_required

from sqlalchemy import and_

from api.models import Group, db, Target
from constans.http_status_code import (
    HTTP_200_OK,
    HTTP_201_CREATED,
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
    HTTP_409_CONFLICT,
)

group_ns = Namespace("group", description="Group management operations")


# groupManangemet in website
target_model = group_ns.model(
    "Target",
    {
        "email": fields.String(),
        "firstname": fields.String(),
    }
)
group_model = group_ns.model(
    "Group",
    {
        "group_name": fields.String(),
        "target_list": fields.List(fields.Nested(target_model),),
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


@group_ns.route("/")
class GroupManagments(Resource):
    # Create Group
    @jwt_required()
    
    @group_ns.expect(group_model)
    def post(self):
        
        permission_check = check_admin_permission()
        if permission_check:
            return permission_check
        
        data = request.get_json()
        group_name = data.get("group_name")
        target_list = data.get("target_list")

        # validate empty fields
        validate_name = validate_strip(group_name, "group name")
        if validate_name:
            return validate_name

        # Validate target_list
        if not isinstance(target_list, list):
            return make_response(jsonify({"msg": "Target list should be a list"}), HTTP_400_BAD_REQUEST)

        for target in target_list:
            if not isinstance(target, dict):
                return make_response(jsonify({"msg": "Each target should be a dictionary"}), HTTP_400_BAD_REQUEST)
            validate_firstname = validate_strip(target.get("firstname"), "firstname")
            if validate_firstname:
                return validate_firstname
            
            validate_email = validate_strip(target.get("email"), "email")
            if validate_email:
                return validate_email
            
            
            
        # Check if group name already exists
        db_group = db.session.query(Group).filter_by(groupname=group_name).first()
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

    # Get all groups
    @jwt_required()
    
    def get(self):
        permission_check = check_admin_permission()
        if permission_check:
            return permission_check
        

        db_groups = db.session.query(Group).all()
        group_target = []
        for g in db_groups:
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


@group_ns.route("/<int:id>")
class GroupManagments(Resource):

    # Edit Group
    @jwt_required()
    def put(self, id):
        
        permission_check = check_admin_permission()
        if permission_check:
            return permission_check
        
        data = request.get_json()
        group_id = id                        
        group_name = data.get("group_name")
        
        target_list = data.get("target_list")

        # validate empty fields
        validate_name = validate_strip(group_name, "group name")
        if validate_name:
            return validate_name
        
        # Validate target_list
        if not isinstance(target_list, list):
            return make_response(jsonify({"msg": "Target list should be a list"}), HTTP_400_BAD_REQUEST)

        for target in target_list:
            if not isinstance(target, dict):
                return make_response(jsonify({"msg": "Each target should be a dictionary"}), HTTP_400_BAD_REQUEST)
            validate_firstname = validate_strip(target.get("firstname"), "firstname")
            if validate_firstname:
                return validate_firstname

            validate_email = validate_strip(target.get("email"), "email")
            if validate_email:
                return validate_email
        
        
        # Fetch the existing group 
        group = db.session.query(Group).filter_by(id = group_id).first()
        if not group:
            return make_response(jsonify({"msg": "Group not found"}), HTTP_404_NOT_FOUND)
        
         # Check if group name already exists (exclude current group)
        db_group = db.session.query(Group).filter(Group.groupname == group_name, Group.id != group_id).first()
        if db_group:
            return make_response(jsonify({"msg": "Group name already taken"}), HTTP_409_CONFLICT)
        
        # Add id target to list
        target_id = []
        for t in group.target:
            target_id.append(t.id)
            
        # Clear existing targets and remove 
        group.target.clear()
        for t in target_id:
            db.session.query(Target).filter_by(id=t).delete()
        
        # Add new ones
        for target in target_list:
            lastname = target.get("lastname") or None
            t = Target(email=target["email"], firstname=target["firstname"],lastname = lastname)
            group.target.append(t)
            
            
        # Update group details
        group.groupname = group_name
        db.session.commit()

        return make_response(jsonify({"msg": "Group Updated"}), HTTP_200_OK)



    # Delete Group
    @jwt_required()
    
    def delete(self, id):
        permission_check = check_admin_permission()
        if permission_check:
            return permission_check
                
        
        group_id = id          
        targets = []
        db_group = db.session.query(Group).filter_by(id = group_id).first()
        
        if db_group is None:
            return make_response(jsonify({"msg": "Group not found"}), HTTP_400_BAD_REQUEST)
        
        # Clear the group's targets
        for t in db_group.target:
            targets.append(t.id)
        db_group.target.clear()
        
        # Delete the targets associated with the group
        for t in targets:
            db.session.query(Target).filter_by(id=t).delete()
            
        # Delete the group
        db.session.query(Group).filter_by(id=group_id).delete()
        db.session.commit()


        return make_response(jsonify({"msg": "Group deleted"}), HTTP_200_OK)
