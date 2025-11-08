# app.py
from flask import Flask
from flask_cors import CORS
from api import register_api, init_startup  # 👈 thay vì routes

app = Flask(__name__)
app.url_map.strict_slashes = False   # 👈 chấp nhận /sessions và /sessions/
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
register_api(app)

if __name__ == "__main__":
    init_startup()
    app.run(host="0.0.0.0", port=5000)
