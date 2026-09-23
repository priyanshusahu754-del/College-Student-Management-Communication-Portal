from datetime import datetime, date, timedelta

def test_attendance_flow(client, teacher_token, student_token, seed_data):
    subject = seed_data['subject']
    student = seed_data['student']

    # 1. Create session
    session_res = client.post('/api/v1/attendance/sessions', 
        headers={'Authorization': f'Bearer {teacher_token}'},
        json={
            'subject_id': subject.id,
            'session_date': str(date.today()),
            'topic': 'Unit 1 Introduction'
        }
    )
    assert session_res.status_code in [200, 201]
    session_id = session_res.get_json()['data']['id']

    # 2. Mark attendance
    records_res = client.post('/api/v1/attendance/records',
        headers={'Authorization': f'Bearer {teacher_token}'},
        json={
            'session_id': session_id,
            'records': [
                {'student_id': student.id, 'status': 'present', 'remarks': 'Good attendance'}
            ]
        }
    )
    assert records_res.status_code == 200

    # 3. Student summary check
    summary_res = client.get('/api/v1/attendance/student-summary', headers={'Authorization': f'Bearer {student_token}'})
    assert summary_res.status_code == 200
    summary_data = summary_res.get_json()['data']
    assert summary_data['overall_percentage'] == 100.0


def test_assignment_workflow(client, teacher_token, student_token, seed_data):
    subject = seed_data['subject']
    student = seed_data['student']

    # 1. Teacher creates assignment
    create_res = client.post('/api/v1/assignments',
        headers={'Authorization': f'Bearer {teacher_token}'},
        json={
            'title': 'Test Assignment 1',
            'description': 'Solve questions 1 to 5',
            'subject_id': subject.id,
            'due_date': (datetime.utcnow() + timedelta(days=3)).isoformat(),
            'total_marks': 100
        }
    )
    assert create_res.status_code == 201
    assignment_id = create_res.get_json()['data']['id']

    # 2. Student submits assignment
    submit_res = client.post(f'/api/v1/assignments/{assignment_id}/submit',
        headers={'Authorization': f'Bearer {student_token}'},
        json={'submission_text': 'Here are my solutions to questions 1-5'}
    )
    assert submit_res.status_code == 201
    sub_id = submit_res.get_json()['data']['id']

    # 3. Teacher grades assignment
    grade_res = client.patch(f'/api/v1/assignments/submissions/{sub_id}/grade',
        headers={'Authorization': f'Bearer {teacher_token}'},
        json={'marks': 95.0, 'feedback': 'Great work!'}
    )
    assert grade_res.status_code == 200
    assert grade_res.get_json()['data']['marks'] == 95.0
    assert grade_res.get_json()['data']['status'] == 'graded'


def test_event_registration(client, admin_token, student_token):
    # 1. Admin creates event
    ev_res = client.post('/api/v1/events',
        headers={'Authorization': f'Bearer {admin_token}'},
        json={
            'title': 'Coding Marathon 2025',
            'description': '24 hour challenge',
            'venue': 'Lab 4',
            'start_datetime': (datetime.utcnow() + timedelta(days=5)).isoformat(),
            'end_datetime': (datetime.utcnow() + timedelta(days=6)).isoformat(),
            'capacity': 50
        }
    )
    assert ev_res.status_code == 201
    event_id = ev_res.get_json()['data']['id']

    # 2. Student registers
    reg_res = client.post(f'/api/v1/events/{event_id}/register',
        headers={'Authorization': f'Bearer {student_token}'}
    )
    assert reg_res.status_code == 201

    # 3. Duplicate registration rejected
    dup_res = client.post(f'/api/v1/events/{event_id}/register',
        headers={'Authorization': f'Bearer {student_token}'}
    )
    assert dup_res.status_code == 400
