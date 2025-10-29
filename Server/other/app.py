from datetime import datetime
import os

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import sessionmaker, declarative_base, relationship

# ----------------------
# App & DB setup
# ----------------------
DB_URL = os.environ.get("DB_URL", "sqlite:///attendance.db")
engine = create_engine(DB_URL, echo=False)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})
# allow CORS for dev; tighten in prod

# cors_allowed_origins='*' for dev; set to FE origin in prod
socketio = SocketIO(app, cors_allowed_origins="*")

# ----------------------
# Models
# ----------------------
class Student(Base):
    __tablename__ = 'students'
    id = Column(Integer, primary_key=True)
    name = Column(String(120), nullable=False)
    class_name = Column(String(120), default="")
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
            {"id": s.id, "name": s.name, "className": s.class_name, "createdAt": s.created_at.isoformat()} for s in q
        ])

@app.post('/api/students')
def create_student():
    data = request.json or {}
    name = data.get('name')
    class_name = data.get('className', "")
    if not name:
        return jsonify({"error": "name is required"}), 400
    with SessionLocal() as db:
        s = Student(name=name, class_name=class_name)
        db.add(s)
        db.commit()
        return jsonify({"id": s.id, "name": s.name, "className": s.class_name}), 201

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
