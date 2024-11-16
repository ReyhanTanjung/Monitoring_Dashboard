# Monitoring Dashboard

## Description
In this project, many of the variables such as MQTT topics, MQTT brokers, and data metrics are currently set as dummy values. These are placeholder values used during development to simulate the functionality of the system. They allow the system to run in a controlled environment without requiring actual IoT devices or data sources to be connected.

## Repository
Make sure to use this command before commit and push changes to the remote repository to prevent this **warning: LF will be replaced by CRLF.**
```
git config --global core.autocrlf false
```

## API Documentation
### GET /config
Description: Retrieves Firebase configuration required for the frontend application.

| Parameter  | Type | Description |
| ------------- |:-------------:|:-------------:|
| None     | N/A     | 	Retrieves Firebase configuration such as API Key, Project ID, and other necessary details. |

Response
```
{
    "apiKey": "your-api-key",
    "authDomain": "your-auth-domain",
    "projectId": "your-project-id",
    "storageBucket": "your-storage-bucket",
    "messagingSenderId": "your-messaging-sender-id",
    "appId": "your-app-id",
    "measurementId": "your-measurement-id"
}
```

### POST /login
Description: Logs the user in using a Firebase ID token.

| Parameter  | Type | Description |
| ------------- |:-------------:|:-------------:|
| idToken     | string     | 	Firebase ID token obtained after a successful login using Firebase Authentication.     |

Response :
```
200 OK: Redirects to the main page (/index) if login is successful.
301 Moved Permanently: Redirects back to the login page if login fails.
```

### GET /index
Description: Displays the dashboard page after successful login.

| Parameter  | Type | Description |
| ------------- |:-------------:|:-------------:|
| None     | N/A     | 	Accesses the dashboard page after a successful login.     |

Response :
```
200 OK: Returns the HTML page of the user's dashboard.
```

### GET /logout
Description: Logs the user out and clears the session.

| Parameter  | Type | Description |
| ------------- |:-------------:|:-------------:|
| None     | N/A     | 	Clears the user session and redirects to the login page.     |

Response :
```
200 OK: User is redirected back to the login page.
```

### GET /api/fetch_data
Description: Retrieves historical data based on the specified time range (startdate and enddate).

| Parameter  | Type | Description |
| ------------- |:-------------:|:-------------:|
| startdate     | string     | 	Start time in `YYYY-MM-DD%20HH:MM:SS` format.     |
| enddate     | string     | 	End time in `YYYY-MM-DD%20HH:MM:SS` format.     |

Example:
```
http://localhost:5000/api/fetch_data?startdate=2024-11-01%2000:12:23&endddate=2024-11-01%2000:15:23
```

Response:
```
200 OK: User is redirected back to the login page.
```

## MQTT Documentation
Documentation is underconstruction

## GCP Deployment
Documentation is underconstruction

## To-Do List

### 1. **Implement Gunicorn for Production Deployment**
- Gunicorn will handle multiple concurrent requests, ensuring better performance and scalability than the built-in Flask development server.
- The application will be set up to run with Gunicorn in the production environment.

### 2. **Implement Supervisor for Process Management**
- Supervisor will be used to ensure that Gunicorn is always running.
- If the Gunicorn process crashes or fails, Supervisor will automatically restart it. This is crucial for maintaining the stability of the system in a production environment.

### 3. **Implement ML API Endpoints for Anomaly Detection**
- The machine learning models will be stored in cloud storage (Google Cloud Storage) for easy access and version control.
- The endpoints will interact with the machine learning models to provide real-time anomaly detection for the system.

### 4. **Fix Dockerfile**
- The Dockerfile should be reviewed and updated

### 5. **Integrate with Evomo Real Data**
- The system will be connected to the Evomo platform’s MQTT broker, subscribing to real data topics (e.g., energy readings from IoT devices).
- The real-time data will be processed by the backend (including anomaly detection) and stored for analysis.
- The dashboard will display real-time data and anomalies, making the monitoring system fully operational with live inputs from Evomo.

## 6. **Implement Firebase Cloud Messaging (FCM) for Anomaly Notifications**
- Set up Firebase in the backend to send notifications to mobile devices via FCM. This involves configuring Firebase credentials and initializing Firebase in the Flask app.