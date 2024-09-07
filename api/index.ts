import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { IProduct } from "./models/IProduct";

const data = require("./data/data.json") as IProduct[];
const app = express();
const port = 3000;

app.use(cors({ origin: "*" }), express.static("public"), express.json());

const dataPath = path.join(__dirname, "data", "data.json");

function readDataFromFile(): IProduct[] {
  try {
    const data = fs.readFileSync(dataPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading data file:", error);
    return [];
  }
}

function writeDataToFile(data: IProduct[]): void {
  fs.writeFile(dataPath, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.error("Error writing data file:", err);
    }
  });
}

app.get("/", (req, res) => {
  const apiDescription = `
    <p><strong>GET /products</strong></p>
    <p>Description: Retrieve all products. Optionally, you can search for products by title using the query parameter.</p>
    <p>Example: <code>GET /products?title=someTitle</code></p><br>

    <p><strong>GET /product/:product</strong></p>
    <p>Description: Retrieve a single product by its ID.</p>
    <p>Example: <code>GET /product/1</code></p><br>

    <p><strong>POST /products</strong></p>
    <p>Description: Add a new product. Requires a JSON body with fields: <code>title</code>, <code>price</code>, <code>popularity</code>, <code>stockLevel</code>, and <code>categoryId</code>.</p>
    <p>Example Request Body: <code>{ "title": "New Product", "price": 100, "popularity": 10, "stockLevel": 50, "categoryId": "1" }</code></p><br>

    <p><strong>DELETE /product/:product</strong></p>
    <p>Description: Delete a product by its ID.</p>
    <p>Example: <code>DELETE /product/1</code></p><br>

    <p><strong>PUT /product/:id</strong></p>
    <p>Description: Update an existing product by its ID. Requires a JSON body with the fields you wish to update.</p>
    <p>Example Request Body: <code>{ "title": "Updated Product", "price": 120, "popularity": 15, "stockLevel": 60, "categoryId": "2" }</code></p>
  `;

  res.send(apiDescription);
});

// GET (ALL)
app.get("/products", (req, res) => {
  // + SEARCH
  const title = req.query.title as string | undefined;
  if (title) {
    const filteredProducts = data.filter((product) =>
      product.title.toLowerCase().includes(title.toLowerCase())
    );
    return res.json(filteredProducts);
  }

  res.json(data);
});

// GET (SINGLE)
app.get("/product/:product", (req, res) => {
  const product_id = req.params.product;

  const index = data.findIndex((d) => d.id === product_id);

  if (index === -1) {
    return res.send("Found no product with id: " + product_id);
  }

  res.send(JSON.stringify(data[index]));
});

// POST
app.post("/products", (req, res) => {
  const { title, price, popularity, stockLevel, categoryId } = req.body;

  if (
    !title ||
    !popularity ||
    !stockLevel ||
    !categoryId ||
    typeof price !== "number"
  ) {
    return res.status(400).json({
      success: false,
      message:
        "All the fields need to be filled in in order to add a new product",
    });
  }

  let products = readDataFromFile();

  const nextId =
    products.length > 0
      ? (parseInt(products[products.length - 1].id) + 1).toString()
      : "1";

  const newProduct = {
    id: nextId,
    title,
    price,
    popularity,
    stockLevel,
    categoryId,
  };
  console.log(newProduct);
  products.push(newProduct);

  writeDataToFile(products);

  res.status(201).json({
    success: true,
    message: "Product successfully added.",
    product: newProduct,
  });
});

// DELETE
app.delete("/product/:product", (req, res) => {
  const product_id = req.params.product;

  let products = readDataFromFile();

  const index = products.findIndex((d) => d.id === product_id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: `Product with id ${product_id} not found`,
    });
  }

  products.splice(index, 1);

  writeDataToFile(products);

  res.json({
    success: true,
    message: `Product with id ${product_id} deleted successfully`,
  });
});

// PUT
app.put("/product/:id", (req, res) => {
  const product_id = req.params.id;
  const { title, price, popularity, stockLevel, categoryId } = req.body;

  let products = readDataFromFile();

  const index = products.findIndex((d) => d.id === product_id);

  if (index === -1) {
    return res.status(404).send({
      success: false,
      message: `Product with id ${product_id} not found`,
    });
  }

  const updatedProduct = {
    ...products[index],
    title,
    price,
    popularity,
    stockLevel,
    categoryId,
  };

  products[index] = updatedProduct;

  writeDataToFile(products);

  res.json({ success: true, product: updatedProduct });
});

app.listen(port, () => {
  console.log(`Server listening to port: ${port}`);
});

module.exports = app;
