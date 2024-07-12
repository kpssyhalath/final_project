# coding: utf-8
import os
from sqlite3 import IntegrityError
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Table, Text, create_engine 
from sqlalchemy.orm import relationship, sessionmaker
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from flask_sqlalchemy import SQLAlchemy
engine = create_engine(os.environ.get('DATABASE_URI'), echo=True)

db = SQLAlchemy()

Base = declarative_base()                         
metadata = Base.metadata

#Create database


class Campaign(Base):
    __tablename__ = 'campaign'

    cam_id = Column(Integer, primary_key=True, autoincrement=True)
    cam_name = Column(String(100), nullable=False)
    status = Column(String(100))
    created_date = Column(DateTime)
    completed_date = Column(DateTime)
    launch_date = Column(DateTime, nullable=False)
    send_data = Column(DateTime, nullable=False)
    user_id = Column(ForeignKey('users.id'), nullable=False)
    group_id = Column(ForeignKey('groups.id'), nullable=False)
    page_id = Column(ForeignKey('page.page_id'))
    temp_id = Column(ForeignKey('template.temp_id'))
    smtp_id = Column(ForeignKey('smtp.smtp_id'), nullable=False)  
                   
    user = relationship('User', backref='campaigns')
    group = relationship('Group', backref='campaigns',foreign_keys=[group_id])
    page = relationship('Page', backref='campaigns')
    template = relationship('Template', backref='campaigns')
    smtp = relationship('Smtp', backref='campaigns')
    
    results = relationship('Result', backref='campaign', cascade='all, delete-orphan')

class Group(Base):
    __tablename__ = 'groups'

    id = Column(Integer, primary_key=True, autoincrement=True)
    groupname = Column(String(100), nullable=False)
    cam_id = Column(ForeignKey('campaign.cam_id'))        
    modified_date = Column(DateTime)
    
    target = relationship('Target', secondary='grouptarget')        


class Page(Base):
    __tablename__ = 'page'

    page_id = Column(Integer, primary_key=True, autoincrement=True)
    path = Column(Text)
    modified_date = Column(DateTime)
    
    
class Permission(Base):
    __tablename__ = 'permission'

    perm_id = Column(Integer, primary_key=True)
    perm_name = Column(String(100), nullable=False)
    perm_desc = Column(Text)


class Result(Base):
    __tablename__ = 'result'

    rid = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(100), nullable=False)
    status = Column(String(100))
    modified_date = Column(DateTime)
    cam_id = Column(ForeignKey('campaign.cam_id'))


class Role(Base):
    __tablename__ = 'role'

    role_id = Column(Integer, primary_key=True)
    role_name = Column(String(100), nullable=False)
    role_desc = Column(Text)
    permissions = relationship('Permission', secondary='role_permission', backref='roles')

class Smtp(Base):
    __tablename__ = 'smtp'

    smtp_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    host = Column(String(100), nullable=False)
    username = Column(String(100), nullable=False)
    password = Column(String(100), nullable=False)
    from_address = Column(String(100), nullable=False)
    modified_date = Column(DateTime)


class Target(Base):
    __tablename__ = 'target'

    id = Column(Integer, primary_key=True, autoincrement=True)
    firstname = Column(String(100), nullable=False)
    lastname = Column(String(100))
    email = Column(String(100), nullable=False)
    hostname = Column(String(100))
    ip_addr = Column(String(15))
    sess_id = Column(String(100))  
    status = Column(String(30))  
    recv_data = Column(Text)


class Template(Base):
    __tablename__ = 'template'

    temp_id = Column(Integer, primary_key=True, autoincrement=True)
    temp_name = Column(String(100), nullable=False)
    temp_subject = Column(String(255))
    temp_text = Column(Text)
    temp_html = Column(Text)
    modified_date = Column(DateTime)
    
    
class User(Base):
    __tablename__ = 'users'

    id = Column(UUID, primary_key=True)
    email = Column(String(100), nullable=False)                  
    password = Column(String(170), nullable=False)
    role_id = Column(ForeignKey('role.role_id'))
    modified_date = Column(DateTime)

    role = relationship('Role')                                     

t_grouptarget = Table(                                       
    'grouptarget', metadata,
    Column('groupid', ForeignKey('groups.id')),
    Column('targetid', ForeignKey('target.id'))
)

t_role_permission = Table(                                          
    'role_permission', metadata,
    Column('roleid', ForeignKey('role.role_id')),
    Column('permid', ForeignKey('permission.perm_id'))
)




# def add_default_data():
#     Session = sessionmaker(bind=engine)
#     session = Session()

#     try:
#         # Define default roles data
#         roles_to_add = [
#             {'role_name': 'admin', 'role_desc': 'Administrator'},
#             {'role_name': 'user', 'role_desc': 'Normal User'}
#         ]
#         for role_data in roles_to_add:
#             role = Role(**role_data)
#             session.add(role)

#         # Define default permissions data
#         permission_to_add = [
#             {'perm_name': 'edit', 'perm_desc': 'Edit data'},
#             {'perm_name': 'write', 'perm_desc': 'Write data'},
#             {'perm_name': 'view', 'perm_desc': 'View data'}
#         ]
#         for perm_data in permission_to_add:
#             permission = Permission(**perm_data)
#             session.add(permission)

#         # Define default user data
#         user_data = {
#             'id': 'd00ebeb6-81d2-4ca0-9430-ee8b80aebeca',
#             'email': 'admin@admin.com',
#             'password': 'pbkdf2:sha256:600000$k45C7Oefu8LsyfML$4dbe78d63f60f8653160a631fe6765de46bca5d8172ed81459b83ff50a794d6e',
#             'role_id': 1
#         }
#         user = User(**user_data)
#         session.add(user)

#         # Commit the changes
#         session.commit()

#         # Assign permissions to roles
#         role_permission = [
#             {'roleid': 1, 'permid': 1},
#             {'roleid': 1, 'permid': 2},
#             {'roleid': 1, 'permid': 3}
#         ]
#         for rp_data in role_permission:
#             role_id = rp_data['roleid']
#             perm_id = rp_data['permid']
#             role = session.query(Role).filter_by(role_id=role_id).first()
#             permission = session.query(Permission).filter_by(perm_id=perm_id).first()
#             if role and permission:
#                 role.permissions.append(permission)

#         # Commit the changes after assigning permissions
#         session.commit()

#         print("Default data added successfully.")
#     except IntegrityError as e:
#         session.rollback()
#         print(f"Error adding default data: {e}")
#     finally:
#         session.close()
        
        
