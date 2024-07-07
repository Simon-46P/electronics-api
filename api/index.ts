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
  return res.send("First Page!");
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

  if (!title || typeof price !== "number") {
    return res.status(400).send("title and price are required.");
  }

  let products = readDataFromFile();

  const nextId =
    products.length > 0
      ? (parseInt(products[products.length - 1].id) + 1).toString()
      : "1";

  const newProduct: IProduct = {
    id: nextId,
    title,
    price,
    popularity,
    stockLevel,
    categoryId,
  };

  products.push(newProduct);

  writeDataToFile(products);

  res.json(newProduct);
});

// DELETE
app.delete("/product/:id", (req, res) => {
  const product_id = req.params.id;

  let products = readDataFromFile();

  const index = data.findIndex((d) => d.id === product_id);

  if (index === -1) {
    return res.status(404).send(`Product with id ${product_id} not found`);
  }

  products.splice(index, 1);

  writeDataToFile(products);

  res.send(`Product with id ${product_id} deleted successfully`);
});

// PUT
app.put("/product/:id", (req, res) => {
  const product_id = req.params.id;
  const { title, price, popularity, stockLevel, categoryId } = req.body;

  let products = readDataFromFile();

  const index = data.findIndex((d) => d.id === product_id);

  if (index === -1) {
    return res.status(404).send(`Product with id ${product_id} not found`);
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

  res.json(updatedProduct);
});

app.listen(port, () => {
  console.log(`Server listening to port: ${port}`);
});

module.exports = app;
