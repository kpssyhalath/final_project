# coding: utf-8
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Table, Text, text, create_engine
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from flask_sqlalchemy import SQLAlchemy
engine = create_engine('postgresql://postgres:password@localhost/Phishing_Project', echo=True)

db = SQLAlchemy()

Base = declarative_base()                           #!!!
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
    group_id = Column(Integer, nullable=False)                      #not like in the ER
    page_id = Column(Integer)                                       #not like in the ER
    temp_id = Column(Integer)                                       #not like in the ER
    smtp_id = Column(Integer, nullable=False)                       #not like in the ER


class Group(Base):
    __tablename__ = 'groups'

    id = Column(Integer, primary_key=True, autoincrement=True)
    groupname = Column(String(100), nullable=False)
    camp_id = Column(Integer)
    
    target = relationship('Target', secondary='grouptarget')        #not like in the ER


class Page(Base):
    __tablename__ = 'page'

    page_id = Column(Integer, primary_key=True, autoincrement=True)
    path = Column(Text)


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


class Role(Base):
    __tablename__ = 'role'

    role_id = Column(Integer, primary_key=True)
    role_name = Column(String(100), nullable=False)
    role_desc = Column(Text)


class Smtp(Base):
    __tablename__ = 'smtp'

    smtp_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    host = Column(String(100), nullable=False)
    username = Column(String(100), nullable=False)
    password = Column(String(100), nullable=False)
    from_address = Column(String(100), nullable=False)
    ignore_cert_errors = Column(Boolean)                            #not like in the ER


class Target(Base):
    __tablename__ = 'target'

    id = Column(Integer, primary_key=True, autoincrement=True)
    firstname = Column(String(100), nullable=False)
    lastname = Column(String(100))
    email = Column(String(100), nullable=False)
    hostname = Column(String(100))
    ip_addr = Column(String(15))
    sess_id = Column(String(15))                                    #not like in the database and ER
                                                                    #Dont have recv_data coloum like in ER

class Template(Base):
    __tablename__ = 'template'

    temp_id = Column(Integer, primary_key=True, autoincrement=True)
    temp_name = Column(String(100), nullable=False)
    temp_subject = Column(String(255))
    temp_text = Column(Text)
    temp_html = Column(Text)


t_grouptarget = Table(                                       
    'grouptarget', metadata,
    Column('groupid', ForeignKey('groups.id')),
    Column('targetid', ForeignKey('target.id'))
)


class User(Base):
    __tablename__ = 'users'

    id = Column(UUID, primary_key=True)
    email = Column(String(100), nullable=False)                  #not like in the database (just name)
    password = Column(String(170), nullable=False)
    role_id = Column(ForeignKey('role.role_id'))

    role = relationship('Role')                                     #not like in the database



#Don't have Role_permission in ER

    # Add new
# t_rolepermission = Table(                                          
#     'grouptarget', metadata,
#     Column('roleid', ForeignKey('role.role_id')),
#     Column('permid', ForeignKey('permission.perm_id'))
# )


    # change html to path
# class Page(Base):
#     __tablename__ = 'page'

#     page_id = Column(Integer, primary_key=True, autoincrement=True)
#     path = Column(Text)