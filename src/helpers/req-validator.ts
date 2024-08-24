import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { NextFunction, Request, Response } from 'express';


class ReqBodyError extends Error {
    errors = [];
    constructor(data: []) {
      super();
      this.errors = data;
    }
}

export const reqValidator = async (
    dtoClass: ClassConstructor<unknown>,
    body: object
  ): Promise<unknown> => {
    const result = plainToInstance(dtoClass, body, { exposeUnsetFields: false });
    const errors = await validate(result as object, {
      skipMissingProperties: true,
    });
    if (errors.length > 0) {
      const errorTexts = [];
      for (const errorItem of errors) {
        errorTexts.push(errorItem.constraints);
      }
      throw new ReqBodyError(errorTexts as []);
    }
    return result;
  };