import {date2index, timestamp2datetime, normalize, day} from './utils'

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

