import os
import json
from pinecone import Pinecone
from langchain_community.vectorstores import Pinecone as PineconeLangchain
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.text_splitter import CharacterTextSplitter
from langchain.docstore.document import Document
from dotenv import load_dotenv

load_dotenv()

def get_embeddings():
    return HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

def init_pinecone():
    pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
    return PineconeLangchain.from_existing_index(
        index_name=os.getenv("PINECONE_INDEX_NAME"),
        embedding=get_embeddings(),
        text_key="text"
    )

def load_data_from_json(json_path="first_aid_data.json"):
    try:
        with open(json_path) as f:
            data = json.load(f)
        
        documents = [
            Document(
                page_content=item["text"],
                metadata=item.get("metadata", {})
            ) for item in data
        ]
        
        text_splitter = CharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50
        )
        split_docs = text_splitter.split_documents(documents)
        
        PineconeLangchain.from_documents(
            documents=split_docs,
            embedding=get_embeddings(),
            index_name=os.getenv("PINECONE_INDEX_NAME")
        )
        return True
    except Exception as e:
        print(f"Error loading data: {str(e)}")
        raise e