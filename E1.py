def knapsack(valores, pesos, capacidad):
    n = len(valores)
    tabla = [[0 for _ in range(capacidad + 1)] for _ in range(n + 1)]
    for i in range(n + 1):
        for w in range(capacidad + 1):
            if i == 0 or w == 0:
                tabla[i][w] = 0
            elif pesos[i-1] <= w:
                tabla[i][w] = max(valores[i-1] + tabla[i-1][w - pesos[i-1]], tabla[i-1][w])
            else:
                tabla[i][w] = tabla[i-1][w]
    return tabla[n][capacidad]
# Ejemplo
valores = [60, 100, 120]
pesos = [10, 20, 30]
capacidad = 50
print("Valor máximo:", knapsack(valores, pesos, capacidad))
