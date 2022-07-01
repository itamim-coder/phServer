const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const path = require('path')
const userHandler = require("./routeHandler/userHandler");
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const ObjectId = require("mongodb").ObjectId;
const User = require('./model/user')


// mongoose
//   .connect("mongodb://localhost/27017/ph_server", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("connection successful"))
//   .catch((err) => console.log(err));

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
// app.use('/', express.static(path.join(__dirname, 'static')))


// app.use("/user", userHandler);


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.srriw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    //Add User Collection
  //   app.post('/api/register', async (req, res) => {
  //     console.log(req.body);
  //     res.json({status: 'ok'})
      
  // }); 


async function run(){
  try{
      await client.connect();
      const database = client.db("phDB");
      const addBillingCollection = database.collection('addbilling');
      
  

      //Add Bill Collection
      app.post('/add-billing', async (req, res) => {
          const bill = req.body;         
          const result = await addBillingCollection.insertOne(bill);      
          res.json(result);
      }); 

      //Get All Billing Collection
    app.get('/billing-list', async (req, res) => {
        const cursor = addBillingCollection.find({});
        const page = req.query.page;
        const size = parseInt(req.query.size);
        let bill;
        const count = await cursor.count();

        if(page){
             bill = await cursor.skip(page * size).limit(size).toArray();

        }
        else{
            bill = await cursor.toArray();

        }
        res.send({
            count,
            bill
        });
    });  

       //Delete Single Billing 
       app.delete("/delete-billing/:id", async (req, res)=>{
        const result = await addBillingCollection.deleteOne({
            _id: ObjectId(req.params.id),
        });
        res.send(result);
    })

      //Get Single bill 
    //   app.get("/update-billing/:id", async(req, res) =>{
    //     const result = await addBillingCollection
    //     .find({_id: ObjectId(req.params.id)})
    //     .toArray();
    //     res.send(result[0]);
    // })

        //Update Single Bill 
        app.put('/update-billing/:id', async (req, res) => {
            const filter = { _id: ObjectId(req.params.id) };
            console.log(req.params.id);
            const options = { upsert: true };
            const result = await addBillingCollection.updateOne(filter, {
              $set: {
                fullName: req.body.fullName,
                email: req.body.email,           
                phone: req.body.phone,           
                paidAmount: req.body.paidAmount,           
              },
            });
            res.send(result);
            console.log(result);
        }); 

     
     


      console.log('connected database phDB')

  }
  finally{
      //await client.close();
  }

}

run().catch(console.dir)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on ${port}`)
})