from flask import Flask, request, jsonify
from flask_cors import CORS
from gensim.models import KeyedVectors
import numpy as np
import os

app = Flask(__name__)
CORS(app)

print("Chargement du modèle word2vec français...")
model = None

MODEL_PATH = 'frWac_non_lem_no_postag_no_phrase_200_cbow_cut100.bin'

try:
    if os.path.exists(MODEL_PATH):
        model = KeyedVectors.load_word2vec_format(
            MODEL_PATH, binary=True, unicode_errors='ignore')
        print("Modèle chargé avec succès!")
    else:
        print(f"ERREUR: Le fichier modèle n'existe pas: {MODEL_PATH}")
        print("Téléchargez le modèle depuis: https://fauconnier.github.io/#data")
        print("Et placez-le dans le dossier word2vec-service/")
except Exception as e:
    print(f"Erreur lors du chargement du modèle: {e}")
    model = None


@app.route('/api/similarity', methods=['POST'])
def calculate_similarity():
    try:
        data = request.get_json()
        word1 = data.get('word1', '').lower()
        word2 = data.get('word2', '').lower()

        if not word1 or not word2:
            return jsonify({'error': 'Les deux mots sont requis'}), 400

        if model is None:
            return jsonify({'error': 'Modèle non chargé'}), 500

        if word1 not in model or word2 not in model:
            return jsonify({'code': 1, 'error': 'Un ou les deux mots ne sont pas dans le vocabulaire du modèle.'}), 200

        similarity = model.similarity(word1, word2)

        similarity = float(similarity)

        print(f'Similarity between "{word1}" and "{word2}": {similarity}')

        return jsonify({
            'similarity': similarity,
            'word1': word1,
            'word2': word2
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/random-word', methods=['GET'])
def get_random_word():
    try:
        if model is None:
            return jsonify({'error': 'Modèle non chargé'}), 500

        import random
        random_word = random.choice(list(model.key_to_index.keys()))

        return jsonify({
            'word': random_word
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'model_loaded': model is not None,
        'vocab_size': len(model) if model else 0
    })


if __name__ == '__main__':
    app.run(debug=True, port=5000)
