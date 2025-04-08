// src/utils/notas.js

export const notaNumClass = 'nota-num'
export const notaLetraClass = 'nota-letra'

export function getNotaColor(nota) {
    const n = parseFloat(nota);
    if (isNaN(n)) return '#EEEEEE'; // Gris claro por defecto
  
    if (n <= 10) return '#F44336';     // Rojo
    if (n <= 13) return '#FF9800';     // Naranja
    if (n <= 16) return '#FFEB3B';     // Amarillo
    return '#4CAF50';                  // Verde
  }
  
  export function getNotaLetra(nota) {
    const n = parseFloat(nota);
    if (isNaN(n)) return '';
    if (n <= 10) return 'C';
    if (n <= 13) return 'B';
    if (n <= 16) return 'A';
    return 'AD';
  }
  
  export function getNotaTextColor(nota) {
    const n = parseFloat(nota);
    return n <= 10 ? 'white' : 'black'; // Contraste para fondo oscuro
  }
  