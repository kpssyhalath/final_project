import os
from flask import Flask
from datetime import timedelta

from flask_restx import Api
from flask_jwt_extended import JWTManager 
from flask_migrate import Migrate
from flask_cors import CORS
from dotenv import load_dotenv

from config import DevConfig
from api.models import db, Campaign, Base, engine 
from api.auth import auth_ns
from api.users import user_ns
from api.sending_profile import sending_prolfile_ns
from api.group import group_ns
from api.email_template import email_template_ns
from api.landing_page import landing_page_ns
from api.landing_page import landing_page_ns
from api.campaign import campaign_ns
from api.tracker import tracker_ns
from api.result import result_campaign_ns





def create_app(config=None):
    app = Flask(__name__, instance_relative_config=True)
    
    load_dotenv()
    
    if config is None:
        app.config.from_mapping(
            SECRET_KEY=os.environ.get("SECRET_KET"),
            JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY"),
            SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URI"),
            SQLALCHEMY_TRACK_MODIFICATIONS = False,
            JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1),
            JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=2)
        )
    else:
        app.config.from_object(DevConfig)

    CORS(app)

    
    db.init_app(app)
    migrate = Migrate(app,db)
    JWTManager(app)
    api = Api(app, doc='/docs')


    api.add_namespace(auth_ns)
    api.add_namespace(user_ns)
    api.add_namespace(sending_prolfile_ns)
    api.add_namespace(group_ns)
    api.add_namespace(email_template_ns)
    api.add_namespace(landing_page_ns)
    api.add_namespace(campaign_ns)
    api.add_namespace(tracker_ns)
    api.add_namespace(result_campaign_ns)

        

    #app shell
    @app.shell_context_processor
    def make_shell_context():
        print("Executing make_shell_context function...")  
        return{
            "db":db,
            "Campaign":Campaign,
            "Base": Base,
            "engine":engine,
            # "dsd": add_default_data()
        }
        
        
    return app


