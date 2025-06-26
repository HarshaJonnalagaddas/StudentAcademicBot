import json
import os
import logging
from flask import render_template, request, jsonify, flash, redirect, url_for
from app import app
from gemini_client import get_academic_guidance, get_college_recommendations, get_career_guidance

# Utility function to load JSON data
def load_json_data(filename):
    """Load JSON data from the data directory"""
    try:
        with open(os.path.join('data', filename), 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        logging.error(f"Data file not found: {filename}")
        return {}
    except json.JSONDecodeError:
        logging.error(f"Invalid JSON in file: {filename}")
        return {}

@app.route('/')
def index():
    """Main chatbot interface"""
    return render_template('index.html')

@app.route('/colleges')
def colleges():
    """College search and information page"""
    colleges_data = load_json_data('colleges.json')
    return render_template('colleges.html', colleges=colleges_data.get('colleges', []))

@app.route('/resources')
def resources():
    """Academic resources and study materials page"""
    resources_data = load_json_data('resources.json')
    return render_template('resources.html', resources=resources_data)

@app.route('/api/chat', methods=['POST'])
def chat_api():
    """Chat API endpoint for processing user messages with Gemini integration"""
    try:
        data = request.get_json()
        user_message = data.get('message', '').strip()
        conversation_history = data.get('history', [])
        
        if not user_message:
            return jsonify({'error': 'Message cannot be empty'}), 400
        
        # Check if GEMINI_API_KEY is available
        if os.environ.get("GEMINI_API_KEY"):
            # Use Gemini for intelligent responses
            try:
                gemini_response = get_academic_guidance(user_message, conversation_history)
                return jsonify({
                    'response': gemini_response.response,
                    'timestamp': data.get('timestamp'),
                    'suggestions': gemini_response.suggestions,
                    'confidence': gemini_response.confidence,
                    'source': 'gemini'
                })
            except Exception as gemini_error:
                logging.error(f"Gemini integration error: {str(gemini_error)}")
                # Fall back to keyword matching if Gemini fails
                pass
        
        # Fallback to keyword-based responses when Gemini is not available
        chat_responses = load_json_data('chat_responses.json')
        response = find_best_response(user_message.lower(), chat_responses)
        suggestions = get_suggestions(user_message.lower(), chat_responses)
        
        # Add a note about limited functionality without API key
        if not os.environ.get("GEMINI_API_KEY"):
            response += "\n\n*Note: I'm currently running in basic mode. For more personalized and intelligent responses, please configure the Gemini API key.*"
        
        return jsonify({
            'response': response,
            'timestamp': data.get('timestamp'),
            'suggestions': suggestions,
            'confidence': 0.7,
            'source': 'fallback'
        })
        
    except Exception as e:
        logging.error(f"Chat API error: {str(e)}")
        return jsonify({'error': 'An error occurred processing your message'}), 500

def find_best_response(message, responses):
    """Find the best response based on keywords (placeholder for Gemini integration)"""
    message = message.lower()
    
    # Check for specific keywords and return appropriate responses
    for category, data in responses.items():
        if category == 'keywords':
            continue
            
        keywords = data.get('keywords', [])
        if any(keyword in message for keyword in keywords):
            return data.get('response', 'I understand your question, but I need more information to provide a helpful answer.')
    
    # Default response
    return responses.get('default', {}).get('response', 'I\'m here to help with your academic questions! Try asking about colleges, courses, or career guidance.')

def get_suggestions(message, responses):
    """Get suggested follow-up questions"""
    suggestions = []
    for category, data in responses.items():
        if category in ['keywords', 'default']:
            continue
        suggestions.extend(data.get('suggestions', []))
    
    # Return up to 3 random suggestions
    import random
    return random.sample(suggestions, min(3, len(suggestions))) if suggestions else []

@app.route('/api/colleges/search', methods=['GET'])
def search_colleges():
    """API endpoint for college search with optional AI recommendations"""
    try:
        query = request.args.get('q', '').lower()
        location = request.args.get('location', '').lower()
        college_type = request.args.get('type', '').lower()
        
        colleges_data = load_json_data('colleges.json')
        colleges = colleges_data.get('colleges', [])
        
        # Filter colleges based on search criteria
        filtered_colleges = []
        for college in colleges:
            # Check if college matches search criteria
            matches_query = not query or query in college.get('name', '').lower() or query in college.get('description', '').lower()
            matches_location = not location or location in college.get('location', '').lower()
            matches_type = not college_type or college_type in college.get('type', '').lower()
            
            if matches_query and matches_location and matches_type:
                filtered_colleges.append(college)
        
        # If Gemini API is available and user provided preferences, get AI recommendations
        ai_recommendations = None
        if os.environ.get("GEMINI_API_KEY") and (query or location or college_type):
            try:
                preferences = {
                    'interests': query,
                    'location': location,
                    'type': college_type
                }
                ai_recommendations = get_college_recommendations(preferences)
            except Exception as e:
                logging.warning(f"AI recommendations failed: {str(e)}")
        
        response_data = {
            'colleges': filtered_colleges,
            'total': len(filtered_colleges)
        }
        
        if ai_recommendations:
            response_data['ai_recommendations'] = ai_recommendations
            
        return jsonify(response_data)
        
    except Exception as e:
        logging.error(f"College search error: {str(e)}")
        return jsonify({'error': 'An error occurred during search'}), 500

@app.route('/api/college/<int:college_id>')
def get_college_details(college_id):
    """Get detailed information about a specific college"""
    try:
        colleges_data = load_json_data('colleges.json')
        colleges = colleges_data.get('colleges', [])
        
        college = next((c for c in colleges if c.get('id') == college_id), None)
        
        if not college:
            return jsonify({'error': 'College not found'}), 404
            
        return jsonify(college)
        
    except Exception as e:
        logging.error(f"College details error: {str(e)}")
        return jsonify({'error': 'An error occurred fetching college details'}), 500

@app.route('/api/career-guidance', methods=['POST'])
def career_guidance_api():
    """API endpoint for career guidance using Gemini"""
    try:
        data = request.get_json()
        major_or_interests = data.get('major_or_interests', '').strip()
        
        if not major_or_interests:
            return jsonify({'error': 'Please provide a major or career interest'}), 400
        
        if os.environ.get("GEMINI_API_KEY"):
            try:
                guidance = get_career_guidance(major_or_interests)
                return jsonify({
                    'guidance': guidance,
                    'source': 'gemini'
                })
            except Exception as e:
                logging.error(f"Career guidance error: {str(e)}")
        
        # Fallback response
        fallback_response = f"For career guidance related to {major_or_interests}, I recommend checking our career resources section and speaking with a career counselor at your school."
        
        return jsonify({
            'guidance': fallback_response,
            'source': 'fallback'
        })
        
    except Exception as e:
        logging.error(f"Career guidance API error: {str(e)}")
        return jsonify({'error': 'An error occurred processing your request'}), 500

@app.errorhandler(404)
def not_found_error(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    return render_template('500.html'), 500
