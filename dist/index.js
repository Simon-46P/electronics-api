"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const data = require("./data/data.json");
const app = (0, express_1.default)();
const port = 3000;
app.use((0, cors_1.default)({ origin: "*" }), express_1.default.static("public"), express_1.default.json());
const dataPath = path_1.default.join(__dirname, "data", "data.json");
function readDataFromFile() {
    try {
        const data = fs_1.default.readFileSync(dataPath, "utf8");
        return JSON.parse(data);
    }
    catch (error) {
        console.error("Error reading data file:", error);
        return [];
    }
}
function writeDataToFile(data) {
    fs_1.default.writeFile(dataPath, JSON.stringify(data, null, 2), (err) => {
        if (err) {
            console.error("Error writing data file:", err);
        }
    });
}
app.get("/", (req, res) => {
    return res.send("First Page!");
});
//GET (ALL)
app.get("/products", (req, res) => {
    res.json(data);
});
//GET (SINGLE)
app.get("/product/:product", (req, res) => {
    const product_id = req.params.product;
    const index = data.findIndex((d) => d.id === product_id);
    if (index === -1) {
        return res.send("Found no product with id: " + product_id);
    }
    res.send(JSON.stringify(data[index]));
});
//POST
app.post("/products", (req, res) => {
    const { title, price, popularity, stockLevel, categoryId } = req.body;
    if (!title || typeof price !== "number") {
        return res.status(400).send("title and price are required.");
    }
    let products = readDataFromFile();
    const nextId = products.length > 0
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
    products.push(newProduct);
    writeDataToFile(products);
    res.json(newProduct);
});
//DELETE
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
//PUT
app.put("/product/:id", (req, res) => {
    const product_id = req.params.id;
    const { title, price, popularity, stockLevel, categoryId } = req.body;
    let products = readDataFromFile();
    const index = data.findIndex((d) => d.id === product_id);
    if (index === -1) {
        return res.status(404).send(`Product with id ${product_id} not found`);
    }
    const updatedProduct = Object.assign(Object.assign({}, products[index]), { title,
        price,
        popularity,
        stockLevel,
        categoryId });
    products[index] = updatedProduct;
    writeDataToFile(products);
    res.json(updatedProduct);
});
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
module.exports = app;
//# sourceMappingURL=index.js.map