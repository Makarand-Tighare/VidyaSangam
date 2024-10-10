from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

# Function to get LinkedIn user profile
@app.route('/api/linkedin/userId', methods=['GET'])
def get_linkedin_user_id():
    try:
        # Extract the Authorization header
        authorization_header = request.headers.get('Authorization')

        if not authorization_header or not authorization_header.startswith('Bearer '):
            return jsonify({'error': 'Authorization header missing or invalid'}), 401
        
        # Extract access token from the header
        access_token = authorization_header.split(' ')[1]
        print(f'Access Token: {access_token}')

        # LinkedIn API URL for fetching user profile
        url = 'https://api.linkedin.com/v2/me'

        # Set up headers
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }

        # Send request to LinkedIn API
        response = requests.get(url, headers=headers, timeout=5)  # 5 seconds timeout

        # Handle LinkedIn API response
        if response.status_code == 200:
            data = response.json()
            # Return LinkedIn user ID or any other required information
            return jsonify({'linkedInUserId': data.get('id')}), 200
        else:
            error_data = response.json()
            print(f'Error fetching user data: {error_data}')  # Log the error details
            return jsonify({'error': error_data.get('message', 'Unknown error')}), response.status_code

    except requests.exceptions.Timeout:
        return jsonify({'error': 'Request timed out'}), 504
    except Exception as e:
        print(f'Error fetching LinkedIn user data: {e}')  # Log the error for debugging
        return jsonify({'error': 'Failed to fetch user data from LinkedIn'}), 500

if __name__ == '__main__':
    app.run(debug=True)
