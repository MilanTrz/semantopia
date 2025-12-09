from flask import Flask, request, jsonify
from flask_cors import CORS
from gensim.models import KeyedVectors
import re
import numpy as np
import os
import random
import urllib.request


app = Flask(__name__)
CORS(app)

INCLUDED_TAGS = ['_n', '_v', '_a', '_adv']

print("Chargement du modèle word2vec français...")
model = None

MODEL_PATH = 'frWac_postag_no_phrase_1000_skip_cut100.bin'
MODEL_URL = 'https://embeddings.net/embeddings/frWac_postag_no_phrase_1000_skip_cut100.bin'
MODEL_NOT_LOADED = "Modèle non chargé"


def download_model(url, destination):
    """Télécharge le modèle word2vec"""
    print(f"Téléchargement du modèle depuis {url}...")
    print("Cela peut prendre plusieurs minutes (fichier ~500 Mo)...")

    def show_progress(block_num, block_size, total_size):
        downloaded = block_num * block_size
        percent = min(100, downloaded * 100 / total_size)
        print(
            f"\rProgrès: {percent:.1f}% ({downloaded / (1024*1024):.1f} MB / {total_size / (1024*1024):.1f} MB)", end='')

    try:
        urllib.request.urlretrieve(url, destination, show_progress)
        print("\nTéléchargement terminé!")
        return True
    except Exception as e:
        print(f"\nErreur lors du téléchargement: {e}")
        return False


try:
    if not os.path.exists(MODEL_PATH):
        print(f"Le fichier modèle n'existe pas: {MODEL_PATH}")
        if download_model(MODEL_URL, MODEL_PATH):
            print("Modèle téléchargé avec succès, chargement en cours...")
        else:
            print("Impossible de télécharger le modèle automatiquement.")
            print("Veuillez le télécharger manuellement depuis:")
            print(
                "https://embeddings.net/embeddings/frWac_postag_no_phrase_1000_skip_cut100.bin")
            model = None

    if os.path.exists(MODEL_PATH):
        model = KeyedVectors.load_word2vec_format(
            MODEL_PATH, binary=True, unicode_errors='ignore')
        print("Modèle chargé avec succès!")
except Exception as e:
    print(f"Erreur lors du chargement du modèle: {e}")
    model = None


def remove_postag(word):
    """Enlever le tag POS du mot"""
    if '_' in word:
        return word.rsplit('_', 1)[0]
    return word


def add_postag(word):
    """Trouver le mot avec son tag dans le vocabulaire"""
    if '_' in word and word in model:
        return word

    for word_with_tag in model.key_to_index.keys():
        if word_with_tag.startswith(word + '_'):
            return word_with_tag

    return word


ARTICLE_GROUPS = [
    {'le', 'la', 'les', "l"},
    {'un', 'une'},
    {'de', 'du', 'des', "d"},
    {'au', 'aux'},
    {'ce', 'ces'},
    {'cet', 'cette'}
]


def is_valid_word(word: str) -> bool:
    """Vérifie que le mot contient uniquement des lettres (a-z) et des accents"""
    if not word:
        return False
    return bool(re.fullmatch(r"[a-zA-Zàçéèêëïôùûü]+", word))


def same_article_group(w1: str, w2: str) -> bool:
    nw1 = w1.lower().strip()
    nw2 = w2.lower().strip()
    if not nw1 or not nw2:
        return False
    for group in ARTICLE_GROUPS:
        if nw1 in group and nw2 in group:
            return True
    return False


def is_integer_string(s: str) -> bool:
    return bool(re.fullmatch(r"\d+", s))


def number_similarity(s1: str, s2: str) -> float:
    if not (is_integer_string(s1) and is_integer_string(s2)):
        return 0.0
    if len(s1) != len(s2):
        return 0.0
    try:
        a = int(s1)
        b = int(s2)
        if a == 0 and b == 0:
            return 1.0
        mn = min(a, b)
        mx = max(a, b)
        if mx == 0:
            return 0.0
        base_ratio = float(mn) / float(mx)
        return 0.5 + 0.5 * base_ratio
    except Exception:
        return 0.0


@app.route('/api/similarity', methods=['POST'])
def calculate_similarity():
    try:
        data = request.get_json()
        word1 = data.get('word1', '').lower()
        word2 = data.get('word2', '').lower()

        if not word1 or not word2:
            return jsonify({'error': 'Les deux mots sont requis'}), 400

        if is_integer_string(word1) and is_integer_string(word2):
            sim = number_similarity(word1, word2)
            print(f'Numeric similarity between "{word1}" and "{word2}": {sim}')
            return jsonify({'similarity': float(sim), 'word1': word1, 'word2': word2})

        if same_article_group(word1, word2):
            sim = 1.0
            print(
                f'Article group match between "{word1}" and "{word2}": {sim}')
            return jsonify({
                'similarity': sim,
                'word1': word1,
                'word2': word2
            })

        if model is None:
            return jsonify({'error': MODEL_NOT_LOADED}), 500

        word1_with_tag = add_postag(word1)
        word2_with_tag = add_postag(word2)

        if word1_with_tag not in model:
            return jsonify({'code': 1, 'error': f'"{word1}" n\'est pas dans le vocabulaire'}), 200

        if word2_with_tag not in model:
            return jsonify({'code': 1, 'error': f'"{word2}" n\'est pas dans le vocabulaire'}), 200

        similarity = model.similarity(word1_with_tag, word2_with_tag)
        similarity = float(similarity)

        print(f'Similarité entre "{word1}" et "{word2}": {similarity}')

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
            return jsonify({'error': MODEL_NOT_LOADED}), 500

        words_filtered = [
            word for word in list(model.key_to_index.keys())[:10000]
            if '-' not in word and any(word.endswith(tag) for tag in INCLUDED_TAGS)
            and is_valid_word(remove_postag(word))
        ]

        if not words_filtered:
            return jsonify({'error': 'Aucun mot trouvé'}), 500

        random_word_with_tag = random.choice(words_filtered)
        random_word = remove_postag(random_word_with_tag)

        return jsonify({
            'word': random_word
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/most-similar', methods=['POST'])
def get_most_similar():
    try:
        data = request.get_json()
        word = data.get('word', '').lower()
        topn = int(data.get('topn', 100))

        if not word:
            return jsonify({'error': 'Le mot est requis'}), 400

        if model is None:
            return jsonify({'error': MODEL_NOT_LOADED}), 500

        word_with_tag = add_postag(word)

        if word_with_tag not in model:
            return jsonify({'code': 1, 'error': f'"{word}" n\'est pas dans le vocabulaire'}), 200

        similar_words = model.most_similar(word_with_tag, topn=topn * 2)

        seen_words = set()
        seen_words.add(word)
        result = []

        for sim_word, sim_score in similar_words:
            word_without_tag = remove_postag(sim_word)
            if word_without_tag not in seen_words and is_valid_word(word_without_tag):
                seen_words.add(word_without_tag)
                result.append({
                    'word': word_without_tag,
                    'similarity': float(sim_score) * 100
                })
                if len(result) >= topn:
                    break

        return jsonify({
            'word': word,
            'similar_words': result
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/check-word', methods=['POST'])
def check_word():
    try:
        data = request.get_json()
        word = data.get('word', '').lower()

        if not word:
            return jsonify({'error': 'Le mot est requis'}), 400

        if model is None:
            return jsonify({'error': MODEL_NOT_LOADED}), 500

        # Chercher le mot avec son tag dans le vocabulaire
        word_with_tag = add_postag(word)

        # Vérifier si le mot existe
        exists = word_with_tag in model

        return jsonify({
            'word': word,
            'exists': exists
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
