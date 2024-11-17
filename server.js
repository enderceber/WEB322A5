/********************************************************************************
*  WEB322 – Assignment 05
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Ender Ceber Student ID: 124191230 Date: 2024-11-16
*
*  Published URL: 
*
********************************************************************************/


const express = require('express');
const {
    initialize,
    getAllCountries,
    getCountryById,
    getCountriesBySubRegion,
    getCountriesByRegion,
    addCountry,
    getAllSubRegions,
    editCountry, 
    deleteCountry,
} = require('./modules/country-service');

const app = express();
app.set('view engine', 'ejs');
app.set('views', './views');

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

app.get('/', (req, res) => {
    res.send('Server is running.');
});

app.get('/deleteCountry/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await deleteCountry(id); 
        res.redirect('/countries'); 
    } catch (err) {
        res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
    }
});

app.get('/countries', async (req, res) => {
    try {
        const countries = await getAllCountries();
        res.render('countries', { countries });
    } catch (error) {
        res.status(500).render('500', { message: `Unable to fetch countries: ${error}` });
    }
});

app.get('/countries/:id', async (req, res) => {
    try {
        const country = await getCountryById(req.params.id);
        res.json(country);
    } catch (error) {
        res.status(404).send(error);
    }
});

app.get('/countries/subregion/:subRegion', async (req, res) => {
    try {
        const countries = await getCountriesBySubRegion(req.params.subRegion);
        res.json(countries);
    } catch (error) {
        res.status(404).send(error);
    }
});

app.get('/countries/region/:region', async (req, res) => {
    try {
        const countries = await getCountriesByRegion(req.params.region);
        res.json(countries);
    } catch (error) {
        res.status(404).send(error);
    }
});

app.get('/addCountry', async (req, res) => {
    try {
        const subRegions = await getAllSubRegions();
        res.render('addCountry', { subRegions });
    } catch (error) {
        res.render('500', { message: `Unable to load sub-regions: ${error}` });
    }
});

app.post('/addCountry', async (req, res) => {
    try {
        await addCountry(req.body);
        res.redirect('/countries');
    } catch (error) {
        res.render('500', { message: `I'm sorry, but we have encountered the following error: ${error}` });
    }
});

app.get('/editCountry/:id', async (req, res) => {
    try {
        const country = await getCountryById(req.params.id);
        const subRegions = await getAllSubRegions();
        res.render('editCountry', { country, subRegions });
    } catch (err) {
        res.status(404).render('404', { message: `Country not found: ${err}` });
    }
});

app.post('/editCountry', async (req, res) => {
    try {
        const id = req.body.id;
        await editCountry(id, req.body); 
        res.redirect('/countries');
    } catch (err) {
        res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
    }
});

initialize()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Failed to initialize the application:', err);
    });
