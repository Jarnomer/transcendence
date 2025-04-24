class ServiceError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
  }
}

class NotFoundError extends ServiceError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

class BadRequestError extends ServiceError {
  constructor(message = 'Invalid input') {
    super(message, 400);
  }
}

class DatabaseError extends ServiceError {
  constructor(message = 'Database error') {
    super(message, 500);
  }
}

class NotAuthorizedError extends ServiceError {
  constructor(message = 'Not authorized') {
    super(message, 401);
  }
}

class InternalServerError extends ServiceError {
  constructor(message = 'Internal server error') {
    super(message, 500);
  }
}

export {
  BadRequestError,
  DatabaseError,
  InternalServerError,
  NotAuthorizedError,
  NotFoundError,
  ServiceError,
};
