import { Request, Response } from 'express';

class UserController {
    async create(request: Request, response: Response) {
        response.send(request.body.name);
    }
}

export { UserController }