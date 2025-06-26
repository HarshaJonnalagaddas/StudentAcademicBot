import json
import logging
import os

from google import genai
from google.genai import types
from pydantic import BaseModel


# This API key is from Gemini Developer API Key, not vertex AI API Key
# TODO: Add your GEMINI_API_KEY to environment variables.
def get_gemini_client():
    """Get Gemini client, only initialize when API key is available"""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not set")
    return genai.Client(api_key=api_key)


class ChatResponse(BaseModel):
    response: str
    suggestions: list = []
    confidence: float = 1.0


def get_academic_guidance(user_message: str, conversation_history: list = None) -> ChatResponse:
    try:
        # Build conversation context
        conversation_context = ""
        if conversation_history:
            for msg in conversation_history[-5:]:  # Last 5 messages for context
                role = "User" if msg.get('sender') == 'user' else "Assistant"
                conversation_context += f"{role}: {msg.get('content', '')}\n"
        
        # Create comprehensive system prompt for academic guidance
        system_prompt = """You are AcademicBot, an expert academic guidance counselor and educational assistant advicnig students on career paths and education counselling in India. Your role is to provide helpful, accurate, and personalized guidance to students based on their questions and academic needs. Always be encouraging, supportive, and provide actionable advice. If you don't know the answer, suggest relevant resources or next steps. keep the rsponses brief and to the point, focusing on practical advice and next steps.avoid symbols lik *,** or _ in the response. Do not use any markdown formatting."""

        # Prepare the full prompt with context
        full_prompt = f"""Context from previous conversation:
{conversation_context}

Current question: {user_message}

Please provide helpful academic guidance for this question."""

        client = get_gemini_client()
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[
                types.Content(role="user", parts=[types.Part(text=full_prompt)])
            ],
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                temperature=0.7,  # Balanced creativity and consistency
                max_output_tokens=1000
            )
        )

        if response.text:
            # Extract suggestions from response (look for questions at the end)
            response_text = response.text
            suggestions = extract_suggestions_from_response(response_text)
            
            return ChatResponse(
                response=response_text,
                suggestions=suggestions,
                confidence=0.9
            )
        else:
            raise ValueError("Empty response from Gemini model")

    except Exception as e:
        logging.error(f"Gemini API error: {str(e)}")
        # Fallback response when Gemini is unavailable
        return ChatResponse(
            response="I'm having trouble connecting to my AI service right now. Please try again in a moment, or feel free to browse our college directory and resources in the meantime.",
            suggestions=[
                "Browse our college directory",
                "Check out academic resources",
                "Try asking your question again"
            ],
            confidence=0.1
        )


def extract_suggestions_from_response(response_text: str) -> list:
    """Extract potential follow-up questions from Gemini's response"""
    suggestions = []
    
    # Look for question patterns in the response
    lines = response_text.split('\n')
    for line in lines:
        line = line.strip()
        if line.endswith('?') and len(line) > 10 and len(line) < 100:
            # Remove common prefixes
            for prefix in ["Would you like to", "Are you interested in", "Do you want to", "Have you considered"]:
                if line.startswith(prefix):
                    suggestions.append(line)
                    break
            else:
                # Add other questions that seem like suggestions
                if any(word in line.lower() for word in ["major", "college", "career", "study", "program"]):
                    suggestions.append(line)
    
    # Limit to 3 suggestions
    return suggestions[:3]


def get_college_recommendations(preferences: dict) -> str:
    try:
        system_prompt = """You are a college admissions expert. Provide personalized college recommendations based on the user's preferences. Include a mix of reach, match, and safety schools when possible. For each recommendation, briefly explain why it's a good fit."""

        prompt = f"""Based on these preferences, recommend suitable colleges:
{json.dumps(preferences, indent=2)}

Please provide 3-5 college recommendations with brief explanations of why each would be a good fit."""

        client = get_gemini_client()
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                temperature=0.6,
                max_output_tokens=800
            )
        )

        return response.text or "I couldn't generate college recommendations at this time. Please try browsing our college directory."

    except Exception as e:
        logging.error(f"College recommendation error: {str(e)}")
        return "I'm having trouble generating recommendations right now. Please check our college directory for options that match your interests."


def get_career_guidance(major_or_interests: str) -> str:
    try:
        system_prompt = """You are a career counselor with expertise in connecting academic studies to career opportunities. Provide comprehensive career guidance including job prospects, skills needed, and career paths."""

        prompt = f"""Provide career guidance for someone interested in: {major_or_interests}

Include:
1. Common career paths and job titles
2. Skills typically needed
3. Job market outlook
4. Salary expectations (general ranges)
5. Ways to gain relevant experience

Keep the response encouraging and practical."""

        client = get_gemini_client()
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                temperature=0.7,
                max_output_tokens=200
            )
        )

        return response.text or "I couldn't provide career guidance at this time. Please check our career resources section for helpful information."

    except Exception as e:
        logging.error(f"Career guidance error: {str(e)}")
        return "I'm having trouble accessing career information right now. Please explore our career resources section for guidance."


def analyze_academic_profile(profile_data: dict) -> str:
    try:
        system_prompt = """You are an academic advisor providing personalized guidance based on a student's academic profile. Be encouraging while providing honest, constructive feedback."""

        prompt = f"""Analyze this student's academic profile and provide personalized advice:
{json.dumps(profile_data, indent=2)}

Provide advice on:
1. Academic strengths and areas for improvement
2. College application strategy
3. Ways to strengthen their profile
4. Realistic college targets
5. Next steps for academic success

Be encouraging but realistic in your assessment."""

        client = get_gemini_client()
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                temperature=0.6,
                max_output_tokens=200
            )
        )

        return response.text or "I couldn't analyze your profile at this time. Please consider scheduling a consultation with a school counselor."

    except Exception as e:
        logging.error(f"Profile analysis error: {str(e)}")
        return "I'm having trouble analyzing your profile right now. Please try again later or consult with your school counselor."