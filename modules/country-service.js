require('dotenv').config();
require('pg'); 

const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
    logging: false, 
});

const SubRegion = sequelize.define('SubRegion', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    subRegion: Sequelize.STRING,
    region: Sequelize.STRING,
}, { timestamps: false });

const Country = sequelize.define('Country', {
    id: { type: Sequelize.STRING, primaryKey: true },
    commonName: Sequelize.STRING,
    officialName: Sequelize.STRING,
    nativeName: Sequelize.STRING,
    currencies: Sequelize.STRING,
    capital: Sequelize.STRING,
    languages: Sequelize.STRING,
    openStreetMaps: Sequelize.STRING,
    population: Sequelize.INTEGER,
    area: Sequelize.INTEGER,
    landlocked: Sequelize.BOOLEAN,
    coatOfArms: Sequelize.STRING,
    flag: Sequelize.STRING,
    subRegionId: Sequelize.INTEGER,
}, { timestamps: false });

Country.belongsTo(SubRegion, { foreignKey: 'subRegionId' });

function initialize() {
    return sequelize.sync()
        .then(() => {
            console.log('Database synced successfully.');
            return Promise.resolve();
        })
        .catch((error) => {
            console.error('Error syncing the database:', error);
            return Promise.reject(error);
        });
}

function getAllCountries() {
    return Country.findAll({
        include: [SubRegion],
    })
        .then((countries) => {
            if (countries.length === 0) {
                return Promise.reject('No countries found.');
            }
            return Promise.resolve(countries);
        })
        .catch((error) => {
            console.error('Error fetching all countries:', error);
            return Promise.reject(error);
        });
}

function getCountryById(id) {
    return Country.findOne({
        include: [SubRegion],
        where: { id },
    })
        .then((country) => {
            if (!country) {
                return Promise.reject('Unable to find requested country.');
            }
            return Promise.resolve(country);
        })
        .catch((error) => {
            console.error(`Error fetching country with id ${id}:`, error);
            return Promise.reject(error);
        });
}

function getCountriesBySubRegion(subRegion) {
    return Country.findAll({
        include: [SubRegion],
        where: {
            '$SubRegion.subRegion$': {
                [Sequelize.Op.iLike]: `%${subRegion}%`,
            },
        },
    })
        .then((countries) => {
            if (countries.length === 0) {
                return Promise.reject('Unable to find requested countries.');
            }
            return Promise.resolve(countries);
        })
        .catch((error) => {
            console.error(`Error fetching countries by sub-region ${subRegion}:`, error);
            return Promise.reject(error);
        });
}

function getCountriesByRegion(region) {
    return Country.findAll({
        include: [SubRegion],
        where: {
            '$SubRegion.region$': region,
        },
    })
        .then((countries) => {
            if (countries.length === 0) {
                return Promise.reject('Unable to find requested countries.');
            }
            return Promise.resolve(countries);
        })
        .catch((error) => {
            console.error(`Error fetching countries by region ${region}:`, error);
            return Promise.reject(error);
        });
}

function addCountry(countryData) {
    return Country.create(countryData)
        .then(() => Promise.resolve())
        .catch((err) => {
            return Promise.reject(err.errors[0].message);
        });
}

function getAllSubRegions() {
    return SubRegion.findAll()
        .then((subRegions) => Promise.resolve(subRegions))
        .catch((error) => Promise.reject(error));
}

function editCountry(id, countryData) {
    return Country.update(countryData, {
        where: { id },
    })
        .then(() => Promise.resolve())
        .catch((err) => {
            return Promise.reject(err.errors[0].message);
        });
}

function deleteCountry(id) {
    return Country.destroy({
        where: { id },
    })
        .then(() => Promise.resolve())
        .catch((err) => {
            return Promise.reject(err.errors?.[0]?.message || err.message);
        });
}



module.exports = {
    initialize,
    getAllCountries,
    getCountryById,
    getCountriesBySubRegion,
    getCountriesByRegion,
    addCountry,
    getAllSubRegions,
    editCountry,
    deleteCountry,
    sequelize,
    SubRegion,
    Country,
};