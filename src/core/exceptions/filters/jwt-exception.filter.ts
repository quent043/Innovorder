import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpStatus
} from '@nestjs/common';
import { Request, Response } from 'express';
import {LoggingService} from "../../../utils/logging/logging.service";
import {JsonWebTokenError} from "jsonwebtoken";
import {INVALID_TOKEN_ERROR_MESSAGE} from "../error-messages";

@Catch(JsonWebTokenError)
export class JwtExceptionFilter implements ExceptionFilter {

    constructor(
        private logger: LoggingService
    ) {}

    catch(exception: JsonWebTokenError, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        let message = exception.message;

        this.logger.error(message);

        response
            .status(HttpStatus.UNAUTHORIZED)
            .json({
                statusCode: (HttpStatus.UNAUTHORIZED),
                timestamp: new Date().toISOString(),
                path: request.url,
                message: INVALID_TOKEN_ERROR_MESSAGE
            });
    }
}