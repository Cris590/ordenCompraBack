/* eslint-disable no-console */
enum LogType {
    RESET = '\x1b[0m',
    ERROR = '\x1b[31m%s\x1b[0m', // red
    WARN = '\x1b[33m%s\x1b[0m', // yellow
    INFO = '\x1b[36m%s\x1b[0m', // cyan
    SUCCESS = '\x1b[32m%s\x1b[0m', // green
  }
  
  export const blackbox = {
    error(message: unknown, ...optionalParams: unknown[]) {
      console.error(LogType.ERROR, message, ...optionalParams);
    },
    warn(message: unknown, ...optionalParams: unknown[]) {
      console.warn(LogType.WARN, message, ...optionalParams);
    },
    info(message: unknown, ...optionalParams: unknown[]) {
      console.info(LogType.INFO, message, ...optionalParams);
    },
    success(message: unknown, ...optionalParams: unknown[]) {
      console.info(LogType.SUCCESS, message, ...optionalParams);
    },
  };
  
  import { createLogger, format, transports } from 'winston';
  
  
  const MAX_SIZE_LOG = process.env.MAX_SIZE_LOG || 5120000
  const MAX_FILE_LOG = process.env.MAX_FILE_LOG || 5
  
  
  
  let customFormat=format.combine(
      format.simple(), 
      format.timestamp(), 
      format.printf((info)=>`[${info.timestamp}] ${info.level} ${info.message} \n\n`)
  )
  
  export const logDatabaseHCH = createLogger({
      format:customFormat,
      transports:[
          new transports.File({
              maxsize: +MAX_SIZE_LOG,
              maxFiles:+MAX_FILE_LOG,
              filename: `${__dirname}/../../logs/databaseHCH.log`
          }),
          
          new transports.Console({
              level: 'debug'
          })
      ]
  })
  
  export const logDatabasePYS = createLogger({
      format:customFormat,
      transports:[
          new transports.File({
              maxsize: +MAX_SIZE_LOG,
              maxFiles: +MAX_FILE_LOG,
              filename: `${__dirname}/../../logs/databasePYS.log`
          }),
          
          new transports.Console({
              level: 'debug'
          })
      ]
  })
  
  export const logErrorApp = createLogger({
    format:customFormat,
    transports:[
        new transports.File({
            maxsize: +MAX_SIZE_LOG,
            maxFiles: +MAX_FILE_LOG,
            filename: `${__dirname}/../../logs/error.log`
        }),
        
        new transports.Console({
            level: 'debug'
        })
    ]
  })
  
  