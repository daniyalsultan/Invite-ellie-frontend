from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
import os
import re

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

# Initialize Groq client
GROQ_API_KEY = "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"
client = Groq(api_key=GROQ_API_KEY)

# System prompt for Ellie
SYSTEM_PROMPT = """You are "Ellie", an AI-powered meeting assistant of "INVITE ELLIE" designed to help users manage, transcribe, summarize, and organize their meetings in a smart and human-friendly way. Your tone is warm, conversational, and approachable, making users feel understood and supported. Use natural, everyday language with clear and simple explanations, showing empathy and enthusiasm in your responses.

CRITICAL RESPONSE LENGTH RULES (MUST FOLLOW STRICTLY):
- Keep ALL responses to 2-3 sentences maximum (approximately 20-40 words)
- ABSOLUTE MAXIMUM: 4 lines or 50 words - if you exceed this, you're writing too much
- Be extremely concise - get straight to the point immediately
- One clear answer is better than multiple explanations
- If information is longer, use bullet points (•) but still keep total response short
- Never write long paragraphs or multiple sentences explaining the same thing
- Think: "What's the shortest way to answer this?" and then make it even shorter

CRITICAL FORMATTING RULES:
- NEVER use markdown formatting like asterisks (*), hashes (#), underscores (_), or any special markdown characters
- NEVER use bold, italic, or code formatting
- Use plain text only with bullet points using the bullet character (•)
- Each bullet point should be on its own separate line
- Write like a human colleague would - natural, professional, and friendly
- Use line breaks between ideas for clarity

Complete Invite Ellie Usage Workflow:

Step 1 - Account Setup:
- Sign up for Invite Ellie account
- Complete profile setup with name, email, and preferences
- Verify email address

Step 2 - Integration Setup:
- Go to Integrations page in dashboard
- Connect with Zoom, Microsoft Teams, or Google Meet
- Authorize Invite Ellie to access your calendar
- Grant necessary permissions for bot to join meetings

Step 3 - Workspace and Folder Management:
- Create workspaces for different projects or teams
- Organize meetings into folders within workspaces
- Set folder priorities for long-term memory (important folders kept beyond 90 days)
- Invite team members to collaborate on workspaces

Step 4 - Meeting Scheduling:
- Schedule meetings normally through your calendar (Outlook, Google Calendar, etc.)
- Invite Ellie bot email address to meeting invites (or it auto-joins based on calendar sync)
- Ellie automatically receives meeting invitations

Step 5 - During Meeting:
- Ellie bot joins the meeting automatically as a participant
- Real-time transcription begins automatically
- Ellie captures all spoken content, speaker identification, and timestamps
- No action needed from you during the meeting

Step 6 - Post-Meeting Processing:
- Ellie automatically processes the meeting after it ends
- Generates full transcript with speaker labels
- Creates summary with key points and highlights
- Extracts action items and decisions
- Organizes everything into the appropriate folder

Step 7 - Accessing Meeting Data:
- View transcripts in Transcriptions page
- Access meeting recordings in Meeting Recordings page
- Read summaries and action items in workspace folders
- Search across all meetings using search functionality

Step 8 - Export and Integration:
- Export meeting data to Slack channels
- Push summaries to Notion pages
- Send data to HubSpot for CRM tracking
- Download transcripts as text files
- Share meeting notes with team members

Step 9 - Memory Management:
- Meeting data stored for 90 days by default
- Pin important folders for extended memory
- Access historical meeting context when needed
- Ellie can reference past meetings in conversations

Core Features:
- Workspace and folder organization
- Real-time meeting transcription
- Automatic post-meeting summaries
- Action item extraction
- Meeting memory (90 days, extendable)
- Integration with Zoom, Teams, Google Meet
- Export to Slack, Notion, HubSpot
- Team collaboration and sharing
- Secure data storage

Communication Style:
- Keep responses to 2-3 sentences maximum (20-40 words, absolute max 50 words)
- Write complete, flowing sentences - don't break sentences into separate lines unnecessarily
- Keep related thoughts together in the same sentence or paragraph
- Only use bullet points (•) when listing MULTIPLE distinct items (3 or more items)
- NEVER use bullet points for continuing a sentence or single follow-up thought
- NEVER use bullet points for just one or two items - write them as regular sentences instead
- If you have one main point and a follow-up, write them as connected sentences, not as a bullet point
- Only use line breaks between distinct ideas or when using bullet points for lists
- Be concise, friendly, and helpful
- Use simple everyday words
- Focus on Invite Ellie's meeting management features
- Reference specific steps in the workflow when relevant
- Be conversational like a helpful colleague
- ALWAYS end responses with proper punctuation (full stop/period)
- When asked about steps or workflow, don't list all 9 steps - instead, ask which specific step they need help with or mention the relevant step directly
- Never say "we have 9 steps" and then list only some of them - be accurate or just mention the specific step needed
- Be natural and human-like, not robotic or overly formal
- Write responses as flowing text, not as disconnected phrases on separate lines
- Avoid unnecessary line breaks that make responses feel choppy or robotic"""

def clean_response(text):
    """Remove markdown formatting and special characters from response"""
    if not text:
        return text
    
    # Remove markdown bold/italic
    text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)  # Remove **bold**
    text = re.sub(r'\*(.*?)\*', r'\1', text)  # Remove *italic*
    text = re.sub(r'_(.*?)_', r'\1', text)  # Remove _italic_
    text = re.sub(r'__(.*?)__', r'\1', text)  # Remove __bold__
    
    # Remove markdown headers
    text = re.sub(r'^#+\s*', '', text, flags=re.MULTILINE)
    
    # Remove markdown code blocks
    text = re.sub(r'```[\s\S]*?```', '', text)
    text = re.sub(r'`([^`]+)`', r'\1', text)
    
    # Remove markdown links but keep text
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
    
    # Convert dashes and markdown lists to bullet points (•)
    lines = text.split('\n')
    cleaned_lines = []
    prev_was_bullet = False
    
    for line in lines:
        trimmed_line = line.strip()
        if not trimmed_line:
            # Keep empty lines only if previous line was a bullet point
            if prev_was_bullet:
                cleaned_lines.append('')
            continue
            
        # Convert markdown list items with dashes or asterisks to bullet points
        if re.match(r'^\s*[-*]\s+', trimmed_line):
            # Replace dash or asterisk with bullet point
            cleaned_line = re.sub(r'^\s*[-*]\s+', '• ', trimmed_line)
            cleaned_lines.append(cleaned_line)
            prev_was_bullet = True
        elif re.match(r'^\s*\d+\.\s+', trimmed_line):
            # Convert numbered lists to bullet points
            cleaned_line = re.sub(r'^\s*\d+\.\s+', '• ', trimmed_line)
            cleaned_lines.append(cleaned_line)
            prev_was_bullet = True
        elif trimmed_line.startswith('•'):
            # Already a bullet point
            cleaned_lines.append(trimmed_line)
            prev_was_bullet = True
        else:
            # Regular text - merge with previous line if it wasn't a bullet
            if cleaned_lines and not prev_was_bullet and cleaned_lines[-1] and not cleaned_lines[-1].startswith('•'):
                # Merge with previous line, add space
                cleaned_lines[-1] = cleaned_lines[-1].rstrip() + ' ' + trimmed_line
            else:
                cleaned_lines.append(trimmed_line)
            prev_was_bullet = False
    
    text = '\n'.join(cleaned_lines)
    
    # Remove extra whitespace but keep bullet point spacing
    text = re.sub(r'\n{3,}', '\n\n', text)  # Max 2 newlines
    text = text.strip()
    
    # Fix incorrect single or double bullet points - convert to regular sentences
    lines = text.split('\n')
    bullet_count = sum(1 for line in lines if line.strip().startswith('•'))
    
    # If there are only 1-2 bullet points, convert them to regular sentences
    if 1 <= bullet_count <= 2:
        fixed_lines = []
        for line in lines:
            if line.strip().startswith('•'):
                # Remove bullet and convert to regular sentence
                cleaned = line.strip().replace('•', '').strip()
                # Capitalize first letter if needed
                if cleaned and not cleaned[0].isupper():
                    cleaned = cleaned[0].upper() + cleaned[1:] if len(cleaned) > 1 else cleaned.upper()
                fixed_lines.append(cleaned)
            else:
                fixed_lines.append(line)
        text = '\n'.join(fixed_lines)
        # Merge consecutive lines that are now regular text
        text = re.sub(r'([^\n])\n([^\n•])', r'\1 \2', text)
    
    # Ensure response ends with proper punctuation if it's a sentence
    if text and not text.endswith(('.', '!', '?', ':', '•')):
        # Check if last line is a complete sentence (not a bullet point)
        last_line = text.split('\n')[-1].strip()
        if last_line and not last_line.startswith('•'):
            text = text.rstrip('.!?') + '.'
    
    return text

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message', '')
        conversation_history = data.get('history', [])
        
        if not user_message:
            return jsonify({'error': 'Message is required'}), 400
        
        # Build messages array for Groq API
        messages = [
            {
                "role": "system",
                "content": SYSTEM_PROMPT
            }
        ]
        
        # Add conversation history (last 10 messages to keep context manageable)
        for msg in conversation_history[-10:]:
            if msg.get('sender') == 'user':
                messages.append({
                    "role": "user",
                    "content": msg.get('text', '')
                })
            elif msg.get('sender') == 'ellie':
                messages.append({
                    "role": "assistant",
                    "content": msg.get('text', '')
                })
        
        # Add current user message
        messages.append({
            "role": "user",
            "content": user_message
        })
        
        # Call Groq API with Llama model
        chat_completion = client.chat.completions.create(
            messages=messages,
            model="llama-3.3-70b-versatile",  # Using Llama model
            temperature=0.7,
            max_tokens=150,  # Limited to enforce concise responses (2-3 sentences)
        )
        
        # Extract response
        response_text = chat_completion.choices[0].message.content
        
        # Clean up any markdown formatting that might have slipped through
        response_text = clean_response(response_text)
        
        return jsonify({
            'response': response_text,
            'success': True
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({
            'error': 'An error occurred while processing your request',
            'details': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy'}), 200

if __name__ == '__main__':
    # Run on port 5000 (or adjust as needed)
    app.run(host='0.0.0.0', port=5000, debug=True)

