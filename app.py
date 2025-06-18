from flask import Flask, render_template, request, jsonify
import json
import random
import math
from utils import generate_keys, encrypt_message, decrypt_message

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/convert-text', methods=['POST'])
def convert_text():
    text = request.form.get('text', '')
    result = []
    
    for char in text:
        ascii_val = ord(char.upper())
        binary = format(ascii_val, '08b')
        result.append({
            'letter': char.upper(),
            'ascii': ascii_val,
            'binary': binary
        })
    
    return jsonify(result)

@app.route('/generate-keys', methods=['POST'])
def generate_keys_route():
    try:
        weights = [int(x) for x in request.form.get('weights', '').split(',')]
        M = int(request.form.get('M', 0))
        R = int(request.form.get('R', 0))
        
        # Validar que los pesos sean superincrementales
        for i in range(1, len(weights)):
            if weights[i] <= sum(weights[:i]):
                return jsonify({'error': 'Los pesos no son superincrementales'}), 400
        
        # Validar que M > suma de pesos
        if M <= sum(weights):
            return jsonify({'error': 'M debe ser mayor que la suma de los pesos'}), 400
        
        # Validar que R y M sean coprimos
        if math.gcd(R, M) != 1:
            return jsonify({'error': 'R y M deben ser coprimos'}), 400
        
        public_key = [(w * R) % M for w in weights]
        
        return jsonify({
            'public_key': public_key,
            'weights': weights,
            'M': M,
            'R': R
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/encrypt', methods=['POST'])
def encrypt():
    data = request.get_json()
    text = data.get('text', '')
    public_key = data.get('public_key', [])
    
    encrypted = []
    for char in text.upper():
        binary = format(ord(char), '08b')
        encrypted_val = 0
        for i, bit in enumerate(binary):
            if bit == '1' and i < len(public_key):
                encrypted_val += public_key[i]
        encrypted.append({
            'letter': char,
            'binary': binary,
            'encrypted': encrypted_val
        })
    
    return jsonify(encrypted)

@app.route('/decrypt', methods=['POST'])
def decrypt():
    data = request.get_json()
    encrypted_numbers = data.get('encrypted_numbers', [])
    weights = data.get('weights', [])
    M = data.get('M', 0)
    R = data.get('R', 0)
    
    try:
        if not all([encrypted_numbers, weights, M, R]):
            return jsonify({'error': 'Faltan parámetros necesarios'}), 400
        
        # Calcular R^-1 mod M
        R_inv = pow(R, -1, M)
        decrypted_text = []
        steps = []
        
        for num in encrypted_numbers:
            S = (num * R_inv) % M
            binary = ''
            
            # Resolver el problema de la mochila
            remaining = S
            bits = []
            for w in reversed(weights):
                if w <= remaining:
                    bits.append('1')
                    remaining -= w
                else:
                    bits.append('0')
            
            # Los bits están en orden inverso
            binary = ''.join(reversed(bits))
            
            # Convertir binario a ASCII
            ascii_val = int(binary, 2)
            char = chr(ascii_val)
            decrypted_text.append(char)
            steps.append(char)
        
        return jsonify({
            'decrypted_text': ''.join(decrypted_text),
            'steps': steps  # Asegúrate de incluir los pasos
        })
    except Exception as e:
        return jsonify({
            'error': str(e),
            'decrypted_text': '',
            'steps': []
        }), 400

if __name__ == '__main__':
    app.run(debug=True)