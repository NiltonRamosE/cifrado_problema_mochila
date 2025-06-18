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

def generar_clave_superincr():
    w = [2, 3, 7, 14, 30, 57, 120, 251]
    m = 491 # mayor que suma(w)
    r = 41 # coprimo con m
    b = [(wi * r) % m for wi in w]
    return w, m, r, b

def cifrar_mochila(msg_bin, b):
    return sum([int(bit) * b[i] for i, bit in enumerate(msg_bin)])

def descifrar_mochila(c, w, m, r):
    r_inv = inverso_modular(r, m)
    c_ajustado = (c * r_inv) % m
    solucion = []
    for wi in reversed(w):
        if wi <= c_ajustado:
            solucion.insert(0, 1)
            c_ajustado -= wi
        else:
            solucion.insert(0, 0)
    return ''.join(map(str, solucion))

# DEMO
w, m, r, b = generar_clave_superincr()
mensaje_bin = '10100101'
cifrado = cifrar_mochila(mensaje_bin, b)
descifrado = descifrar_mochila(cifrado, w, m, r)

print("Mensaje:", mensaje_bin)
print("Cifrado:", cifrado)
print("Descifrado:", descifrado)