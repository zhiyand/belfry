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

let beginning = date2index(1970, 1, 1)

let properties = {
  days: {
    configurable: false,
    enumerable: true,
    get () {
      return date2index(this.year, this.month, this.date)
    },
    set () {
      return false
    }
  },

  day: {
    configurable: false,
    enumerable: true,
    get () {
      return day(this.days)
    },
    set () {
      return false
    }
  },

  timestamp: {
    configurable: false,
    enumerable: true,
    get () {
      return (this.days - beginning) * 86400 +
        this.hour * 3600 + this.minute * 60 + this.second +
        this.offset
    },
    set () {
      return false
    }
  },

  offset: {
    configurable: false,
    enumerable: true,
    get () {
      return this.timezone * 3600
    },
    set () {
      return false
    }
  }
}

let units = {
  second: 1,
  minute: 60,
  hour: 3600,
  day: 86400,
  week: 7 * 86400,
  month: 30 * 86400,
  year: 365 * 86400,
  centry: 36500 * 86400
}

export class Duration {
  constructor (seconds) {
    this.seconds = seconds
  }

  in (unit) {
    return this.seconds / units[unit]
  }
}

export default class DateTime {
  constructor (year, month, date, hour, minute, second, timezone, locale) {
    if (year instanceof DateTime) {
      this.createFromDateTime(year)
    } else if (arguments.length === 1) {
      this.createFromTimestamp(year)
    } else {
      this.initialize(year, month, date, hour, minute, second, timezone, locale)
    }

    this.durationRegExp = new RegExp('([+-]?\\d)\\s(\\w+)s?$')
  }

  initialize (year, month, date, hour = 0, minute = 0, second = 0, timezone, locale) {
    timezone = timezone || new Date().getTimezoneOffset() / -60

    let dt = normalize({year, month, date, hour, minute, second})

    let attrs = {year: dt.year, month: dt.month, date: dt.date, hour, minute, second, timezone, locale}

    for (let name in attrs) {
      Object.defineProperty(this, name, {
        configurable: false,
        enumerable: true,
        get () { return attrs[name] },
        set (value) {
          attrs[name] = value

          attrs = Object.assign(attrs, normalize(attrs))
        }
      })
    }

    for (let key in properties) {
      Object.defineProperty(this, key, properties[key])
    }
  }

  createFromDateTime (dt) {
    this.initialize(dt.year, dt.month, dt.date, dt.hour, dt.minute, dt.second, dt.timezone, dt.locale)
  }

  createFromTimestamp (timestamp, timezone, locale) {
    let dt = timestamp2datetime(timestamp)

    this.initialize(dt.year, dt.month, dt.date, dt.hour, dt.minute, dt.second, timezone, locale)
  }

  diff (dt) {
    return new Duration(this.timestamp - dt.timestamp)
  }

  /**
   * @public
   *
   * @param duration String  +1 day +3 days -2 hours -1 hour +36 minutes
   */
  add (duration) {
    let { amount, unit } = this.parseDuration(duration)

    let dt = new DateTime(this)
    dt[unit] += amount

    return dt
  }

  /**
   * @private
   */
  parseDuration (duration) {
    let [, amount, unit] = this.durationRegExp.exec(duration)

    amount = parseInt(amount)
    unit = unit.substr(-1, 1) === 's' ? unit.slice(0, unit.length - 1) : unit
    unit = unit === 'day' ? 'date' : unit

    return { amount, unit }
  }

  /**
   * @public
   */
  sub (duration) {
    let { amount, unit } = this.parseDuration(duration)

    let dt = new DateTime(this)
    dt[unit] += amount

    return dt
  }

  /**
   * @public
   */
  format (template) {
  }

  toString () {
    return `${this.day} ${this.year}-${this.month}-${this.date} ${this.hour}:${this.minute}:${this.second} `
  }
}
