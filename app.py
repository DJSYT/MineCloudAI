import os
import logging
from flask import Flask, render_template, request, jsonify
from datetime import datetime
import random

# Configure logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key")

# Simple rule-based AI responses for placeholder functionality
AI_RESPONSES = {
    "greetings": [
        "Hello! I'm MineCloud AI, your smart assistant. How can I help you today?",
        "Hi there! Welcome to MineCloud AI. What would you like to know?",
        "Greetings! I'm here to assist you. What's on your mind?",
        "Hey! MineCloud AI at your service. How may I assist you?"
    ],
    "goodbye": [
        "Goodbye! Have a wonderful day!",
        "See you later! Feel free to come back anytime.",
        "Take care! I'll be here whenever you need assistance.",
        "Farewell! It was great chatting with you."
    ],
    "thanks": [
        "You're welcome! Happy to help!",
        "My pleasure! Is there anything else I can assist you with?",
        "Glad I could help! Feel free to ask more questions.",
        "You're very welcome! That's what I'm here for."
    ],
    "about": [
        "I'm MineCloud AI, created by DJS (Debasis Jaga Sebasi). I'm designed to be your intelligent assistant!",
        "MineCloud AI is a smart assistant built by DJS. I'm here to help with various tasks and questions!",
        "I'm part of the MineCloud ecosystem, developed by DJS to provide intelligent assistance."
    ],
    "default": [
        "That's an interesting question! I'm still learning and will be enhanced with advanced AI capabilities soon.",
        "I understand you're asking about that topic. My knowledge base is expanding every day!",
        "Great question! I'm being developed to handle more complex queries in the future.",
        "I appreciate your input! My AI capabilities are being enhanced to better assist you.",
        "That's a thoughtful inquiry! I'm designed to become more intelligent over time."
    ]
}

def get_ai_response(user_message):
    """Generate a rule-based AI response based on user input"""
    message_lower = user_message.lower().strip()
    
    # Check for greetings
    if any(word in message_lower for word in ["hi", "hello", "hey", "greetings", "good morning", "good afternoon", "good evening"]):
        return random.choice(AI_RESPONSES["greetings"])
    
    # Check for goodbye
    elif any(word in message_lower for word in ["bye", "goodbye", "see you", "farewell", "take care"]):
        return random.choice(AI_RESPONSES["goodbye"])
    
    # Check for thanks
    elif any(word in message_lower for word in ["thank", "thanks", "appreciate", "grateful"]):
        return random.choice(AI_RESPONSES["thanks"])
    
    # Check for about queries
    elif any(word in message_lower for word in ["about", "who are you", "what are you", "minecloud", "djs"]):
        return random.choice(AI_RESPONSES["about"])
    
    # Default response
    else:
        return random.choice(AI_RESPONSES["default"])

@app.route('/')
def index():
    """Serve the main chatbot interface"""
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    """Handle chat messages and return AI responses"""
    try:
        data = request.get_json()
        user_message = data.get('message', '').strip()
        
        if not user_message:
            return jsonify({
                'error': 'Message cannot be empty'
            }), 400
        
        # Generate AI response
        ai_response = get_ai_response(user_message)
        
        # Add slight delay to simulate processing (remove in production)
        import time
        time.sleep(0.5)
        
        return jsonify({
            'response': ai_response,
            'timestamp': datetime.now().strftime('%H:%M')
        })
    
    except Exception as e:
        app.logger.error(f"Chat error: {str(e)}")
        return jsonify({
            'error': 'Sorry, I encountered an error. Please try again.'
        }), 500

# Export app for gunicorn
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
