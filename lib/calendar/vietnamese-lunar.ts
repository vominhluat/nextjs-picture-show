const VIETNAM_TIME_ZONE = 7;

export interface LunarDate {
  day: number;
  month: number;
  year: number;
  leap: boolean;
}

const integer = Math.floor;

function julianDayFromDate(day: number, month: number, year: number) {
  const a = integer((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  let jd = day + integer((153 * m + 2) / 5) + 365 * y + integer(y / 4) - integer(y / 100) + integer(y / 400) - 32045;
  if (jd < 2299161) jd = day + integer((153 * m + 2) / 5) + 365 * y + integer(y / 4) - 32083;
  return jd;
}

function newMoon(k: number) {
  const t = k / 1236.85;
  const t2 = t * t;
  const t3 = t2 * t;
  const radians = Math.PI / 180;
  let jd = 2415020.75933 + 29.53058868 * k + 0.0001178 * t2 - 0.000000155 * t3;
  jd += 0.00033 * Math.sin((166.56 + 132.87 * t - 0.009173 * t2) * radians);
  const m = 359.2242 + 29.10535608 * k - 0.0000333 * t2 - 0.00000347 * t3;
  const mPrime = 306.0253 + 385.81691806 * k + 0.0107306 * t2 + 0.00001236 * t3;
  const f = 21.2964 + 390.67050646 * k - 0.0016528 * t2 - 0.00000239 * t3;
  let correction = (0.1734 - 0.000393 * t) * Math.sin(m * radians) + 0.0021 * Math.sin(2 * m * radians);
  correction -= 0.4068 * Math.sin(mPrime * radians) + 0.0161 * Math.sin(2 * mPrime * radians);
  correction -= 0.0004 * Math.sin(3 * mPrime * radians);
  correction += 0.0104 * Math.sin(2 * f * radians) - 0.0051 * Math.sin((m + mPrime) * radians);
  correction -= 0.0074 * Math.sin((m - mPrime) * radians) + 0.0004 * Math.sin((2 * f + m) * radians);
  correction -= 0.0004 * Math.sin((2 * f - m) * radians) - 0.0006 * Math.sin((2 * f + mPrime) * radians);
  correction += 0.001 * Math.sin((2 * f - mPrime) * radians) + 0.0005 * Math.sin((2 * mPrime + m) * radians);
  const deltaT = t < -11 ? 0.001 + 0.000839 * t + 0.0002261 * t2 - 0.00000845 * t3 - 0.000000081 * t * t3 : -0.000278 + 0.000265 * t + 0.000262 * t2;
  return integer(jd + correction - deltaT + 0.5 + VIETNAM_TIME_ZONE / 24);
}

function sunLongitude(julianDay: number) {
  const t = (julianDay - 2451545.5 - VIETNAM_TIME_ZONE / 24) / 36525;
  const t2 = t * t;
  const radians = Math.PI / 180;
  const meanAnomaly = 357.5291 + 35999.0503 * t - 0.0001559 * t2 - 0.00000048 * t * t2;
  const meanLongitude = 280.46645 + 36000.76983 * t + 0.0003032 * t2;
  let delta = (1.9146 - 0.004817 * t - 0.000014 * t2) * Math.sin(radians * meanAnomaly);
  delta += (0.019993 - 0.000101 * t) * Math.sin(2 * radians * meanAnomaly) + 0.00029 * Math.sin(3 * radians * meanAnomaly);
  let longitude = (meanLongitude + delta) * radians;
  longitude -= Math.PI * 2 * integer(longitude / (Math.PI * 2));
  return integer(longitude / Math.PI * 6);
}

function lunarMonthEleven(year: number) {
  const offset = julianDayFromDate(31, 12, year) - 2415021;
  const k = integer(offset / 29.530588853);
  let moon = newMoon(k);
  if (sunLongitude(moon) >= 9) moon = newMoon(k - 1);
  return moon;
}

function leapMonthOffset(monthEleven: number) {
  const k = integer((monthEleven - 2415021.076998695) / 29.530588853 + 0.5);
  let last = 0;
  let index = 1;
  let arc = sunLongitude(newMoon(k + index));
  do {
    last = arc;
    index += 1;
    arc = sunLongitude(newMoon(k + index));
  } while (arc !== last && index < 14);
  return index - 1;
}

export function solarToVietnameseLunar(date: Date): LunarDate {
  const dayNumber = julianDayFromDate(date.getDate(), date.getMonth() + 1, date.getFullYear());
  const k = integer((dayNumber - 2415021.076998695) / 29.530588853);
  let monthStart = newMoon(k + 1);
  if (monthStart > dayNumber) monthStart = newMoon(k);
  let monthElevenA = lunarMonthEleven(date.getFullYear());
  let monthElevenB = monthElevenA;
  let lunarYear: number;
  if (monthElevenA >= monthStart) {
    lunarYear = date.getFullYear();
    monthElevenA = lunarMonthEleven(date.getFullYear() - 1);
  } else {
    lunarYear = date.getFullYear() + 1;
    monthElevenB = lunarMonthEleven(date.getFullYear() + 1);
  }
  const lunarDay = dayNumber - monthStart + 1;
  const difference = integer((monthStart - monthElevenA) / 29);
  let lunarMonth = difference + 11;
  let leap = false;
  if (monthElevenB - monthElevenA > 365) {
    const leapDifference = leapMonthOffset(monthElevenA);
    if (difference >= leapDifference) {
      lunarMonth = difference + 10;
      leap = difference === leapDifference;
    }
  }
  if (lunarMonth > 12) lunarMonth -= 12;
  if (lunarMonth >= 11 && difference < 4) lunarYear -= 1;
  return { day: lunarDay, month: lunarMonth, year: lunarYear, leap };
}

export function lunarYearName(year: number) {
  const stems = ["Canh", "Tân", "Nhâm", "Quý", "Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ"];
  const branches = ["Thân", "Dậu", "Tuất", "Hợi", "Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi"];
  return `${stems[year % 10]} ${branches[year % 12]}`;
}
