import { BadRequestException, Param, ParseUUIDPipe } from '@nestjs/common';

/*Декоратор для извлечения URI-параметра с проверкой, что он является валидным UUID.*/
export const UuidParam = (paramName: string = 'id'): ParameterDecorator =>
  Param(
    paramName,
    new ParseUUIDPipe({
      exceptionFactory: (): BadRequestException =>
        new BadRequestException({
          errorsMessages: [{ field: paramName, message: `Field "${paramName}" must be a valid UUID` }],
        }),
    })
  );
