from app import create_app
from config import DevConfig # Import your configuration class

if __name__ == "__main__":
    app = create_app(DevConfig)  # Pass the configuration object to create_app
    app.run()