from datetime import datetime
import os

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
from werkzeug.utils import secure_filename


BASE_DIR   = os.path.abspath(os.path.dirname(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
AVATAR_DIR = os.path.join(UPLOAD_DIR, "avatars")
os.makedirs(AVATAR_DIR, exist_ok=True)

# ----------------------
# App & DB setup
# ----------------------
DB_URL = os.environ.get(
    "DB_URL",
    "mysql+pymysql://root:123456@localhost/iotmain"
)
engine = create_engine(DB_URL, echo=False)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})
# allow CORS for dev; tighten in prod

# cors_allowed_origins='*' for dev; set to FE origin in prod
socketio = SocketIO(app, cors_allowed_origins="*")

# ----------------------
# Models
# ----------------------
class Student(Base):
    __tablename__ = 'students'
    id = Column(Integer, primary_key=True)
    student_code = Column(String(64), nullable=False)
    name = Column(String(120), nullable=False)
    class_name = Column(String(120), default="")
    avatar_url = Column(String(255), default="") 
    created_at = Column(DateTime, default=datetime.utcnow)
    attendances = relationship("Attendance", back_populates="student", cascade="all, delete-orphan")

class Attendance(Base):
    __tablename__ = 'attendance'
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey('students.id'))
    status = Column(String(30), default="present")  # present/absent/late
    timestamp = Column(DateTime, default=datetime.utcnow)
    student = relationship("Student", back_populates="attendances")

Base.metadata.create_all(engine)

# ----------------------
# Helpers
# ----------------------

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ----------------------
# Routes: Students CRUD
# ----------------------
@app.get('/api/students')
def list_students():
    with SessionLocal() as db:
        q = db.query(Student).order_by(Student.id.desc()).all()
        return jsonify([
            {
                "id": s.id,
                "studentCode": s.student_code,
                "name": s.name,
                "className": s.class_name,
                "avatarUrl": s.avatar_url,
                "createdAt": s.created_at.isoformat()
            } for s in q
        ])

@app.post('/api/students')
def create_student():
    # if request.content_type and request.content_type.startswith('multipart/form-data'):
    # student_code = (request.form.get('studentCode') or '').strip()
    # name = (request.form.get('name') or '').strip()
    # class_name = (request.form.get('className') or '').strip()
    # if not student_code or not name:
    #     return jsonify({"error":"studentCode and name are required"}), 400
    # avatar_url = ""
    # if 'avatar' in request.files and request.files['avatar']:
    #     f = request.files['avatar']
    #     fname = datetime.utcnow().strftime('%Y%m%d%H%M%S') + '_' + secure_filename(f.filename)
    #     f.save(os.path.join(AVATAR_DIR, fname))
    #     avatar_url = f"/uploads/avatars/{fname}"
    # with SessionLocal() as db:
    #     if db.query(Student).filter(Student.student_code==student_code).first():
    #         return jsonify({"error":"studentCode already exists"}), 409
    #     s = Student(student_code=student_code, name=name, class_name=class_name, avatar_url=avatar_url)
    #     db.add(s); db.commit()
    #     return jsonify({"id": s.id, "studentCode": s.student_code, "name": s.name, "className": s.class_name, "avatarUrl": s.avatar_url}), 201
    # else:
    #     data = request.json or {}
    #     student_code = (data.get('studentCode') or '').strip()
    #     name = (data.get('name') or '').strip()
    #     class_name = (data.get('className') or '').strip()
    #     if not student_code or not name:
    #         return jsonify({"error":"studentCode and name are required"}), 400
    #     with SessionLocal() as db:
    #         if db.query(Student).filter(Student.student_code==student_code).first():
    #             return jsonify({"error":"studentCode already exists"}), 409
    #         s = Student(student_code=student_code, name=name, class_name=class_name)
    #         db.add(s)
    #         db.commit()
    #         return jsonify({"id": s.id, "studentCode": s.student_code, "name": s.name, "className": s.class_name, "avatarUrl": s.avatar_url}), 201
    # data = request.json or {}
    # name = data.get('name')
    # class_name = data.get('className', "")
    # if not name:
    #     return jsonify({"error": "name is required"}), 400
    # with SessionLocal() as db:
    #     s = Student(name=name, class_name=class_name)
    #     db.add(s)
    #     db.commit()
    #     return jsonify({"id": s.id, "name": s.name, "className": s.class_name}), 201
    
    if request.content_type and request.content_type.startswith('multipart/form-data'):
        student_code = (request.form.get('studentCode') or '').strip()
        name = (request.form.get('name') or '').strip()
        class_name = (request.form.get('className') or '').strip()

        if not student_code or not name:
            return jsonify({"error": "studentCode and name are required"}), 400

        avatar_url = ""
        if 'avatar' in request.files and request.files['avatar']:
            f = request.files['avatar']
            if f.filename:
                fname = datetime.utcnow().strftime('%Y%m%d%H%M%S') + '_' + secure_filename(f.filename)
                f.save(os.path.join(AVATAR_DIR, fname))
                avatar_url = f"/uploads/avatars/{fname}"

        with SessionLocal() as db:
            # kiểm tra trùng mã sinh viên
            if db.query(Student).filter(Student.student_code == student_code).first():
                return jsonify({"error": "studentCode already exists"}), 409

            s = Student(
                student_code=student_code,
                name=name,
                class_name=class_name,
                avatar_url=avatar_url,
            )
            db.add(s)
            db.commit()
            return jsonify({
                "id": s.id,
                "studentCode": s.student_code,
                "name": s.name,
                "className": s.class_name,
                "avatarUrl": s.avatar_url
            }), 201

    # Nếu là JSON (không gửi file)
    data = request.json or {}
    student_code = (data.get('studentCode') or '').strip()
    name = (data.get('name') or '').strip()
    class_name = (data.get('className') or '').strip()

    if not student_code or not name:
        return jsonify({"error": "studentCode and name are required"}), 400

    with SessionLocal() as db:
        if db.query(Student).filter(Student.student_code == student_code).first():
            return jsonify({"error": "studentCode already exists"}), 409

        s = Student(student_code=student_code, name=name, class_name=class_name)
        db.add(s)
        db.commit()
        return jsonify({
            "id": s.id,
            "studentCode": s.student_code,
            "name": s.name,
            "className": s.class_name,
            "avatarUrl": s.avatar_url
        }), 201

@app.post('/api/students/<int:sid>/avatar')
def upload_avatar(sid):
    if 'avatar' not in request.files: return jsonify({"error":"avatar file is required"}), 400
    f = request.files['avatar']
    if not f.filename: return jsonify({"error":"empty filename"}), 400
    fname = datetime.utcnow().strftime('%Y%m%d%H%M%S') + '_' + secure_filename(f.filename)
    f.save(os.path.join(AVATAR_DIR, fname))
    url = f"/uploads/avatars/{fname}"
    with SessionLocal() as db:
        s = db.get(Student, sid)
        if not s: return jsonify({"error":"not found"}), 404
        s.avatar_url = url; db.commit()
        return jsonify({"ok": True, "avatarUrl": url})

@app.put('/api/students/<int:sid>')
def update_student(sid):
    data = request.json or {}
    with SessionLocal() as db:
        s = db.get(Student, sid)
        if not s:
            return jsonify({"error": "not found"}), 404
        s.name = data.get('name', s.name)
        s.class_name = data.get('className', s.class_name)
        db.commit()
        return jsonify({"id": s.id, "name": s.name, "className": s.class_name})
    
@app.get('/uploads/avatars/<path:path>')
def serve_avatar(path):
    # Tránh truy cập ra ngoài thư mục
    return send_from_directory(AVATAR_DIR, path)

@app.delete('/api/students/<int:sid>')
def delete_student(sid):
    with SessionLocal() as db:
        s = db.get(Student, sid)
        if not s:
            return jsonify({"error": "not found"}), 404
        db.delete(s)
        db.commit()
        return jsonify({"ok": True})

# ----------------------
# Routes: Attendance
# ----------------------
@app.get('/api/attendance')
def list_attendance():
    """Optional filters: ?className=&date=YYYY-MM-DD"""
    class_name = request.args.get('className')
    date_str = request.args.get('date')
    with SessionLocal() as db:
        q = db.query(Attendance).join(Student)
        if class_name:
            q = q.filter(Student.class_name == class_name)
        if date_str:
            try:
                y, m, d = map(int, date_str.split('-'))
                start = datetime(y, m, d)
                end = datetime(y, m, d, 23, 59, 59)
                q = q.filter(Attendance.timestamp.between(start, end))
            except Exception:
                return jsonify({"error": "invalid date format"}), 400
        q = q.order_by(Attendance.timestamp.desc()).all()
        return jsonify([
            {
                "id": a.id,
                "studentId": a.student_id,
                "studentName": a.student.name if a.student else None,
                "status": a.status,
                "timestamp": a.timestamp.isoformat(),
            } for a in q
        ])

@app.post('/api/attendance/checkin')
def checkin():
    data = request.json or {}
    sid = data.get('studentId')
    status = data.get('status', 'present')
    if not sid:
        return jsonify({"error": "studentId required"}), 400
    with SessionLocal() as db:
        s = db.get(Student, sid)
        if not s:
            return jsonify({"error": "student not found"}), 404
        a = Attendance(student_id=s.id, status=status)
        db.add(a)
        db.commit()
        payload = {
            "studentId": s.id,
            "studentName": s.name,
            "className": s.class_name,
            "status": status,
            "time": a.timestamp.isoformat(),
            "confidence": 0.99  # placeholder; fill from face-recognition later
        }
        socketio.emit('recognition', payload)
        return jsonify({"ok": True, **payload})

# ----------------------
# Route: Recognitions feed (latest N)
# ----------------------
@app.get('/api/recognitions')
def recognitions_feed():
    limit = int(request.args.get('limit', 20))
    with SessionLocal() as db:
        q = (
            db.query(Attendance, Student)
            .join(Student, Attendance.student_id == Student.id)
            .order_by(Attendance.timestamp.desc())
            .limit(limit)
            .all()
        )
        return jsonify([
            {
                "studentId": s.id,
                "studentName": s.name,
                "className": s.class_name,
                "status": a.status,
                "time": a.timestamp.isoformat(),
            }
            for (a, s) in q
        ])

# ----------------------
# Health check
# ----------------------
@app.get('/api/health')
def health():
    with SessionLocal() as db:
        total_students = db.query(func.count(Student.id)).scalar()
        total_att = db.query(func.count(Attendance.id)).scalar()
    return jsonify({"ok": True, "students": total_students, "attendance": total_att})

# ----------------------
# Dev bootstrap
# ----------------------
if __name__ == '__main__':
    # For local dev only. In prod, use eventlet/gevent or a proper ASGI server
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
