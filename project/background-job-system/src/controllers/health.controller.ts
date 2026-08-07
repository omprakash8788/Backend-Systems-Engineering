import { Request, Response } from 'express'

export const getHealth = async (_req: Request, res: Response) => {
    res.status(200).json({
        status: "UP",
        "services": {
            "database": "UP",

            "redis": "UP"
        },
         "uptime":154,
        timestamp: new Date().toISOString()
    });
}

