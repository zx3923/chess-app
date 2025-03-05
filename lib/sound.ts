import { Move } from "chess.js";

function sound() {
  const path = "/audios/";
  const audios = {
    move: new Audio(path + "move.mp3"),
    check: new Audio(path + "check.mp3"),
    start: new Audio(path + "start.mp3"),
    castle: new Audio(path + "castle.mp3"),
    capture: new Audio(path + "capture.mp3"),
    gameover: new Audio(path + "gameover.mp3"),
    checkmate: new Audio(path + "checkmate.mp3"),
    stalemate: new Audio(path + "stalemate.mp3"),
  };

  const vol = 1;
  audios.move.volume = vol;
  audios.check.volume = vol;
  audios.start.volume = vol;
  audios.castle.volume = vol;
  audios.capture.volume = vol;
  audios.gameover.volume = vol;
  audios.checkmate.volume = vol;
  audios.stalemate.volume = vol;

  function move() {
    audios.move.play();
  }

  function capture() {
    audios.capture.play();
  }

  function castle() {
    audios.castle.play();
  }

  function start() {
    audios.start.play();
  }

  function gameover() {
    audios.gameover.play();
  }

  function check() {
    audios.check.play();
  }

  function checkmate() {
    audios.checkmate.play();
  }

  function stalemate() {
    audios.stalemate.play();
  }

  function stop() {
    audios.move.pause();
    audios.check.pause();
    audios.start.pause();
    audios.castle.pause();
    audios.capture.pause();
    audios.gameover.pause();
    audios.checkmate.pause();
    audios.stalemate.pause();
  }

  function playMoveSound(result: Move) {
    if (result.san.startsWith("O-O")) return castle();
    if (result.san.endsWith("+")) return check();
    if (result.san.endsWith("#")) return checkmate();
    if (result.captured) return capture();
    return move();
  }

  return {
    stop,
    move,
    check,
    start,
    castle,
    capture,
    gameover,
    checkmate,
    stalemate,
    playMoveSound,
  };
}

export const soundPlayer = sound();
