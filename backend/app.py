from flask import Flask, request, jsonify
from pinecone_utils import init_pinecone, load_data_from_json
from groq_utils import get_llm
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferWindowMemory
from langchain.prompts import PromptTemplate
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])
# Configuration du prompt personnalisé
PROMPT_TEMPLATE = """Vous êtes un assistant de premiers secours médical. Utilisez le contexte suivant pour répondre à la question.

Contexte:
{context}

Question:
{question}

Instructions pour la réponse:
1. Soyez concis mais précis (2-3 phrases maximum)
2. Mentionnez toujours les sources quand disponibles (ex: "Selon [source]...")
3. Listez les étapes clairement avec des numéros
4. Pour les urgences, commencez par "PROCÉDURE D'URGENCE :"
5. En cas de doute, dites "Consultez immédiatement un professionnel de santé"
5. Si la question ne se trouve pas dans les documents que je te déja données, repondez toi meme avec une explication claire et concise ...
Répondez dans la langue de l'utilisateur quand possible:
"""

prompt = PromptTemplate(
    template=PROMPT_TEMPLATE,
    input_variables=["context", "question"]
)

# Initialisation des composants
llm = get_llm()
vectorstore = init_pinecone()
memory = ConversationBufferWindowMemory(
    k=3,
    memory_key="chat_history",
    return_messages=True,
    output_key='answer'
)

# Configuration de la chaîne de conversation
qa_chain = ConversationalRetrievalChain.from_llm(
    llm=llm,
    retriever=vectorstore.as_retriever(
        search_kwargs={"k": 3}
    ),
    memory=memory,
    combine_docs_chain_kwargs={"prompt": prompt},
    return_source_documents=True,
    output_key='answer',
    verbose=True
)

@app.route('/init', methods=['POST'])
def initialize_data():
    try:
        load_data_from_json()
        return jsonify({
            "status": "success", 
            "message": "Données chargées avec succès"
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Erreur lors du chargement: {str(e)}"
        }), 500

@app.route('/ask', methods=['POST'])
def ask():
    data = request.json
    user_input = data.get('message', '')
    
    if not user_input:
        return jsonify({"error": "Aucun message fourni"}), 400
    
    try:
        # Traitement de la question
        result = qa_chain({"question": user_input})
        
        # Dédoublonnage et sérialisation des documents
        unique_docs = {}
        for doc in result.get("source_documents", []):
            key = (doc.page_content, frozenset(doc.metadata.items()))
            unique_docs[key] = doc
        
        serializable_docs = [{
            "page_content": doc.page_content,
            "metadata": dict(doc.metadata)
        } for doc in unique_docs.values()]
        
        # Formatage de la réponse
        response_data = {
            "answer": result.get("answer", "Aucune réponse générée"),
            "sources": serializable_docs,
            "status": "success"
        }
        
        return jsonify(response_data)
    
    except Exception as e:
        return jsonify({
            "error": f"Erreur lors du traitement: {str(e)}",
            "status": "error"
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)