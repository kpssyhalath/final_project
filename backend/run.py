from app import create_app
from config import DevConfig # Import your configuration class
import os
if __name__ == "__main__":
    app = create_app(DevConfig) 
    os.makedirs("templates", exist_ok=True)
    os.makedirs("result", exist_ok=True)

    app.run()