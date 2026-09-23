# Operating system ke environment variables access karne ke liye os module import kar rahe hain
import os
# Application factory function create_app ko app package se import kar rahe hain
from app import create_app

# Environment variable se FLASK_ENV ki value le rahe hain, default 'development' rahegi
env = os.getenv('FLASK_ENV', 'development')
# Flask application instance create kar rahe hain specified environment ke saath
app = create_app(env)

# Check kar rahe hain ki kya script directly execute ho rahi hai
if __name__ == '__main__':
    # Server chalane ke liye port number fetch kar rahe hain, default 5000 set kiya hai
    port = int(os.getenv('PORT', 5000))
    # Flask development server start kar rahe hain 0.0.0.0 host aur debug mode on ke saath
    app.run(host='0.0.0.0', port=port, debug=True)

