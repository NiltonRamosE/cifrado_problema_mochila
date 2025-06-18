document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const generarClavesBtn = document.getElementById('generar-claves');
    const cifrarBtn = document.getElementById('cifrar');
    const descifrarBtn = document.getElementById('descifrar');
    
    // Generar claves
    generarClavesBtn.addEventListener('click', function() {
        const w = document.getElementById('w').value;
        const m = document.getElementById('m').value;
        const r = document.getElementById('r').value;
        
        fetch('/generar_claves', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                w: w,
                m: m,
                r: r
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert('Error: ' + data.error);
                return;
            }
            
            document.getElementById('clave-w').textContent = data.w.join(', ');
            document.getElementById('clave-m').textContent = data.m;
            document.getElementById('clave-r').textContent = data.r;
            document.getElementById('clave-b').textContent = data.b.join(', ');
            document.getElementById('es-superincremental').textContent = 
                data.es_superincremental ? 'Sí' : 'No';
            
            if (data.es_superincremental) {
                document.getElementById('es-superincremental').className = 'success';
            } else {
                document.getElementById('es-superincremental').className = 'error';
            }
            
            // Actualizar el campo de mensaje cifrado con la clave pública b
            sessionStorage.setItem('clave_b', JSON.stringify(data.b));
            sessionStorage.setItem('clave_w', JSON.stringify(data.w));
            sessionStorage.setItem('clave_m', data.m);
            sessionStorage.setItem('clave_r', data.r);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Ocurrió un error al generar las claves');
        });
    });
    
    // Cifrar mensaje
    cifrarBtn.addEventListener('click', function() {
        const mensaje = document.getElementById('mensaje').value;
        const usarRuido = document.getElementById('usar-ruido').checked;
        const claveB = JSON.parse(sessionStorage.getItem('clave_b'));
        
        if (!claveB) {
            alert('Primero genere las claves');
            return;
        }
        
        if (!mensaje.match(/^[01]{8}$/)) {
            alert('El mensaje debe ser una cadena binaria de exactamente 8 bits (ej: 10100101)');
            return;
        }
        
        fetch('/cifrar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                mensaje: mensaje,
                b: claveB,
                usar_ruido: usarRuido
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert('Error: ' + data.error);
                return;
            }
            
            document.getElementById('mensaje-original').textContent = mensaje;
            document.getElementById('mensaje-ruido').textContent = data.mensaje_con_ruido || 'No aplica';
            document.getElementById('mensaje-cifrado').textContent = data.cifrado;
            
            // Actualizar el campo de descifrado con el valor cifrado
            document.getElementById('cifrado').value = data.cifrado;
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Ocurrió un error al cifrar el mensaje');
        });
    });
    
    // Descifrar mensaje
    descifrarBtn.addEventListener('click', function() {
        const cifrado = document.getElementById('cifrado').value;
        const tieneRuido = document.getElementById('tiene-ruido').checked;
        const claveW = JSON.parse(sessionStorage.getItem('clave_w'));
        const claveM = sessionStorage.getItem('clave_m');
        const claveR = sessionStorage.getItem('clave_r');
        
        if (!claveW || !claveM || !claveR) {
            alert('Primero genere las claves');
            return;
        }
        
        if (!cifrado) {
            alert('Ingrese un mensaje cifrado');
            return;
        }
        
        fetch('/descifrar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cifrado: parseInt(cifrado),
                w: claveW,
                m: parseInt(claveM),
                r: parseInt(claveR),
                tiene_ruido: tieneRuido
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert('Error: ' + data.error);
                return;
            }
            
            document.getElementById('mensaje-descifrado').textContent = data.descifrado;
            
            // Resaltar si coincide con el original (si está disponible)
            const mensajeOriginal = document.getElementById('mensaje').value;
            const mensajeRuido = document.getElementById('mensaje-ruido').textContent;
            
            let compararCon = mensajeOriginal;
            if (tieneRuido && mensajeRuido !== 'No aplica') {
                compararCon = mensajeRuido;
            }
            
            if (compararCon && data.descifrado === compararCon) {
                document.getElementById('mensaje-descifrado').className = 'success';
            } else {
                document.getElementById('mensaje-descifrado').className = '';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Ocurrió un error al descifrar el mensaje');
        });
    });
    
    // Validación de entrada binaria
    document.getElementById('mensaje').addEventListener('input', function(e) {
        const value = e.target.value;
        if (!/^[01]*$/.test(value)) {
            e.target.value = value.replace(/[^01]/g, '');
        }
        if (value.length > 8) {
            e.target.value = value.slice(0, 8);
        }
    });
});