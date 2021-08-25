"use strict";
const axios = require("axios");
require("dotenv").config();
const apiUrl = process.env.API_URL;
const apiKey = process.env.API_KEY;

//axios 
const airQualityAuthAxios = axios.create({
	baseURL: apiUrl,
	params: { key: apiKey }
});

module.exports = {

	//view to search air quality
	airQuality: (req, res) => {
		res.render("airQuality/air-quality");
	},

	//search by city
	airQualitySearch: async (req, res, next) => {
		try {
			let search = req.body.search;
			let result = await airQualityAuthAxios.get("/city?city=" + search + "&state=Utah&country=USA")
			res.locals.city = result.data.data;
			next();
		} catch (error) {
			console.log("Error quality: ", error);
			next(error);
		}

	},

	//view of air quality result
	airQualityView: (req, res) => {
		res.render("airQuality/air-quality-view");
	},


}