import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import departmentFromInsee from "../../services/department";
import vigilanceService from "../../services/vigilanceService";
import addressRepository from "../address/addressRepository";

const read: RequestHandler = async (req, res, next) => {
	try {
		const userId = Number(req.auth?.sub);

		const address = await addressRepository.findOldestAddress(userId);
		if (address == null) {
			res.sendStatus(StatusCodes.NO_CONTENT);
			return;
		}

		const department = departmentFromInsee(address.inseeCode);
		const vigilance = await vigilanceService.getVigilance(department);
		if (vigilance == null) {
			res.sendStatus(StatusCodes.NO_CONTENT);
			return;
		}

		res.json({
			level: vigilance.level,
			department,
			city: address.city,
			updatedAt: vigilance.updatedAt,
		});
	} catch (err) {
		next(err);
	}
};

export default { read };
