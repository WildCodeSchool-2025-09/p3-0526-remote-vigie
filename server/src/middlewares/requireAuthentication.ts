import type { RequestHandler } from "express";
import usersRepository from "../modules/users/usersRepository";

const requireAuthentication: RequestHandler = async (req, res, next) => {
  if (process.env.NODE_ENV !== "production" && req.payload == null) {
    const user = await usersRepository.first();
    if (user != null) req.payload = { sub: user.id };
  }

  if (req.payload?.sub == null) {
    res.sendStatus(401);
    return;
  }

  next();
};

export default requireAuthentication;
