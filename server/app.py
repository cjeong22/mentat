import requests 
import base64
import io
from PIL import Image
from openai import OpenAI

import constants

from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
client = OpenAI(api_key=constants.API_KEY)

CORS(app)
@app.route('/')
def home():
    return 'Hello, World'

@app.route('/receive', methods = ["POST"])
def receive_screenshot():
    data = request.get_json()
    prompt = "I'm stuck on this math problem. Can I get a hint? Keep the hint very brief, and give me only one hint."
    response = client.chat.completions.create(
        model = constants.DEPLOYMENT,
        messages = [
            {
                "role": "system",
                "content": "You are a helpful assistant.",
            },
            {
                "role": "user", 
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/png;base64,{data["image"]}"
                        }
                    }
                ]
            }
        ],
        max_tokens=4096,
        temperature=1.0,
        top_p=1.0
    )
    text = response.choices[0].message.content
    return jsonify({"message": text}), 201

if __name__ == '__main__':
    app.run(debug=True)