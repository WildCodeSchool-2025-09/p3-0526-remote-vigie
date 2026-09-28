import type { RequestHandler } from "express";
import geocodingService from "../../services/geocodingService";
import { StatusCodes } from "http-status-codes";
import usersRepository from "./usersRepository";

const add: RequestHandler = async (req, res, next) => {
	try {
		const body = req.body as {
			pseudo: string;
			email: string;
			password_hash: string;
			emailNormalized: string;
			pseudoNormalized: string;
			address: {
				city: string;
				postalCode: string;
				inseeCode?: string;
				latitude?: number;
				longitude?: number;
			};
		};
		let { latitude, longitude, inseeCode } = body.address;
		let isApproximate = false;

		if (latitude == null || longitude == null || inseeCode == null) {
			const centroid = await geocodingService.geocodeCentroid(
				body.address.city,
				body.address.postalCode,
			);

			if (!centroid) {
				res.status(StatusCodes.BAD_REQUEST).json({
					error: "invalid_address",
					message: "Adresse introuvable.",
				});
				return;
			}
			latitude = centroid.latitude;
			longitude = centroid.longitude;
			inseeCode = centroid.inseeCode;
			isApproximate = true;
		}
		const userId = await usersRepository.create({
			pseudo: body.pseudo,
			email: body.email,
			pseudoNormalized: body.pseudoNormalized,
			emailNormalized: body.emailNormalized,
			passwordHash: body.password_hash,
			cguVersion: "1",
			cguAcceptedAt: new Date(),
			city: body.address.city,
			postalCode: body.address.postalCode,
			inseeCode,
			latitude,
			longitude,
			isApproximate,
		});
		res.status(StatusCodes.CREATED).json({ id: userId });
	} catch (err) {
		next(err);
	}
};

export default {
	add,
};
