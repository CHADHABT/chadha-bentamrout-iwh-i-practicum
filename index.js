const express = require('express');
const axios = require('axios');
const app = express();

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// * Please DO NOT INCLUDE the private app access token in your repo. Don't do this practicum in your normal account.
const PRIVATE_APP_ACCESS = process.env.HUBSPOT_ACCESS_TOKEN;

// TODO: ROUTE 1 - Create a new app.get route for the homepage to call your custom object data. Pass this data along to the front-end and create a new pug template in the views folder.
app.get('/', async (req, res) => {
    try {
        const response = await axios.get(
            `https://api.hubapi.com/crm/v3/objects/p_pets`,
            {
                headers: {
                    'Authorization': `Bearer ${PRIVATE_APP_ACCESS}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    properties: 'name,type,description'
                }
            }
        );

        const pets = response.data.results || [];
        
        res.render('homepage', {
            title: 'Pet Records | HubSpot Practicum',
            pets: pets
        });
    } catch (error) {
        console.error('Error fetching pets:', error.response?.data || error.message);
        res.render('homepage', {
            title: 'Pet Records | HubSpot Practicum',
            pets: [],
            error: 'Failed to fetch pet records'
        });
    }
});

// TODO: ROUTE 2 - Create a new app.get route for the form to create or update new custom object data. Send this data along in the next route.

app.get('/update-cobj', async (req, res) => {
    try {
        const petId = req.query.id;
        let petData = null;
        
        // If ID is provided, fetch existing pet data for updating
        if (petId) {
            const response = await axios.get(
                `https://api.hubapi.com/crm/v3/objects/p_pets/${petId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${PRIVATE_APP_ACCESS}`,
                        'Content-Type': 'application/json'
                    },
                    params: {
                        properties: 'name,type,description'
                    }
                }
            );
            petData = response.data;
        }
        
        res.render('updates', {
            title: 'Update Custom Object Form | Integrating With HubSpot I Practicum',
            pet: petData,
            isUpdate: !!petId
        });
    } catch (error) {
        console.error('Error fetching pet for update:', error.response?.data || error.message);
        res.render('updates', {
            title: 'Update Custom Object Form | Integrating With HubSpot I Practicum',
            error: 'Failed to fetch pet data for update.'
        });
    }
});



// TODO: ROUTE 3 - Create a new app.post route for the custom objects form to create or update your custom object data. Once executed, redirect the user to the homepage.
app.post('/update-cobj', async (req, res) => {
    try {
        const { name, type, description, petId } = req.body;
        
        const petData = {
            properties: {
                name: name,
                type: type,
                description: description
            }
        };

        if (petId) {
            // Update existing record
            await axios.patch(
                `https://api.hubapi.com/crm/v3/objects/p_pets/${petId}`,
                petData,
                {
                    headers: {
                        'Authorization': `Bearer ${PRIVATE_APP_ACCESS}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
        } else {
            // Create new record
            await axios.post(
                `https://api.hubapi.com/crm/v3/objects/p_pets`,
                petData,
                {
                    headers: {
                        'Authorization': `Bearer ${PRIVATE_APP_ACCESS}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
        }
        res.redirect('/');
    } catch (error) {
        console.error('Error saving pet record:', error.response?.data || error.message);
        res.render('updates', {
            title: 'Update Custom Object Form | Integrating With HubSpot I Practicum',
            error: 'Failed to save pet record. Please try again.',
            pet: req.body
        });
    }
});

/** 
* * This is sample code to give you a reference for how you should structure your calls. 

* * App.get sample
app.get('/contacts', async (req, res) => {
    const contacts = 'https://api.hubspot.com/crm/v3/objects/contacts';
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    }
    try {
        const resp = await axios.get(contacts, { headers });
        const data = resp.data.results;
        res.render('contacts', { title: 'Contacts | HubSpot APIs', data });      
    } catch (error) {
        console.error(error);
    }
});

* * App.post sample
app.post('/update', async (req, res) => {
    const update = {
        properties: {
            "favorite_book": req.body.newVal
        }
    }

    const email = req.query.email;
    const updateContact = `https://api.hubapi.com/crm/v3/objects/contacts/${email}?idProperty=email`;
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    };

    try { 
        await axios.patch(updateContact, update, { headers } );
        res.redirect('back');
    } catch(err) {
        console.error(err);
    }

});
*/


// * Localhost
app.listen(3000, () => console.log('Listening on http://localhost:3000'));