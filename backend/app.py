from flask import Flask,jsonify
from flask_cors import CORS

app=Flask(__name__)

CORS(app)

@app.route('/api/chat',methods=['GET'])
def chat():
    return jsonify({"message":"let's chat"})

if __name__=="__main__":
    app.run(debug=True)