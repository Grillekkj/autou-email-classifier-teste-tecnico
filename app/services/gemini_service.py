import google.generativeai as genai
import os


class GeminiService:
    def __init__(self):
        self.api_key = os.environ.get("GOOGLE_API_KEY")
        if not self.api_key:
            raise RuntimeError(
                "A variável de ambiente GOOGLE_API_KEY não foi configurada."
            )
        genai.configure(api_key=self.api_key)

    def generate_content(
        self, prompt: str, model_name: str = "gemini-1.5-flash"
    ) -> str:
        try:
            model = genai.GenerativeModel(
                model_name,
                generation_config={
                    "temperature": 0.2,  # Criatividade
                    "top_p": 0.8,  # Diversidade de saída
                    "top_k": 20,  # Limite de tokens mais prováveis
                    "max_output_tokens": 512,  # Máximo de tokens na resposta
                },
            )
            response = model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"Erro ao chamar a API do Gemini com o modelo {model_name}: {e}")
            return "Ocorreu um erro ao se comunicar com a API do Gemini."
