from flask import Flask, request, jsonify
from pinecone_utils import init_pinecone, load_data_from_json
from groq_utils import get_llm
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferWindowMemory
from langchain.prompts import PromptTemplate
from flask_cors import CORS
import os
import requests

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

# Prompt
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
8. Régler le langage et l'accent selon la langue du demandeur.
9. Réspondez en anglais si la langue du demandeur est autre que français ou arabe.
10. Réspondez en arabe si la langue du demandeur est arabe.
11. Organiser bien vos phrases et vos paragraphes , sauter les lignes etc .

Objectif :
Réduire le risque vital en quelques secondes. Toujours inciter à appeler les secours ou consulter un médecin.
"""

prompt = PromptTemplate(
    template=PROMPT_TEMPLATE,
    input_variables=["context", "question"]
)

llm = get_llm()
vectorstore = init_pinecone()
memory = ConversationBufferWindowMemory(
    k=1,
    memory_key="chat_history",
    return_messages=True,
    output_key='answer'
)

qa_chain = ConversationalRetrievalChain.from_llm(
    llm=llm,
    retriever=vectorstore.as_retriever(search_kwargs={"k": 3}),
    memory=memory,
    combine_docs_chain_kwargs={"prompt": prompt},
    return_source_documents=True,
    output_key='answer',
    verbose=True
)

# Fonction Geoapify
def find_nearest_hospital(lat, lon):
    api_key = os.getenv("GEOAPIFY_API_KEY")
    url = (
        f"https://api.geoapify.com/v2/places?"
        f"categories=healthcare.hospital&"
        f"filter=circle:{lon},{lat},5000&"
        f"bias=proximity:{lon},{lat}&"
        f"limit=1&"
        f"apiKey={api_key}"
    )
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            features = data.get("features", [])
            if features:
                hospital = features[0]
                props = hospital.get("properties", {})
                name = props.get("name", "Hôpital sans nom")
                address = props.get("formatted", "Adresse inconnue")
                maps_link = f"https://www.google.com/maps/search/?api=1&query={lat},{lon}"
                return f"\n\nHôpital le plus proche : {name}, {address}. Voir sur la carte : {maps_link}"
            else:
                return "\n\nAucun hôpital trouvé dans un rayon de 5 km."
        else:
            return "\n\nErreur Geoapify lors de la récupération de l'hôpital."
    except Exception:
        return "\n\nErreur lors de la recherche avec Geoapify."

@app.route('/init', methods=['POST'])
def initialize_data():
    try:
        load_data_from_json()
        return jsonify({"status": "success", "message": "Données chargées avec succès"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
@app.route('/ask', methods=['POST'])
def ask():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Données JSON manquantes", "status": "error"}), 400

    user_input = data.get('message', '')
    if not user_input:
        return jsonify({"error": "Aucun message fourni", "status": "error"}), 400

    try:
        # Appel à la chaîne de conversation
        result = qa_chain.invoke({"question": user_input})
        
        # Conversion sécurisée de la réponse
        answer = ""
        if isinstance(result.get("answer"), dict):
            answer = json.dumps(result["answer"])  # Convertit le dict en string JSON
        else:
            answer = str(result.get("answer", "Aucune réponse générée"))

        # Gestion de la localisation
        location = data.get('location', {})
        if location and isinstance(location, dict):
            try:
                lat = location.get("latitude")
                lon = location.get("longitude")
                if lat is not None and lon is not None:
                    lat = float(lat)
                    lon = float(lon)
                    if lat != 0 and lon != 0:
                        hospital_info = find_nearest_hospital(lat, lon)
                        if hospital_info:
                            answer += str(hospital_info)
            except (TypeError, ValueError) as e:
                print(f"Erreur de conversion de coordonnées: {str(e)}")

        # Préparation des sources
        sources = []
        seen = set()
        for doc in result.get("source_documents", []):
            try:
                content = str(doc.page_content) if hasattr(doc, 'page_content') else "Contenu non disponible"
                metadata = doc.metadata if hasattr(doc, 'metadata') else {}
                key = hash(content + str(metadata))
                if key not in seen:
                    seen.add(key)
                    sources.append({
                        "page_content": content,
                        "metadata": metadata
                    })
            except Exception as e:
                print(f"Erreur traitement document: {str(e)}")
                continue

        return jsonify({
            "answer": answer,
            "sources": sources,
            "status": "success"
        })

    except Exception as e:
        print(f"Erreur lors du traitement: {str(e)}", flush=True)
        return jsonify({
            "error": "Erreur interne du serveur",
            "status": "error",
            "details": str(e)
        }), 500

def find_nearest_hospital(lat, lon):
    api_key = os.getenv("GEOAPIFY_API_KEY") or "1eaa80850f9f47e28a45b23f50424cd2"
    url = f"https://api.geoapify.com/v2/places?categories=healthcare.hospital&filter=circle:{lon},{lat},5000&bias=proximity:{lon},{lat}&limit=1&apiKey={api_key}"
    
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()

        if not data.get("features"):
            return "\n\nAucun hôpital trouvé dans un rayon de 5 km."

        feature = data["features"][0]
        props = feature.get("properties", {})
        raw_details = props.get("datasource", {}).get("raw", {})
        contact = props.get("contact", {})

        # Extraction des informations clés
        hospital_info = {
            "name": props.get("name", "Établissement médical"),
            "address": props.get("formatted", "Adresse non disponible"),
            "phone": contact.get("phone") or raw_details.get("phone"),
            "emergency": raw_details.get("emergency") == "yes",
            "website": props.get("website") or raw_details.get("website"),
            "distance": props.get("distance", 0),  # en mètres
            "coordinates": feature.get("geometry", {}).get("coordinates", [])
        }

        # Construction du message
        result = "\n\nÉTABLISSEMENT MÉDICAL PROCHE :"
        result += f"\n🏥 {hospital_info['name']}"
        
        if hospital_info['emergency']:
            result += " (Service d'urgence disponible)"
            
        result += f"\n📍 {hospital_info['address']}"
        
        if hospital_info['phone']:
            result += f"\n📞 {hospital_info['phone']}"
            
        if hospital_info['website']:
            result += f"\n🌐 {hospital_info['website']}"
            
        if hospital_info['coordinates']:
            lon, lat = hospital_info['coordinates']
            maps_link = f"https://www.google.com/maps/search/?api=1&query={lat},{lon}"
            result += f"\n🗺️ Itinéraire: {maps_link}"
            
        result += f"\n📏 Distance: {hospital_info['distance']} mètres"
        
        if hospital_info['emergency']:
            result += "\n\n⚠️ En cas d'urgence vitale, appelez immédiatement le 15 (SAMU) ou le 112"

        return result

    except requests.exceptions.RequestException as e:
        print(f"Erreur API Geoapify: {str(e)}")
        return "\n\nService de localisation temporairement indisponible"
    except Exception as e:
        print(f"Erreur inattendue: {str(e)}")
        return "\n\nErreur lors de la recherche d'établissements médicaux"
    
    
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
