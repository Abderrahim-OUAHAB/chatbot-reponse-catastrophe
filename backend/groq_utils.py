from langchain_groq import ChatGroq
import os
from dotenv import load_dotenv

load_dotenv()

def get_llm():
    return ChatGroq(
        temperature=0,
        model_name="llama3-8b-8192",
        api_key=os.getenv("GROQ_API_KEY")
    )