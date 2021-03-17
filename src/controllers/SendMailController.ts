import { Request, response, Response } from 'express';
import { getCustomRepository } from "typeorm";
import { SurveysRepository } from "../repositories/SurveysRepository";
import { SurveyUserRepository } from "../repositories/SurveyUserRepository";
import { UsersRepository } from "../repositories/UsersRepository";
import SendMailService from '../services/SendMailService';
import path from 'path';
import { AppError } from '../errors/AppError';

const sendMailService = new SendMailService();

class SendMailController {
    async execute(req: Request, res: Response) {
        const { email, survey_id } = req.body;

        const usersRepository = getCustomRepository(UsersRepository);
        const surveysRespository = getCustomRepository(SurveysRepository);
        const surveyUserRepository = getCustomRepository(SurveyUserRepository);

        const user = await usersRepository.findOne({email});
        if (!user) {
            throw new AppError('User does not exist.');
        }
        const survey = await surveysRespository.findOne({id: survey_id});
        if (!survey) {
            throw new AppError('Survey does not exist.');
        }
        
        const npsPath = path.resolve(__dirname, '..', 'views', 'emails', 'npsMail.hbs');
        
        const surveyUserAlreadyExists = await surveyUserRepository.findOne({
            where: {user_id: user.id, value: null},
            relations: ['user', 'survey'],
        });
        
        const variables = {
            name: user.name,
            title: survey.title,
            description: survey.description,
            id: "",
            link: process.env.URL_MAIL,
        }

        if (surveyUserAlreadyExists) {
            variables.id = surveyUserAlreadyExists.id;
            await sendMailService.execute(email, survey.title, variables, npsPath);
            return res .json(surveyUserAlreadyExists);
        }
        
        // salvar informações na tabela survey_user
        const surveyUser = surveyUserRepository.create({
            user_id: user.id,
            survey_id,        
         });

        
        // enviar email para usuario

        await surveyUserRepository.save(surveyUser);
        variables.id = surveyUser.id;
        await sendMailService.execute(email, survey.title, variables, npsPath).catch(err => console.log('ERRO'));

        return res.json(surveyUser);
    }
}

export { SendMailController }