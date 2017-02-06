/**
 * Integer division
 */
function divide (a, b) {
  return a / b | 0
}

/**
 * Number of days in `year` years
 */
function days (year) {
  return 365 * year + divide(year, 4) - divide(year, 100) + divide(year, 400)
}

export function timestamp2datetime (timestamp) {
  let days = divide(timestamp, 86400)
  days += 719468 // 1970-01-01's day index is 719460

  let dt = index2date(days)
  let seconds = timestamp % 86400

  return Object.assign(dt, {
    hour: divide(seconds, 3600),
    minute: divide(seconds % 3600, 60),
    second: seconds % 60
  })
}

/**
 * Given a date, calculate the day index relative to March 1st, year 0.
 *
 * @see https://alcor.concordia.ca/~gpkatch/gdate-algorithm.html
 * @see https://alcor.concordia.ca/~gpkatch/gdate-method.html
 */
export function date2index (year, month, day) {
  year += month <= 12 ? 0 : divide(month - 1, 12) // Prevent month overflow
  month = (month % 12 + 9) % 12 // Make March (3) the 0-th month
  year = year - divide(month, 10)

  return days(year) + divide((month * 306 + 5), 10) + (day - 1)
}

/**
 * Given a day index relative to March 1st, year 0,
 * calculate the date (year, month, day).
 *
 * @see https://alcor.concordia.ca/~gpkatch/gdate-algorithm.html
 * @see https://alcor.concordia.ca/~gpkatch/gdate-method.html
 */
export function index2date (day) {
  let year = divide((10000 * day + 14780), 3652425)

  let dayIndex = day - days(year)

  if (dayIndex < 0) {
    year -= 1
    dayIndex = day - days(year)
  }

  let monthIndex = divide(100 * dayIndex + 52, 3060)
  let month = (monthIndex + 2) % 12 + 1

  year = year + divide(monthIndex + 2, 12)

  let date = dayIndex - divide(monthIndex * 306 + 5, 10) + 1

  return { year, month, date }
}

/**
 * Given a day index, calculate the day of week.
 */
export function day (dayIndex) {
  return (dayIndex + 3) % 7
}

export function normalize ({year, month, date, hour, minute, second}) {
  minute += divide(second, 60)
  hour += divide(minute, 60)
  date += divide(hour, 24)

  second %= 60
  minute %= 60
  hour %= 24

  if (second < 0) {
    minute -= 1
    second += 60
  }

  let dt = index2date(date2index(year, month, date))

  dt.hour = hour
  dt.minute = minute
  dt.second = second

  return dt
}
