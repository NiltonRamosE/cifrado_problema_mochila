import random
import math

def generate_superincreasing_sequence(n):
    """Genera una secuencia superincremental de n elementos"""
    sequence = []
    total = 0
    for _ in range(n):
        next_val = total + random.randint(1, 10)
        sequence.append(next_val)
        total += next_val
    return sequence

def generate_coprime(M):
    """Genera un número coprimo con M"""
    while True:
        R = random.randint(2, M-1)
        if math.gcd(R, M) == 1:
            return R

def generate_keys():
    """Genera claves pública y privada"""
    W = generate_superincreasing_sequence(8)
    M = sum(W) + random.randint(1, 100)
    R = generate_coprime(M)
    B = [(w * R) % M for w in W]
    return {
        'public_key': B,
        'private_key': {
            'W': W,
            'M': M,
            'R': R
        }
    }

def encrypt_message(message, public_key):
    """Cifra un mensaje usando la clave pública"""
    encrypted = []
    for char in message.upper():
        binary = format(ord(char), '08b')
        encrypted_val = 0
        for i, bit in enumerate(binary):
            if bit == '1' and i < len(public_key):
                encrypted_val += public_key[i]
        encrypted.append(encrypted_val)
    return encrypted

def decrypt_message(encrypted_numbers, private_key):
    """Descifra números cifrados usando la clave privada"""
    W = private_key['W']
    M = private_key['M']
    R = private_key['R']
    
    # Calcular R^-1 mod M
    R_inv = pow(R, -1, M)
    decrypted_text = []
    
    for num in encrypted_numbers:
        S = (num * R_inv) % M
        binary = ''
        
        # Resolver el problema de la mochila
        remaining = S
        bits = []
        for w in reversed(W):
            if w <= remaining:
                bits.append('1')
                remaining -= w
            else:
                bits.append('0')
        
        # Los bits están en orden inverso
        binary = ''.join(reversed(bits))
        
        # Convertir binario a ASCII
        ascii_val = int(binary, 2)
        decrypted_text.append(chr(ascii_val))
    
    return ''.join(decrypted_text)