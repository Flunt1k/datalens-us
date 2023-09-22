import {Request, Response, NextFunction} from '@gravity-ui/expresskit';

export const dlContext = (req: Request, res: Response, next: NextFunction) => {
    res.locals.dlContext = req.headers['x-dl-context'] || '{}';
    next();
};
