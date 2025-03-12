// import { useState, useEffect } from "react";

// const useSoundPlayer = () => {
//   const [audio, setAudio] = useState<any>(null); // audio 상태를 null로 초기화

//   useEffect(() => {
//     if (typeof window === "undefined") return; // 클라이언트에서만 실행
//     console.log("?");

//     // 브라우저 환경에서만 Audio 객체를 생성
//     const newAudio = {
//       move: new Audio("/audios/move.mp3"),
//       capture: new Audio("/audios/capture.mp3"),
//       start: new Audio("/audios/start.mp3"),
//       castle: new Audio("/audios/castle.mp3"),
//       gameover: new Audio("/audios/gameover.mp3"),
//       checkmate: new Audio("/audios/checkmate.mp3"),
//       check: new Audio("/audios/check.mp3"),
//       stalemate: new Audio("/audios/stalemate.mp3"),
//     };

//     // 오디오 객체가 브라우저에서 생성되면 상태를 업데이트
//     setAudio(newAudio);

//     // Cleanup 함수 (컴포넌트가 언마운트될 때 오디오 객체 정리)
//     return () => {
//       Object.values(newAudio).forEach((audio: HTMLAudioElement) =>
//         audio.pause()
//       );
//     };
//   }, []); // 빈 배열을 사용하여 처음 한번만 실행

//   // playMoveSound 함수
//   const playMoveSound = (san: string, captured?: boolean) => {
//     if (!audio) return; // audio가 아직 초기화되지 않았다면 아무것도 하지 않음

//     if (san.startsWith("O-O")) return audio.castle.play(); // 캐슬링
//     if (san.endsWith("+")) return audio.check.play(); // 체크
//     if (san.endsWith("#")) return audio.checkmate.play(); // 체크메이트
//     if (captured) return audio.capture.play(); // 포획
//     return audio.move.play(); // 일반 이동
//   };

//   const playSound = (soundName: keyof typeof audio) => {
//     console.log(audio);
//     console.log(audio[soundName]);
//     if (audio && audio[soundName]) {
//       audio[soundName].play(); // 해당 사운드 재생
//     }
//   };

//   return { playMoveSound, playSound };
// };

// export default useSoundPlayer;
