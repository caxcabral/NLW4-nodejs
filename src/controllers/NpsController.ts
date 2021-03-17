import { Request, Response } from "express";
import { getCustomRepository, Not, IsNull } from "typeorm";
import { SurveyUser } from "../models/SurveyUser";
import { SurveyUserRepository } from "../repositories/SurveyUserRepository";

/*

Detratores ==> 0 - 6;
Passivos ==> 7 - 8;
Promotores ==> 9 - 10;


(Número de promotores - número de detratores) / (número de respondentes) * 100
*/

class NpsController {
    async execute(request: Request, response: Response) {
        const survey_id  = request.params.value;

        const surveyUserRepository = getCustomRepository(SurveyUserRepository);

        const surveyUsers = await surveyUserRepository.find({
            survey_id,
            value: Not(IsNull()),
        });

        console.log(surveyUsers)
        
        const detractor = await surveyUsers.filter((survey) => survey.value <= 6 
            && survey.value >= 0).length;
        const promoters = await surveyUsers.filter((survey) => survey.value >= 9 
            && survey.value <= 10).length;
        const passive = await surveyUsers.filter((survey) => survey.value == 7
            || survey.value == 8).length;
        const totalAnswers = surveyUsers.length;

        const nps = Number(
            ((promoters - detractor) / totalAnswers * 100).toFixed(2)
        );

        return response.json({
            detractor,
            promoters,
            passive,
            totalAnswers,
            nps
        });
    }
}

export { NpsController };