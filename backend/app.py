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
PROMPT_TEMPLATE = """Vous êtes RespoBot, un assistant d'urgence spécialisé dans les catastrophes. Votre mission est de donner des réponses claires, fiables, directes et localisées.

Contexte:
{context}

Question:
{question}

Règles strictes:
1. Si la question est une urgence (brûlure, crise cardiaque, inconscience...), commencez par "PROCÉDURE D'URGENCE :"
2. Utilisez des phrases brèves. Maximum 3 phrases.
3. Si possible, ajoutez un numéro d'urgence ou un établissement local dans la ville concernée (ex: Hôpital Ibn Sina à Rabat, 0537-67-98-00).
4. Toujours dire "Appelez le 15 (SAMU)" ou "le 19 (Police)" si la vie est en danger.
5. Si l'information ne vient pas des documents, reformulez une réponse fiable basée sur les bonnes pratiques de premiers secours.
6. N'inventez jamais une source.
7. Répondez dans la langue du demandeur si identifiable.

Objectif :
Réduire le risque vital en quelques secondes. Toujours inciter à appeler les secours ou consulter un médecin.
"""

prompt = PromptTemplate(
    template=PROMPT_TEMPLATE,
    input_variables=["context", "question"]
)

# Initialisation des composants
llm = get_llm()
vectorstore = init_pinecone()
memory = ConversationBufferWindowMemory(
    k=1,
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