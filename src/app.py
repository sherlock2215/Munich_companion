import json
import requests
from config import API_KEY, API_URL

class MunichCompanion:

    def __init__(self):
        self.api_key = API_KEY
        self.api_url = API_URL

    def ask(self, user_input,location=None):
        if not self.api_key:
            raise ValueError("API key is missing")

        headers = {
            "Content-Type": "application/json",
            "X-goog-api-key": self.api_key
        }

        prompt = (
            "You are a friendly and knowledgeable Munich companion chatbot. "
            "You guide international students and newcomers, helping them with settling in, social life, culture, and well-being. "
            "If location is provided, give meaningful local insights, fun facts, or nearby suggestions. "
            "If it is fitting add some Baverian slang and explain it"
            "Also mention how our Munich Companion app supports users. Keep answers under 5 lines.\n\n"
            f"User Location: {location if location else 'Unknown'}\n"
            f"User: {user_input}"
        )

        data = {"contents": [{"parts": [{"text": prompt}]}]}
        response = requests.post(self.api_url, headers=headers, data=json.dumps(data))

        if response.status_code != 200:
            return f"Error: {response.status_code}-{response.text}"

        try:
            return response.json()["candidates"][0]["content"]["parts"][0]["text"]
        except Exception:
            return "Unexpected response format"


    def ask_automated(self, answer):
        if not self.api_key:
            raise ValueError("API key is missing")

        headers = {
            "Content-Type": "application/json",
            "X-goog-api-key": self.api_key
        }

        prompt_old = (
            "You are a friendly and knowledgeable Munich companion chatbot. "
            "You guide international students and newcomers, helping them with settling in, social life, culture, and well-being. "
            "If location is provided, give meaningful local insights, fun facts, or nearby suggestions. "
            "If it is fitting add some Baverian slang and explain it"
            "Also mention how our Munich Companion app supports users. Keep answers under 5 lines.\n\n"
        )

        prompt=(
            f"You were given this promt: {prompt_old}."
            f"Your answer was: {answer}."
            "Rate this answer from 1-10, based on the fact if its of value for the user, to notify him about it, or if we should ignore it."
            "If its above a score of 8, then  answer yes, else answer no."
            "Its very important that you answer exactly yes or no."
        )

        data = {"contents": [{"parts": [{"text": prompt}]}]}
        response = requests.post(self.api_url, headers=headers, data=json.dumps(data))

        if response.status_code != 200:
            return f"Error: {response.status_code}-{response.text}"

        try:
            return response.json()["candidates"][0]["content"]["parts"][0]["text"]
        except Exception:
            return "Unexpected response format"



if __name__ == "__main__":
    bot = MunichCompanion()
    print(bot.ask("Any fun things to do today?",
    location={"lat": 48.1599, "lon": 11.5820}))
