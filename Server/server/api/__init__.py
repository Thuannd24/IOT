# api/__init__.py
from flask import Blueprint
from .common import ensure_dirs, load_known_faces_into_ram, ok
from .students import bp_students
from .attendance import bp_attendance
from .sessions import bp_sessions, finalize_due_sessions

def register_api(app):
    api_bp = Blueprint("api", __name__)
    # route nhỏ: /api/health
    @api_bp.get("/health")
    def health():
        import datetime
        return ok({"time": datetime.datetime.now().isoformat()}, "server_ok")

    # mount các mảng chức năng
    app.register_blueprint(api_bp, url_prefix="/api")
    app.register_blueprint(bp_students, url_prefix="/api/students")
    app.register_blueprint(bp_attendance, url_prefix="/api")
    app.register_blueprint(bp_sessions, url_prefix="/api/sessions")

def init_startup():
    ensure_dirs()
    load_known_faces_into_ram()
    finalize_due_sessions()
