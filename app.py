from flask import Flask, request, jsonify, render_template, send_file
from gtts import gTTS
import os
import google.generativeai as genai

app = Flask(__name__)

# Configure Gemini API
genai.configure(api_key=os.environ["api"])
generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 1024,
    "response_mime_type": "text/plain",
}

# Initialize the model
model = genai.GenerativeModel(
    model_name="gemini-2.0-flash-exp",
    generation_config=generation_config,
)

# Render the index page
@app.route('/')
def index():
    return render_template('index.html')

# Process the text: Generate chat response & create audio file
@app.route('/process_text', methods=['POST'])
def process_text():
    data = request.json
    recognized_text = data.get("text", "")  # Use "text" instead of "message"

    # Generate chatbot response
    context = [f"input: {recognized_text} in 10 line"]
    response = model.generate_content(context)
    bot_response = response.text.strip()

    # Remove "**" (double asterisks) from the response
    bot_response = bot_response.replace("**", "")
    bot_response = bot_response.replace("*", "")

    print("Received from JavaScript:", recognized_text)
    print("Bot Response:", bot_response)

    # Convert chatbot response to speech
    speck = gTTS(text=bot_response, lang='mr')
    audio_path = 'static/audio.mp3'  # Store in static folder
    speck.save(audio_path)

    return jsonify({'message': bot_response, 'audio': audio_path})

# Serve the audio file
@app.route('/audio')
def audio():
    return send_file('static/audio.mp3', mimetype='audio/mpeg')

@app.route('/delete')
def delete():
    os.remove('static/audio.mp3')
    return jsonify({'message':'file deleted'})

if __name__ == '__main__':
    app.run(debug=True)
