import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  statusCode: number;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const response = context.switchToHttp().getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((data) => ({
        statusCode,
        message: data?.message || 'Request processed successfully',
        // Nếu data có thuộc tính message riêng thì tách ra, còn lại đẩy vào ô data
        data:
          data && data.message && Object.keys(data).length === 1
            ? null
            : data?.message
              ? { ...data, message: undefined }
              : data,
      })),
    );
  }
}
