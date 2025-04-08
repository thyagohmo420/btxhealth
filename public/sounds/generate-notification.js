// Este script pode ser executado via Node.js para gerar um arquivo de áudio de notificação
// Caso não tenha o arquivo de som, você pode criar um elemento de áudio HTML simples

// Código HTML para adicionar ao seu projeto:
/*
<audio id="notification-sound">
  <source src="/sounds/notification.mp3" type="audio/mpeg">
  Your browser does not support the audio element.
</audio>

// E para tocar o som:
document.getElementById('notification-sound').play();
*/

// Nota: Como alternativa, você pode usar a API Web Audio para gerar um som no navegador:
/*
function playNotificationSound() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(1000, audioContext.currentTime); // valor em Hz
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
}
*/ 