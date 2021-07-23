export default function getDateTimeAndTimeZone(): { clientDateTime: Date; timeZone: string } {
  const clientDateTime = new Date();
  clientDateTime.setSeconds(0);

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return { clientDateTime, timeZone };
}
