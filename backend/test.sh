#!/bin/bash

# Initialiser les données
echo "Chargement des données..."
curl -X POST http://localhost:5000/init
echo ""

# Attendre 2 secondes
sleep 5

# Poser une question
echo "Poser une question..."
curl -X POST http://localhost:5000/ask \
-H "Content-Type: application/json" \
-d '{"message":"Que faire pour une crise cardiaque ?"}'
echo ""
