import os
import uuid
from werkzeug.utils import secure_filename
from flask import current_app

def allowed_file(filename: str) -> bool:
    if '.' not in filename:
        return False
    ext = filename.rsplit('.', 1)[1].lower()
    return ext in current_app.config.get('ALLOWED_EXTENSIONS', {'pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'png', 'jpg', 'jpeg', 'zip'})

def save_uploaded_file(file_storage, subfolder: str = 'general') -> tuple[str, str, int, str]:
    """
    Saves an uploaded file securely.
    Returns: (stored_relative_path, original_filename, file_size_bytes, file_ext)
    """
    if not file_storage or file_storage.filename == '':
        raise ValueError("No file provided")

    original_filename = secure_filename(file_storage.filename)
    if not allowed_file(original_filename):
        raise ValueError(f"File type not allowed. Allowed types: {', '.join(current_app.config['ALLOWED_EXTENSIONS'])}")

    ext = original_filename.rsplit('.', 1)[1].lower()
    unique_name = f"{uuid.uuid4().hex}_{original_filename}"
    
    target_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], subfolder)
    os.makedirs(target_dir, exist_ok=True)

    target_path = os.path.join(target_dir, unique_name)
    file_storage.save(target_path)

    file_size = os.path.getsize(target_path)
    relative_path = os.path.join(subfolder, unique_name).replace('\\', '/')

    return relative_path, original_filename, file_size, ext
