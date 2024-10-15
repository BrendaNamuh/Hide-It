from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from model import clean, run_model

app = Flask(__name__)
CORS(app)

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    return response
# GET request route
@app.route('/api/data', methods=['GET'])
def get_data():
    # Process GET request and return response
    data = {'message': 'Hello from the backend!'}
    return jsonify(data)

# POST request route -> takes posts from frontend + user preferences & returns triggering posts only
@app.route('/api/submit', methods=['POST'])
def submit_data():    
    submitted_data = request.json
    print(submitted_data)
    print("triggers :", submitted_data['triggers'])
    print("threshold :", submitted_data['threshold'])

    # clean posts
    cleaned_data = clean(submitted_data['data'])

    # get user prefs
    triggers = submitted_data['triggers']
    threshold = submitted_data['threshold']

    # get labels based off of post & user prefs
    print('this is the cleaned_data',cleaned_data )
    probability_data = run_model(cleaned_data, triggers, threshold)

    # return the processed result
    return probability_data

@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)

@app.after_request
def apply_csp(response):
    response.headers['Content-Security-Policy'] = "img-src 'self' http://127.0.0.1:5000;"
    return response
if __name__ == '__main__':
    app.run(debug=True)
