# StudentAcademicBot
# AcademicBot - Student Academic Guidance Chatbot

A comprehensive web application built with Flask and vanilla JavaScript that provides intelligent academic guidance to students through an AI-powered chatbot interface.
A Student Academic guidance and assistance chatbot focused on providing career guidance and support to students in selecting universities and excelling in education.
## Features

- **AI-Powered Chatbot**: Integration with Google Gemini 2.0 Flash for intelligent academic guidance
- **College Directory**: Searchable database of colleges with detailed information
- **Academic Resources**: Study guides, tools, and career resources
- **Career Guidance**: Personalized career advice and recommendations
- **Responsive Design**: Modern, mobile-friendly interface using Bootstrap 5
- **Real-time Chat**: Interactive chat interface with typing indicators and suggestions

## Prerequisites

- Python 3.8 or higher
- Google Gemini API key (free at https://aistudio.google.com/)

## Installation

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd academicbot
   ```

2. **Create a virtual environment** (recommended)
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements_localhost.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file and add your API keys:
   ```
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   SECRET_KEY=your_secret_key_here
   ```

5. **Get your Gemini API Key**
   - Go to [Google AI Studio](https://aistudio.google.com/)
   - Sign in with your Google account
   - Click "Get API Key"
   - Create a new API key
   - Copy the key to your `.env` file

## Running the Application

### Option 1: Using the local development script
```bash
python run_localhost.py
```

### Option 2: Using the main application file
```bash
python main.py
```

### Option 3: Using Flask directly
```bash
flask run --host=127.0.0.1 --port=5000 --debug
```

The application will be available at: http://localhost:5000

## Project Structure

```
academicbot/
├── app.py                 # Flask application setup
├── main.py               # Application entry point
├── run_localhost.py      # Local development server
├── routes.py             # API endpoints and page routes
├── gemini_client.py      # Google Gemini API integration
├── requirements_localhost.txt # Python dependencies for localhost
├── .env                  # Environment variables (create from .env.example)
├── data/                 # JSON data files
│   ├── colleges.json     # College database
│   ├── chat_responses.json # Fallback chat responses
│   └── resources.json    # Academic resources
├── static/               # Static assets
│   ├── css/
│   │   └── style.css     # Custom styling
│   └── js/
│       ├── main.js       # Global JavaScript utilities
│       ├── chat.js       # Chat interface functionality
│       └── colleges.js   # College search functionality
└── templates/            # HTML templates
    ├── base.html         # Base template
    ├── index.html        # Chat interface
    ├── colleges.html     # College directory
    ├── resources.html    # Academic resources
    ├── 404.html          # Error pages
    └── 500.html
```

## API Endpoints

- `GET /` - Main chat interface
- `GET /colleges` - College directory page
- `GET /resources` - Academic resources page
- `POST /api/chat` - Chat API for processing messages
- `GET /api/colleges/search` - College search with filters
- `GET /api/college/<id>` - Get specific college details
- `POST /api/career-guidance` - Career guidance API

## Configuration

### Environment Variables

- `GEMINI_API_KEY` - Your Google Gemini API key (required for AI features)
- `SECRET_KEY` - Flask secret key for sessions
- `FLASK_ENV` - Environment (development/production)
- `FLASK_DEBUG` - Enable debug mode
- `HOST` - Server host (default: 127.0.0.1)
- `PORT` - Server port (default: 5000)

### Dual Mode Operation

The application operates in two modes:

1. **AI Mode**: When `GEMINI_API_KEY` is configured
   - Intelligent responses using Google Gemini 2.0 Flash
   - Personalized college recommendations
   - Advanced career guidance

2. **Basic Mode**: When API key is not available
   - Keyword-based responses
   - Static college search
   - Basic functionality

## Usage

1. **Chat Interface**: Ask questions about colleges, majors, career paths, study tips, etc.
2. **College Search**: Filter colleges by location, type, and programs
3. **Academic Resources**: Access study guides, tools, and career resources
4. **Career Guidance**: Get personalized career advice based on interests

## Troubleshooting

### Common Issues

1. **Import Error**: Make sure all dependencies are installed
   ```bash
   pip install -r requirements_localhost.txt
   ```

2. **API Key Error**: Ensure your GEMINI_API_KEY is correctly set in .env
3. **Port Already in Use**: Change the port in .env or use a different port
4. **Static Files Not Loading**: Make sure you're running from the project root directory

### Debug Mode

Enable debug mode by setting `FLASK_DEBUG=True` in your .env file. This provides:
- Detailed error messages
- Auto-reload on code changes
- Interactive debugger

## Deployment

For production deployment:

1. Set `FLASK_ENV=production` in .env
2. Set `FLASK_DEBUG=False`
3. Use a production WSGI server like Gunicorn:
   ```bash
   gunicorn --bind 0.0.0.0:5000 main:app
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For questions or issues:
1. Check the troubleshooting section
2. Review the console logs for error messages
3. Ensure all environment variables are properly set
4. Verify your Gemini API key is valid
