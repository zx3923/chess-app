export default class Timer {
  isRunning: boolean = false;
  startTime: number | null = null;
  overallTime: number = 0;
  maxTime: number = 0;

  constructor(starting: number) {
    this.overallTime = starting;
    this.maxTime = starting;
  }

  // 마지막 startTime 이후 경과 시간 반환
  getElapsedTimeSinceLastStart(): number {
    if (!this.startTime) return 0;
    return Date.now() - this.startTime;
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.startTime = Date.now();
  }

  stop(): void {
    if (!this.isRunning) return;
    this.isRunning = false;
    this.overallTime -= this.getElapsedTimeSinceLastStart();
  }

  setTime(newTime: number | string): void {
    this.overallTime = +newTime;
  }

  reset(): void {
    this.overallTime = this.maxTime;
    if (this.isRunning) {
      this.startTime = Date.now();
      return;
    }
    this.startTime = 0;
  }

  getTime(): number {
    // startTime이 null인 상태 => 처음 한 번도 start() 안 했거나 reset된 직후 정지 상태
    if (!this.startTime) return this.overallTime;

    // 타이머가 동작 중이라면 실시간으로 경과 시간만큼 차감
    if (this.isRunning) {
      return this.overallTime - this.getElapsedTimeSinceLastStart();
    }
    return this.overallTime;
  }
}

export function msToSec(ms: number): string {
  return (ms / 1000).toFixed(2);
}

export function secToMs(sec: number): number {
  return sec * 1000;
}
export function timeString(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds - hours * 3600) / 60);
  const secondsLeft = seconds - hours * 3600 - minutes * 60;

  let str = "";
  if (hours > 0) {
    str += `${hours}:`;
  }
  if (minutes < 10) {
    str += "0";
  }
  str += `${minutes}:`;
  if (secondsLeft < 10) {
    str += "0";
  }
  str += secondsLeft.toFixed(1);
  return str;
}
