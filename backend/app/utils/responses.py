from flask import jsonify

def api_response(success=True, message="Request completed successfully", data=None, meta=None, status_code=200):
    response = {
        'success': success,
        'message': message,
        'data': data if data is not None else {},
    }
    if meta is not None:
        response['meta'] = meta
    return jsonify(response), status_code

def error_response(message="An error occurred", errors=None, status_code=400):
    response = {
        'success': False,
        'message': message,
        'errors': errors if errors is not None else {}
    }
    return jsonify(response), status_code
