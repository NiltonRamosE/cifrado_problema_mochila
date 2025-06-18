from flask import Flask, render_template, request, jsonify
import random
import math

app = Flask(__name__)

# Funciones base del algoritmo
def es_superincremental(seq):
    suma = 0
    for n in seq:
        if n <= suma:
            return False
        suma += n
    return True

def inverso_modular(a, m):
    for x in range(1, m):
        if (a * x) % m == 1:
            return x
    return None

def generar_clave_superincr(w=None, m=None, r=None):
    if w is None:
        w = [2, 3, 7, 14, 30, 57, 120, 251]
    if m is None:
        m = 491  # mayor que suma(w)
    if r is None:
        r = 41  # coprimo con m
    
    if not es_superincremental(w):
        return None, None, None, None, "La secuencia w no es superincremental"
    
    if math.gcd(r, m) != 1:
        return None, None, None, None, "r y m deben ser coprimos"
    
    suma_w = sum(w)
    if m <= suma_w:
        return None, None, None, None, f"m debe ser mayor que la suma de w ({suma_w})"
    
    b = [(wi * r) % m for wi in w]
    return w, m, r, b, None

def cifrar_mochila(msg_bin, b):
    if len(msg_bin) != len(b):
        return None, "La longitud del mensaje debe coincidir con la longitud de la clave pública"
    try:
        return sum([int(bit) * b[i] for i, bit in enumerate(msg_bin)]), None
    except:
        return None, "El mensaje debe contener solo bits (0 y 1)"

def descifrar_mochila(c, w, m, r):
    r_inv = inverso_modular(r, m)
    if r_inv is None:
        return None, "No existe inverso modular para r y m dados"
    
    c_ajustado = (c * r_inv) % m
    solucion = []
    for wi in reversed(w):
        if wi <= c_ajustado:
            solucion.insert(0, '1')
            c_ajustado -= wi
        else:
            solucion.insert(0, '0')
    return ''.join(solucion), None

def agregar_ruido(bits, longitud=2):
    ruido = ''.join(str(random.randint(0, 1)) for _ in range(longitud))
    return ruido + bits

def quitar_ruido(bits, longitud=2):
    return bits[longitud:]

# Rutas de la aplicación
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generar_claves', methods=['POST'])
def generar_claves():
    try:
        w_input = request.json.get('w')
        m_input = request.json.get('m')
        r_input = request.json.get('r')
        
        w = None
        if w_input:
            w = [int(x.strip()) for x in w_input.split(',') if x.strip()]
        
        m = int(m_input) if m_input and m_input.isdigit() else None
        r = int(r_input) if r_input and r_input.isdigit() else None
        
        w, m, r, b, error = generar_clave_superincr(w, m, r)
        if error:
            return jsonify({'error': error})
        
        return jsonify({
            'w': w,
            'm': m,
            'r': r,
            'b': b,
            'es_superincremental': es_superincremental(w)
        })
    except Exception as e:
        return jsonify({'error': f"Error al generar claves: {str(e)}"})

@app.route('/cifrar', methods=['POST'])
def cifrar():
    try:
        data = request.json
        mensaje = data['mensaje']
        b = data['b']
        usar_ruido = data.get('usar_ruido', False)
        
        if usar_ruido:
            mensaje = agregar_ruido(mensaje)
        
        cifrado, error = cifrar_mochila(mensaje, b)
        if error:
            return jsonify({'error': error})
        
        return jsonify({
            'cifrado': cifrado,
            'mensaje_con_ruido': mensaje if usar_ruido else None
        })
    except Exception as e:
        return jsonify({'error': f"Error al cifrar: {str(e)}"})

@app.route('/descifrar', methods=['POST'])
def descifrar():
    try:
        data = request.json
        cifrado = data['cifrado']
        w = data['w']
        m = data['m']
        r = data['r']
        tiene_ruido = data.get('tiene_ruido', False)
        
        descifrado, error = descifrar_mochila(cifrado, w, m, r)
        if error:
            return jsonify({'error': error})
        
        if tiene_ruido:
            descifrado = quitar_ruido(descifrado)
        
        return jsonify({
            'descifrado': descifrado
        })
    except Exception as e:
        return jsonify({'error': f"Error al descifrar: {str(e)}"})

if __name__ == '__main__':
    app.run(debug=True)