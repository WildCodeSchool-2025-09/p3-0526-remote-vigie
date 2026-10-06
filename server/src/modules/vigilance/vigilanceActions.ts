import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import departmentFromInsee from "../../services/department";
import vigilanceService from "../../services/vigilanceService";
import addressRepository from "../address/addressRepository";

const read: RequestHandler = async (req, res, next) => {
	try {
		const userId = Number(req.auth?.sub);

		const inseeCode = await addressRepository.findOldestInseeCode(userId);
		if (inseeCode == null) {
			res.sendStatus(StatusCodes.NO_CONTENT);
			return;
		}

		const level = await vigilanceService.getVigilanceLevel(
			departmentFromInsee(inseeCode),
		);
		if (level == null) {
			res.sendStatus(StatusCodes.NO_CONTENT);
			return;
		}

		res.json({ level });
	} catch (err) {
		next(err);
	}
};

export default { read };
