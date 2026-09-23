from datetime import datetime
from flask import Blueprint
from sqlalchemy import text
from app.extensions import db
from app.utils.responses import api_response, error_response

health_bp = Blueprint('health', __name__, url_prefix='/api/v1/health')

@health_bp.route('', methods=['GET'])
def health_check():
    db_status = "healthy"
    try:
        db.session.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return api_response(
        success=(db_status == "healthy"),
        message="CampusConnect API service status",
        data={
            'status': 'online',
            'database': db_status,
            'timestamp': datetime.utcnow().isoformat(),
            'version': '1.0.0',
            'service': 'CampusConnect ERP'
        },
        status_code=200 if db_status == "healthy" else 503
    )
