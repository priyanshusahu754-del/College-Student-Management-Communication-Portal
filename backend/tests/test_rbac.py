def test_unauthenticated_request_fails(client):
    res = client.get('/api/v1/users')
    assert res.status_code == 401

def test_student_cannot_access_admin_endpoint(client, student_token):
    res = client.get('/api/v1/users', headers={'Authorization': f'Bearer {student_token}'})
    assert res.status_code == 403
    json_data = res.get_json()
    assert json_data['success'] is False

def test_teacher_cannot_access_admin_endpoint(client, teacher_token):
    res = client.get('/api/v1/users', headers={'Authorization': f'Bearer {teacher_token}'})
    assert res.status_code == 403

def test_admin_can_access_admin_endpoint(client, admin_token):
    res = client.get('/api/v1/users', headers={'Authorization': f'Bearer {admin_token}'})
    assert res.status_code == 200
    assert res.get_json()['success'] is True
