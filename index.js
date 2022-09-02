const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();


//middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.s9lfb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    await client.connect();
    const productCollection = client.db('emaJohn').collection('product');

    app.get('/product', async (req, res) => {
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);
      const query = {};
      const cursor = productCollection.find(query);
      let products;

      if (page || size) {
        //page:0---skip: 0*10 -- 0-10 --size:10
        //page:1---skip: 1*10 -- 11-20 --size:10
        //page:2---skip: 2*10 -- 21-30 --size:10
        products = await cursor.skip(page * size).limit(size).toArray();
      }
      else {
        products = await cursor.toArray();
      }

      res.send(products);
    });

    app.get('/productCount', async (req, res) => {
      const count = await productCollection.estimatedDocumentCount();
      res.send({ count });
    })

    // receive keys from client side by post 
    app.post('/productByKeys', async (req, res) => {
      const keys = req.body;
      const ids = keys.map(id => ObjectId(id));
      const query = { _id: { $in: ids } }
      const cursor = productCollection.find(query);
      const products = await cursor.toArray();
      console.log(products)
      res.send(products);
    })

  }
  finally {
    // await client.close();
  }

}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Ema is running and waiting for John')
})

app.listen(port, () => {
  console.log('Listening on port', port)
})