// Valores de la ruleta
const values = [
    "5% de descuento en cualquier compra",
    "Participas del sorteo especial",
    "10% de descuento en una caja de 6 o 12 unidades",
    "Participas del sorteo especial",
    "1 nuez confitada de regalo en tus compras desde 6 unidades",
    "Participas del sorteo especial",
    "15% de descuento en la compra de 12 unidades",
    "Participas del sorteo especial",
    "2x1 comprando una caja x 6 unidades",
    "Participas del sorteo especial",
    "25% de descuento en una caja de 12 unidades",
    "Participas del sorteo especial"
];

// Colores para los segmentos de la ruleta
const colors = [
    "#e74c3c", // Rojo
    "#f39c12", // Naranja
    "#2ecc71", // Verde
    "#f39c12", // Naranja
    "#3498db", // Azul
    "#f39c12", // Naranja
    "#9b59b6", // Púrpura
    "#f39c12", // Naranja
    "#1abc9c", // Turquesa
    "#f39c12", // Naranja
    "#e67e22", // Ámbar
    "#f39c12"  // Naranja
];

// Variables para la ruleta
let canvasContext;
let canvas;
let wheelWidth;
let radius;
let PI2 = Math.PI * 2;
let myChart;
let rotationAngle = 0;
let spinning = false;
let spinBtn;
let finalValue = "";

// Variables para el código de cupón
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const numbers = "0123456789";

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", function() {
    // Manejar el formulario
    const userForm = document.getElementById("user-form");
    const formSection = document.getElementById("form-section");
    const wheelSection = document.getElementById("wheel-section");
    
    userForm.addEventListener("submit", function(e) {
        e.preventDefault();
        const nombre = document.getElementById("nombre").value;
        const apellido = document.getElementById("apellido").value;
        const email = document.getElementById("email").value;
        
        if (nombre && apellido && email) {
            // Guardar datos en localStorage para evitar múltiples intentos
            const userData = { nombre, apellido, email, played: false };
            localStorage.setItem(email, JSON.stringify(userData));
            
            // Ocultar formulario y mostrar ruleta
            formSection.classList.add("hidden");
            wheelSection.classList.remove("hidden");
            
            // Inicializar la ruleta
            initWheel();
        }
    });
});

// Inicializar la ruleta
function initWheel() {
    canvas = document.getElementById("canvas");
    spinBtn = document.getElementById("spin-btn");
    
    // Configurar el contexto del canvas
    canvasContext = canvas.getContext("2d");
    wheelWidth = canvas.width;
    radius = wheelWidth / 2;
    
    // Dibujar la ruleta
    drawWheel();
    
    // Agregar evento al botón de girar
    spinBtn.addEventListener("click", spin);
}

// Dibujar la ruleta
function drawWheel() {
    // Limpiar el canvas
    canvasContext.clearRect(0, 0, wheelWidth, wheelWidth);
    
    // Dibujar el círculo exterior
    canvasContext.strokeStyle = "#333";
    canvasContext.lineWidth = 3;
    canvasContext.beginPath();
    canvasContext.arc(radius, radius, radius - 10, 0, PI2);
    canvasContext.stroke();
    
    // Dibujar segmentos y texto
    const anglePerSegment = PI2 / values.length;
    const centerX = radius;
    const centerY = radius;
    
    for (let i = 0; i < values.length; i++) {
        // Dibujar segmento
        const startAngle = rotationAngle + i * anglePerSegment;
        const endAngle = startAngle + anglePerSegment;
        
        canvasContext.beginPath();
        canvasContext.moveTo(centerX, centerY);
        canvasContext.arc(centerX, centerY, radius - 15, startAngle, endAngle);
        canvasContext.closePath();
        canvasContext.fillStyle = colors[i];
        canvasContext.fill();
        canvasContext.stroke();
        
        // Dibujar texto
        canvasContext.save();
        canvasContext.translate(centerX, centerY);
        canvasContext.rotate(startAngle + anglePerSegment / 2);
        canvasContext.textAlign = "center";
        canvasContext.fillStyle = "#fff";
        canvasContext.font = "bold 9px Montserrat";
        
        // Ajustar para textos largos
        const text = values[i];
        const maxWidth = radius - 40;
        
        let words = text.split(' ');
        let lines = [];
        let currentLine = words[0];
        
        for (let j = 1; j < words.length; j++) {
            const width = canvasContext.measureText(currentLine + " " + words[j]).width;
            if (width < maxWidth) {
                currentLine += " " + words[j];
            } else {
                lines.push(currentLine);
                currentLine = words[j];
            }
        }
        lines.push(currentLine);
        
        // Dibujar líneas de texto
        for (let j = 0; j < lines.length; j++) {
            canvasContext.fillText(lines[j], radius - 115, 5 + j * 15);
        }
        
        canvasContext.restore();
    }
    
    // Dibujar el indicador (flecha)
    canvasContext.beginPath();
    canvasContext.moveTo(radius, 15);
    canvasContext.lineTo(radius - 15, 0);
    canvasContext.lineTo(radius + 15, 0);
    canvasContext.closePath();
    canvasContext.fillStyle = "#333";
    canvasContext.fill();
}

// Hacer girar la ruleta
function spin() {
    // Verificar si ya está girando
    if (spinning) return;
    
    spinning = true;
    spinBtn.disabled = true;
    document.getElementById("final-value").innerHTML = "<p>¡Girando!</p>";
    
    // Determinar un nuevo ángulo para que gire al menos 5 vueltas
    const minSpinAngle = PI2 * 5;
    const randomSpin = minSpinAngle + Math.random() * PI2 * 5;
    const stopAngle = rotationAngle + randomSpin;
    
    // Verificar si el usuario ya ha jugado
    const email = document.getElementById("email").value;
    const userData = JSON.parse(localStorage.getItem(email) || "{}");
    
    if (userData.played) {
        document.getElementById("final-value").innerHTML = "<p>Ya has participado anteriormente</p>";
        spinning = false;
        return;
    }
    
    // Animación de giro
    const spinAnimation = () => {
        const step = 0.1;
        
        if (rotationAngle < stopAngle) {
            rotationAngle += step;
            drawWheel();
            requestAnimationFrame(spinAnimation);
        } else {
            stopSpinning();
        }
    };
    
    spinAnimation();
}

// Detener el giro y mostrar el resultado
function stopSpinning() {
    spinning = false;
    spinBtn.disabled = false;
    
    // Calcular en qué segmento ha caído la ruleta
    const anglePerSegment = PI2 / values.length;
    const normalizedAngle = rotationAngle % PI2;
    const segmentIndex = Math.floor(normalizedAngle / anglePerSegment) % values.length;
    finalValue = values[segmentIndex];
    
    // Mostrar el resultado
    let resultMessage = "";

    if (finalValue === "Participas del sorteo especial") {
        resultMessage = `<p>¡Felicidades! Participas por una caja de 12 Nueces Confitadas que se sorteará el día Lunes 10 de Marzo del 2025 por nuestro Instagram @carmoninueces.</p>`;
    } else {
        resultMessage = `<p>¡Tu premio es: ${finalValue}!</p>`;
    }

    document.getElementById("final-value").innerHTML = resultMessage;
    
    // Generar el código del cupón (pasando el premio como parámetro)
    const couponCode = generateCouponCode(finalValue);
    
    // Actualizar el estado del usuario a "played"
    const email = document.getElementById("email").value;
    const userData = JSON.parse(localStorage.getItem(email) || "{}");
    userData.played = true;
    userData.prize = finalValue;
    userData.couponCode = couponCode;
    localStorage.setItem(email, JSON.stringify(userData));
    
    // Mostrar el resultado
    document.getElementById("prize-text").textContent = finalValue;
    document.getElementById("coupon-code").textContent = couponCode;
    document.getElementById("result").classList.remove("hidden");
}

// Generar código de cupón aleatorio

    function generateCouponCode(prize) {
        let code = "CARMONI";
    
        // Extraer el porcentaje de descuento
        const discountMatch = prize.match(/\d+/);
        const discount = discountMatch ? discountMatch[0] : "00";
    
        // Extraer una palabra clave
        const keywords = ["nuez", "2x1", "sorteo", "descuento"];
        let keyword = "";
        for (const word of keywords) {
            if (prize.toLowerCase().includes(word)) {
                keyword = word.toUpperCase();
                break;
            }
        }
    
        // Combinar porcentaje y palabra clave
        code += discount + keyword;
    
        // Agregar 2 letras aleatorias
        for (let i = 0; i < 2; i++) {
            code += letters.charAt(Math.floor(Math.random() * letters.length));
        }
    
        // Agregar 2 números aleatorios
        for (let i = 0; i < 2; i++) {
            code += numbers.charAt(Math.floor(Math.random() * numbers.length));
        }
    
    return code;
}
