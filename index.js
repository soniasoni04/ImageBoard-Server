const express = require('express')
const Sequelize = require('sequelize');
const databaseUrl = process.env.DATABASE_URL || 'postgres://postgres:secret@localhost:5432/postgres';
const db = new Sequelize(databaseUrl);

const cors = require('cors')
const bodyParser = require('body-parser')
const corsMiddleware = cors()
const parserMiddleware = bodyParser.json()

const port = 4000
const app = express()

app.use(corsMiddleware)
app.use(parserMiddleware)

app.listen(port, () => console.log(`listening on port ${port}`))

console.log('hello')

//create the image table with some dummy data
const Image = db.define('Image',{
    url : Sequelize.STRING,
    title : Sequelize.STRING
})

const urlImage = [
    {url :'url1', title : "image1" },
    {url :'url2', title : "image2" },
    {url :'url3', title : "image3" },
    {url :'url4', title : "image4" },
]

db
.sync({force : true}) 
.then(() => console.log('Database schema updated'))
.then(() => Promise.all(urlImage.map(image => Image.create({
    url : image.url,
    title : image.title
})
)))
.catch(console.error)


//making route

//const { Router } = express() ????? why not working 
//const router = express()
console.log('hello1')

app.get('/', (req,res) => res.send('hello home'))
//app.get('/image', (req,res) => res.send({"message" : "hello images"}))

// Read all the records from image table
app.get('/image', (req, res, next) => {
    
        Image.findAll()
        .then(image => {
            res
            .status(200)
            .send(image);
          })
        .catch(next);
      });
//Fetch all records thru image id
app.get('/image/:id', (req, res, next) => {
        Image.findByPk(req.params.id)
        .then(image =>{
            res
            .status(200)
            .send(image)
    })
        .catch(next);
      });

//create images 
app.post("/image", (req, res, next) => {
    console.log("Do we have the body of this request?", req.body); //??
    Image.create(req.body)
    .then(image => res.json(image))
    .catch(next);
});

//delete images thru id 
app.delete("/image/:id", (req, res, next) => {
    Image.destroy({
        where: {
          id: req.params.id
        }
      })
        .then(numDeleted => {
          if (numDeleted) {
            res.status(204).end();
          } else {
            res.status(404).end();
          }
        })
        .catch(next);
    });
//update records

app.put("/image/:id", (req, res, next) => {
    Image.findByPk(req.params.id)
    .then(image => {
      console.log("Image found?", image);
      if (image) {
        image.update(req.body)
        .then(image => res.json(image));
      } else {
        res.status(404).end();
      }
    })
    .catch(next);
});
 
