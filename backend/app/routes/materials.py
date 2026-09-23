import os
from flask import Blueprint, request, send_from_directory, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.user import User
from app.models.academic import Subject
from app.models.material import StudyMaterial
from app.utils.responses import api_response, error_response
from app.utils.decorators import teacher_required
from app.utils.file_handler import save_uploaded_file
from app.utils.audit import log_audit_action

materials_bp = Blueprint('materials', __name__, url_prefix='/api/v1/materials')

@materials_bp.route('', methods=['GET'])
@jwt_required()
def get_materials():
    subject_id = request.args.get('subject_id', type=int)
    search = request.args.get('search', '').strip()

    query = StudyMaterial.query
    if subject_id:
        query = query.filter_by(subject_id=subject_id)
    if search:
        query = query.filter(
            (StudyMaterial.title.ilike(f'%{search}%')) |
            (StudyMaterial.description.ilike(f'%{search}%'))
        )

    materials = query.order_by(StudyMaterial.created_at.desc()).all()
    return api_response(success=True, data=[m.to_dict() for m in materials])


@materials_bp.route('', methods=['POST'])
@teacher_required
def upload_material():
    user_id = int(get_jwt_identity())
    title = request.form.get('title', '').strip()
    description = request.form.get('description', '').strip()
    subject_id = request.form.get('subject_id', type=int)

    if not title or not subject_id:
        return error_response("Title and subject are required", status_code=400)

    if 'file' not in request.files:
        return error_response("File is required", status_code=400)

    file = request.files['file']
    if not file or file.filename == '':
        return error_response("No file selected", status_code=400)

    try:
        rel_path, orig_name, file_size, ext = save_uploaded_file(file, 'materials')
    except Exception as e:
        return error_response(f"Upload error: {str(e)}", status_code=400)

    material = StudyMaterial(
        title=title,
        description=description,
        subject_id=subject_id,
        uploaded_by=user_id,
        file_path=rel_path,
        file_name=orig_name,
        file_type=ext,
        file_size_bytes=file_size
    )
    db.session.add(material)
    db.session.commit()

    log_audit_action('MATERIAL_UPLOADED', 'study_material', material.id, {'title': title, 'subject_id': subject_id})

    return api_response(success=True, message="Material uploaded successfully", data=material.to_dict(), status_code=201)


@materials_bp.route('/<int:id>', methods=['DELETE'])
@teacher_required
def delete_material(id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    material = StudyMaterial.query.get(id)
    if not material:
        return error_response("Material not found", status_code=404)

    # Only uploader or admin can delete
    if user.role != 'admin' and material.uploaded_by != user_id:
        return error_response("You do not have permission to delete this file", status_code=403)

    # Attempt to delete file from disk
    try:
        full_path = os.path.join(current_app.config['UPLOAD_FOLDER'], material.file_path)
        if os.path.exists(full_path):
            os.remove(full_path)
    except Exception:
        pass

    db.session.delete(material)
    db.session.commit()
    log_audit_action('MATERIAL_DELETED', 'study_material', id)

    return api_response(success=True, message="Material deleted successfully")


@materials_bp.route('/download/<int:id>', methods=['GET'])
@jwt_required()
def download_material(id):
    material = StudyMaterial.query.get(id)
    if not material:
        return error_response("Material not found", status_code=404)

    upload_dir = current_app.config['UPLOAD_FOLDER']
    subfolder, fname = os.path.split(material.file_path)
    directory = os.path.join(upload_dir, subfolder)

    return send_from_directory(directory, fname, as_attachment=True, download_name=material.file_name)
