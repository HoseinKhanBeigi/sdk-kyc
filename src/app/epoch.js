const JalaliDate = {
  g_days_in_month: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
  j_days_in_month: [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29],
};

JalaliDate.jalaliToGregorian = function (j_y, j_m, j_d) {
  j_y = parseInt(j_y);
  j_m = parseInt(j_m);
  j_d = parseInt(j_d);
  var jy = j_y - 979;
  var jm = j_m - 1;
  var jd = j_d - 1;

  var j_day_no =
    365 * jy + parseInt(jy / 33) * 8 + parseInt(((jy % 33) + 3) / 4);
  for (var i = 0; i < jm; ++i) j_day_no += JalaliDate.j_days_in_month[i];

  j_day_no += jd;

  var g_day_no = j_day_no + 79;

  var gy =
    1600 +
    400 *
      parseInt(
        g_day_no / 146097
      ); /* 146097 = 365*400 + 400/4 - 400/100 + 400/400 */
  g_day_no = g_day_no % 146097;

  var leap = true;
  if (g_day_no >= 36525) {
    /* 36525 = 365*100 + 100/4 */
    g_day_no--;
    gy +=
      100 * parseInt(g_day_no / 36524); /* 36524 = 365*100 + 100/4 - 100/100 */
    g_day_no = g_day_no % 36524;

    if (g_day_no >= 365) g_day_no++;
    else leap = false;
  }

  gy += 4 * parseInt(g_day_no / 1461); /* 1461 = 365*4 + 4/4 */
  g_day_no %= 1461;

  if (g_day_no >= 366) {
    leap = false;

    g_day_no--;
    gy += parseInt(g_day_no / 365);
    g_day_no = g_day_no % 365;
  }

  for (
    var i = 0;
    g_day_no >= JalaliDate.g_days_in_month[i] + (i == 1 && leap);
    i++
  )
    g_day_no -= JalaliDate.g_days_in_month[i] + (i == 1 && leap);
  var gm = i + 1;
  var gd = g_day_no + 1;

  gm = gm < 10 ? "0" + gm : gm;
  gd = gd < 10 ? "0" + gd : gd;

  return [gy, gm, gd];
};
// var myDate = "1403-4-16",
//     dateSplitted = myDate.split("-"),
//
// let jResult = jD[0] + "-" + jD[1] + "-" + jD[2];

function isLeapYear(year) {
  if (year % 4 !== 0) return false;
  if (year % 100 !== 0) return true;
  if (year % 400 !== 0) return false;
  return true;
}

function daysInMonth(year, month) {
  const monthDays = [
    31,
    isLeapYear(year) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  return monthDays[month - 1];
}

function daysFromEpoch(year, month, day) {
  let days = 0;
  // Days in previous years
  for (let y = 1970; y < year; y++) {
    days += isLeapYear(y) ? 366 : 365;
  }
  // Days in current year before the given month
  for (let m = 1; m < month; m++) {
    days += daysInMonth(year, m);
  }
  // Days in the current month
  days += day - 1; // subtract 1 because the current day isn't completed yet
  return days;
}

function dateToEpoch(
  year,
  month,
  day,
  hour = 0,
  minute = 0,
  second = 0,
  millisecond = 0
) {
  const days = daysFromEpoch(year, month, day);
  const hoursInMillis = hour * 3600 * 1000;
  const minutesInMillis = minute * 60 * 1000;
  const secondsInMillis = second * 1000;
  const totalMillis =
    days * 24 * 3600 * 1000 +
    hoursInMillis +
    minutesInMillis +
    secondsInMillis +
    millisecond;
  return totalMillis;
}

// Example usage:
// const year = jD[0];
// const month = jD[1]; // July
// const day = jD[2];
// const hour = 0;
// const minute = 0;
// const second = 0;
// const millisecond = 0;
//
// const epochTimestamp = dateToEpoch(year, month, day, hour, minute, second, millisecond);
// console.log(`Epoch Timestamp: ${epochTimestamp}`);

export default function getEpoch(year, month, day) {
  const hour = 0;
  const minute = 0;
  const second = 0;
  const millisecond = 0;
  const jD = JalaliDate.jalaliToGregorian(year, month, day);
  const epochTimestamp = dateToEpoch(
    jD[0],
    jD[1],
    jD[2],
    hour,
    minute,
    second,
    millisecond
  );
  return epochTimestamp;
}
