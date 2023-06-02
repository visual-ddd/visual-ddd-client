export function createExpiredTime(time: number): number{
  return Date.now() + time;
}

export function createExpiredTimeToISOString(time: number | Date): string{
  if(typeof time ==='object'){
    return time.toISOString()
  }
  return (new Date(createExpiredTime(time))).toISOString();
}