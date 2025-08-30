import google.generativeai as genai
import os


class GeminiService:
    def __init__(self):
        try:
            genai.configure(api_key=os.environ["GOOGLE_API_KEY"])
            self.model = genai.GenerativeModel("gemini-1.5-flash")
        except KeyError:
            print("!!! A variável de ambiente GOOGLE_API_KEY não foi configurada. !!!")
            self.model = None

    def generate_content(self, prompt: str) -> str:
        if not self.model:
            return "Erro: A API Key do Gemini não foi configurada."
        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"Erro ao chamar a API do Gemini: {e}")
            return "Ocorreu um erro ao se comunicar com a API do Gemini."
