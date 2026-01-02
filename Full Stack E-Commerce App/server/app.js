import express from 'express'
import cors from 'cors'
import 'dotenv/config'

import { query } from './db/postgres.js';

// table names
const productsTable = 'products'
const ordersTable = 'orders_mat927'

// create the app
const app = express()
// it's nice to set the port number so it's always the same
app.set('port', process.env.PORT || 3000);
// set up some middleware to handle processing body requests
app.use(express.json())
// set up some midlleware to handle cors
app.use(cors())

// base route
app.get('/', (_req, res) => {
    res.send("Welcome to the Shopping API!!!")
})

app.get('/up', (_req, res) => {
  res.json({status: 'up'})
})

// get all products
app.get('/products', (_req, res) => {
  try {
    const qs = `SELECT * FROM ${productsTable}`
    query(qs).then(data => {
      res.json(data.rows)
    }).catch(error => {
      console.log(error) 
      res.status(500).send('problem getting products')
    })
  } catch (error) {
    console.log(error)
    res.status(500).send('problem getting products')
  }
})

// get one product by id for the detail page
app.get('/products/:id', (req, res) => {
  const productId = req.params.id

  // basic check to make sure its there
  if (!productId) {
    res.status(400).send('missing product id')
    return
  }

  const qs = `SELECT * FROM ${productsTable} WHERE id = $1`

  query(qs, [productId]).then(data => {
    if (data.rows.length === 0) {
      res.status(404).send('product not found')
      return
    }

    res.json(data.rows[0])
  }).catch(error => {
    console.log(error)
    res.status(500).send('problem getting product')
  })
})


app.get('/products', (req, res) => {
  try {
    const qs = `SELECT * FROM products`
    query(qs).then(data => {res.json(data.rows)})
  } catch (error) {
    console.log(error)
    res.send(error)
  }
})

// use your orders_lehighID table to store the orders placed


// store an order with cart and checkout info
app.post('/orders', (req, res) => {
  const orderData = req.body

  // basic checks 
  if (!orderData) {
    res.status(400).send('order data is missing')
    return
  }

  const customer = orderData.customer
  const items = orderData.items

  if (!customer || !items) {
    res.status(400).send('customer or items are missing')
    return
  }

  const name = customer.name
  const email = customer.email
  const address = customer.address

  if (!name || !email || !address) {
    res.status(400).send('customer fields are missing')
    return
  }

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).send('cart is empty')
    return
  }

  // sql for orders table
  const qs = `
    INSERT INTO ${ordersTable} (customer_name, email, address, items)
    VALUES ($1, $2, $3, $4)
    RETURNING id
  `
  // items is stored as jsonb so we stringify array
  const values = [name, email, address, JSON.stringify(items)]

  query(qs, values).then(data => {
    const newId = data.rows[0].id
    res.status(201).json({ id: newId })
  }).catch(error => {
    console.log(error)
    res.status(500).send('problem saving order')
  })
})


app.listen(app.get('port'), () => {
    console.log('App is running at http://localhost:%d in %s mode', app.get('port'), app.get('env'));
    console.log('  Press CTRL-C to stop\n');
  });
  