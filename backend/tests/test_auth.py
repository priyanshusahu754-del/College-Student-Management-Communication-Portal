def test_health_endpoint(client):
    res = client.get('/api/v1/health')
    assert res.status_code == 200
    json_data = res.get_json()
    assert json_data['success'] is True
    assert json_data['data']['status'] == 'online'

def test_login_success(client, seed_data):
    res = client.post('/api/v1/auth/login', json={
        'email': 'student@test.edu',
        'password': 'Student@123'
    })
    assert res.status_code == 200
    json_data = res.get_json()
    assert json_data['success'] is True
    assert 'access_token' in json_data['data']
    assert json_data['data']['user']['email'] == 'student@test.edu'
    assert json_data['data']['user']['role'] == 'student'

def test_login_invalid_password(client, seed_data):
    res = client.post('/api/v1/auth/login', json={
        'email': 'student@test.edu',
        'password': 'WrongPassword'
    })
    assert res.status_code == 401
    json_data = res.get_json()
    assert json_data['success'] is False

def test_login_deactivated_user(client, seed_data, db_session):
    student = seed_data['student_user']
    student.is_active = False
    db_session.commit()

    res = client.post('/api/v1/auth/login', json={
        'email': 'student@test.edu',
        'password': 'Student@123'
    })
    assert res.status_code == 403
    assert "deactivated" in res.get_json()['message']

def test_auth_me_endpoint(client, student_token):
    res = client.get('/api/v1/auth/me', headers={'Authorization': f'Bearer {student_token}'})
    assert res.status_code == 200
    json_data = res.get_json()
    assert json_data['data']['user']['role'] == 'student'

def test_change_password(client, student_token):
    res = client.post('/api/v1/auth/change-password', 
        headers={'Authorization': f'Bearer {student_token}'},
        json={'old_password': 'Student@123', 'new_password': 'NewPassword@456'}
    )
    assert res.status_code == 200

    # Test login with new password
    login_res = client.post('/api/v1/auth/login', json={
        'email': 'student@test.edu',
        'password': 'NewPassword@456'
    })
    assert login_res.status_code == 200
