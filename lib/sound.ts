export function playSound(san: string, captured?: boolean) {
  if (san.startsWith("O-O")) {
    new Audio("/audios/castle.mp3").play();
    return;
  }
  if (san.endsWith("#")) {
    new Audio("/audios/checkmate.mp3").play();
    return;
  }
  if (san.endsWith("+")) {
    new Audio("/audios/check.mp3").play();
    return;
  }
  if (captured) {
    new Audio("/audios/capture.mp3").play();
    return;
  }
  if (san === "start") {
    new Audio("/audios/start.mp3").play();
    return;
  }
  if (san === "gameover") {
    new Audio("/audios/gameover.mp3").play();
    return;
  }
  new Audio("/audios/move.mp3").play();
  return;
}
