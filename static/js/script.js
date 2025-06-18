document.addEventListener('DOMContentLoaded', function() {
    // Variables globales para almacenar datos entre secciones
    let currentText = '';
    let publicKey = [];
    let privateKey = {};
    let encryptedNumbers = [];
    
    // Sección 1: Conversión de texto
    document.getElementById('convertBtn').addEventListener('click', function() {
        currentText = document.getElementById('inputText').value;
        
        if (!currentText) {
            alert('Por favor ingrese un texto');
            return;
        }
        
        fetch('/convert-text', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `text=${encodeURIComponent(currentText)}`
        })
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('conversionTableBody');
            tableBody.innerHTML = '';
            
            data.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.letter}</td>
                    <td>${item.ascii}</td>
                    <td>${item.binary}</td>
                `;
                tableBody.appendChild(row);
            });
            
            document.getElementById('conversionResult').style.display = 'block';
            document.getElementById('textToEncrypt').textContent = currentText;
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al convertir el texto');
        });
    });
    
    // Sección 2: Generación de claves
    document.getElementById('generateM').addEventListener('click', function() {
        const weightsInput = document.getElementById('weightsInput').value;
        if (!weightsInput) {
            alert('Primero ingrese los pesos superincrementales');
            return;
        }
        
        try {
            const weights = weightsInput.split(',').map(w => parseInt(w.trim()));
            const sumWeights = weights.reduce((a, b) => a + b, 0);
            document.getElementById('MInput').value = sumWeights + Math.floor(Math.random() * 100) + 1;
        } catch (e) {
            alert('Formato de pesos incorrecto');
        }
    });
    
    document.getElementById('generateR').addEventListener('click', function() {
        const M = parseInt(document.getElementById('MInput').value);
        if (!M) {
            alert('Primero genere o ingrese M');
            return;
        }
        
        // Función para encontrar un coprimo con M
        function getCoprime(M) {
            for (let i = 2; i < M; i++) {
                if (gcd(i, M) === 1) return i;
            }
            return 1;
        }
        
        function gcd(a, b) {
            return b === 0 ? a : gcd(b, a % b);
        }
        
        document.getElementById('RInput').value = getCoprime(M);
    });
    
    document.getElementById('generateKeysBtn').addEventListener('click', function() {
        const weightsInput = document.getElementById('weightsInput').value;
        const M = document.getElementById('MInput').value;
        const R = document.getElementById('RInput').value;
        
        if (!weightsInput || !M || !R) {
            alert('Complete todos los campos');
            return;
        }
        
        fetch('/generate-keys', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `weights=${encodeURIComponent(weightsInput)}&M=${M}&R=${R}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
                return;
            }
            
            publicKey = data.public_key;
            privateKey = {
                W: data.weights,
                M: data.M,
                R: data.R
            };
            
            const tableBody = document.getElementById('publicKeyTableBody');
            tableBody.innerHTML = '';
            
            for (let i = 0; i < data.weights.length; i++) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${i}</td>
                    <td>${data.weights[i]}</td>
                    <td>${data.public_key[i]}</td>
                `;
                tableBody.appendChild(row);
            }
            
            document.getElementById('publicKeyResult').style.display = 'block';
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al generar claves');
        });
    });
    
    // Sección 3: Cifrado
    document.getElementById('encryptBtn').addEventListener('click', function() {
        if (!currentText) {
            alert('Primero ingrese y convierta un texto en la sección 1');
            return;
        }
        
        if (publicKey.length === 0) {
            alert('Primero genere las claves en la sección 2');
            return;
        }
        
        fetch('/encrypt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: currentText,
                public_key: publicKey
            })
        })
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('encryptionTableBody');
            tableBody.innerHTML = '';
            
            encryptedNumbers = [];
            
            data.forEach(item => {
                encryptedNumbers.push(item.encrypted);
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.letter}</td>
                    <td>${item.binary}</td>
                    <td>${item.encrypted}</td>
                `;
                tableBody.appendChild(row);
            });
            
            document.getElementById('encryptionResult').style.display = 'block';
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al cifrar el texto');
        });
    });
    
    // Sección 4: Descifrado
    document.getElementById('addEncryptedNumber').addEventListener('click', function() {
        const numberInput = document.getElementById('encryptedNumberInput');
        const number = parseInt(numberInput.value);
        
        if (isNaN(number)) {
            alert('Ingrese un número válido');
            return;
        }
        
        encryptedNumbers.push(number);
        updateEncryptedNumbersList();
        decryptNumbers();
        
        numberInput.value = '';
    });
    
    document.getElementById('clearDecryptionBtn').addEventListener('click', function() {
        encryptedNumbers = [];
        updateEncryptedNumbersList();
        document.getElementById('decryptedMessage').textContent = '';
        document.getElementById('decryptionTableBody').innerHTML = '';
    });
    
    document.getElementById('finishDecryptionBtn').addEventListener('click', function() {
        if (encryptedNumbers.length === 0) {
            alert('No hay números para descifrar');
            return;
        }
        
        decryptNumbers(true);
    });
    
    function updateEncryptedNumbersList() {
        const list = document.getElementById('encryptedNumbersUl');
        list.innerHTML = '';
        
        encryptedNumbers.forEach((num, index) => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.innerHTML = `
                ${num}
                <span class="badge bg-danger rounded-pill" data-index="${index}">×</span>
            `;
            list.appendChild(li);
        });
        
        // Agregar event listeners a los botones de eliminar
        document.querySelectorAll('#encryptedNumbersUl .badge').forEach(badge => {
            badge.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                encryptedNumbers.splice(index, 1);
                updateEncryptedNumbersList();
                decryptNumbers();
            });
        });
    }
    
    // Reemplaza la función decryptNumbers con esta versión mejorada
    function decryptNumbers(showTable = false) {
        if (encryptedNumbers.length === 0 || !privateKey.W) {
            alert(encryptedNumbers.length === 0 ? 'No hay números para descifrar' : 'No se han configurado las claves privadas');
            return;
        }

        fetch('/decrypt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                encrypted_numbers: encryptedNumbers,
                weights: privateKey.W,
                M: privateKey.M,
                R: privateKey.R
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            
            // Mostrar el mensaje descifrado
            document.getElementById('decryptedMessage').textContent = data.decrypted_text || 'No se pudo descifrar';
            
            // Mostrar la tabla con los resultados
            const tableBody = document.getElementById('decryptionTableBody');
            tableBody.innerHTML = ''; // Limpiar la tabla
            
            // Asegurarse de que data.steps existe y tiene la misma longitud que encryptedNumbers
            const steps = data.steps || [];
            
            // Crear una fila por cada número cifrado
            encryptedNumbers.forEach((num, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${num}</td>
                    <td>${steps[index] || '?'}</td>
                `;
                tableBody.appendChild(row);
            });
            
            // Mostrar la sección de resultados si estaba oculta
            document.getElementById('decryptionResult').style.display = 'block';
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al descifrar: ' + error.message);
            document.getElementById('decryptedMessage').textContent = 'Error: ' + error.message;
        });
    }
});