import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { AppError } from "../errors/AppError";
import { SurveyUserRepository } from "../repositories/SurveyUserRepository";

class AnswerController {

    async execute(request: Request, response: Response) {
        const { value } = request.params;
        const { u } = request.query;

        const surveyUsersRepository = getCustomRepository(SurveyUserRepository);

        const surveyUser = await surveyUsersRepository.findOne({
            id: String(u),
        })

        if(!surveyUser) {
            throw new AppError("SurveyUser does not exist.")
        }

        surveyUser.value = surveyUser.value != null ? surveyUser.value : Number(value);
        await surveyUsersRepository.save(surveyUser);

        return response.json(surveyUser);
    }
}

export { AnswerController };