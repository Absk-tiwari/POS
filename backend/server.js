require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Model } = require('objection');
const Knex = require('knex');
const path = require('path');

// Vyawastha For Sqlite

// const knex = Knex({
//   client: 'sqlite3',
//   connection: {
//     filename: './database/db.sqlite',
//   },
//   useNullAsDefault: true,
// });

const knex = Knex({
    client: 'mysql2',
    connection: {
        host:"srv1676.hstgr.io",
        user:"u272122742_remote",
        password:"POS@dftech123",
        database:"u272122742_remote",
        port:3306
    }
});

Model.knex(knex);

const server = express();
const port = 5101;
server.use(cors());
server.use(express.json());
server.use('/images', express.static(path.join(__dirname, 'tmp')));

server.get("/", (r, res) => res.send("Exit"));

server.use("/auth", require("./routes/auth"));
server.use("/products", require("./routes/products"));
server.use("/orders", require("./routes/orders"));
server.use("/category", require("./routes/category"));
server.use("/tax", require("./routes/tax"));
server.use("/pos", require("./routes/pos"));
server.use("/notes", require("./routes/notes"));
server.use("/config", require("./routes/config"));


server.get('/install-update', async(req, res)=> {
    try {

        const fs = require('fs');
        const axios = require('axios');
        const url = 'https://pos.dftech.in/updates/download'; // Replace with actual URL
        const outputFolder = path.join(__dirname, './tmp');
        const outputFileName = 'update.zip';
        const outputPath = path.join(outputFolder, outputFileName);

        // Download and save file;
        // axios({ method: 'GET', url, responseType: 'stream' }).then( response => {
        //     const writer = fs.createWriteStream(outputPath);
        //     response.data.pipe(writer);
        //     writer.on('finish', () => console.log('Download completed:', outputPath));
        //     writer.on('error', err => console.error('Error writing file:', err));
        // }).catch(err => console.error('Download failed:', err.message));

        const {data} = await axios({ method: 'GET', url, responseType: 'stream' });
        const writer = fs.createWriteStream(outputPath);

        data.pipe(writer);

        writer.on('finish', async () => {
            const data = await extractZip(outputPath, path.join(__dirname,'client'));
            if(data.status) {
                fs.unlinkSync(outputPath);
            }
        });

        writer.on('error', () => {
            return res.json({
                status:false,
                message: 'Failed downloading update!'
            });
        })
        return res.json({
            status:true,
            message: 'UI update installed!'
        });

    } catch (error) {
        return res.json({
            status:false, 
            message:error.message
        });
    }

})

server.get('/check-connection', async(req,res) => {
    knex.raw('SELECT 1')
    .then(() => {
        return res.json({status:true, message: '✅ Database connected successfully!'});
    })
    .catch((err) => {
        return res.json({status:false, message: '❌ Database connection failed'});
    })
})

server.get("install-backend-update", async(req,res) => {

    try 
    {
        const fs = require('fs');
        const axios = require('axios')
        const url = 'https://pos.dftech.in/backend-updates/download'; 
        const outputFolder = path.join(__dirname, './tmp');
        const outputFileName = 'updates.zip';
        const outputPath = path.join(outputFolder, outputFileName)
        
        axios({
            method: 'GET',
            url,
            responseType: 'stream',
        }).then( response => {
            const writer = fs.createWriteStream(outputPath);
            response.data.pipe(writer);
            writer.on('finish', () => console.log('Download completed:', outputPath ));
            writer.on('error', err => console.error('Error writing file:', err ));
        }).catch(err => console.error('Download failed:', err.message));
        let extractPath

        if(fs.existsSync(path.join(__dirname,'../../../resources'))) {
            extractPath = path.join(__dirname,'../../../resources')
        } else {
            extractPath = path.join( __dirname, './')
        }

        const resp = extractZip(outputPath, extractPath)
        if( resp.status ) {
            fs.unlinkSync(outputPath)
            return res.json({
                status: true,
                message: "Updates finished!"
            });
        }

    } catch (er) {
        return res.json({ status:false, message: er.message })
    }

});

async function extractZip(source, destination) {
    try {
        const zip = new AdmZip(source);
        zip.extractAllTo(destination, true); // `true` overwrites existing files
        return {status:true, message: "Update finished!"}
    } catch (error) {
        return {status:false, message: "Failed to download update!"}
    }
}

server.listen(port);

// module.exports = {knex}