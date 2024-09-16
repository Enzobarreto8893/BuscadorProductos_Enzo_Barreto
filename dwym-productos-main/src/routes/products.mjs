import express from "express";
const router = express.Router();

let products = [
  {
    id: "1",
    name: "Wireless Mouse",
    description: "Ergonomic wireless mouse with adjustable DPI.",
    price: "29.99",
    image: "https://via.placeholder.com/150?text=Wireless+Mouse",
  },
  {
    id: "2",
    name: "Mechanical Keyboard",
    description: "RGB backlit mechanical keyboard with Cherry MX switches.",
    price: "89.99",
    image: "https://via.placeholder.com/150?text=Mechanical+Keyboard",
  },
  {
    id: "3",
    name: "Gaming Headset",
    description:
      "Surround sound gaming headset with noise-cancelling microphone.",
    price: "59.99",
    image: "https://via.placeholder.com/150?text=Gaming+Headset",
  },
  {
    id: "4",
    name: "27-inch Monitor",
    description: "4K UHD monitor with IPS display and 144Hz refresh rate.",
    price: "329.99",
    image: "https://via.placeholder.com/150?text=27-inch+Monitor",
  },
  {
    id: "5",
    name: "Laptop Stand",
    description: "Adjustable aluminum laptop stand for ergonomic work setup.",
    price: "39.99",
    image: "https://via.placeholder.com/150?text=Laptop+Stand",
  },
  {
    id: "6",
    name: "USB-C Hub",
    description: "Multi-port USB-C hub with HDMI, USB 3.0, and SD card reader.",
    price: "24.99",
    image: "https://via.placeholder.com/150?text=USB-C+Hub",
  },
  {
    id: "7",
    name: "External SSD",
    description:
      "Portable external SSD with 1TB storage and USB 3.1 interface.",
    price: "129.99",
    image: "https://via.placeholder.com/150?text=External+SSD",
  },
  {
    id: "8",
    name: "Smartphone Stand",
    description: "Adjustable smartphone stand with 360-degree rotation.",
    price: "19.99",
    image: "https://via.placeholder.com/150?text=Smartphone+Stand",
  },
  {
    id: "9",
    name: "Bluetooth Speaker",
    description: "Portable Bluetooth speaker with 10-hour battery life.",
    price: "49.99",
    image: "https://via.placeholder.com/150?text=Bluetooth+Speaker",
  },
  {
    id: "10",
    name: "Webcam",
    description: "1080p HD webcam with built-in microphone and privacy cover.",
    price: "34.99",
    image: "https://via.placeholder.com/150?text=Webcam",
  },
  {
    id: "11",
    name: "Wireless Charger",
    description: "Fast wireless charger with Qi compatibility.",
    price: "25.99",
    image: "https://via.placeholder.com/150?text=Wireless+Charger",
  },
  {
    id: "12",
    name: "Noise-Cancelling Headphones",
    description:
      "Over-ear noise-cancelling headphones with Bluetooth connectivity.",
    price: "199.99",
    image: "https://via.placeholder.com/150?text=Noise-Cancelling+Headphones",
  },
  {
    id: "13",
    name: "Smartwatch",
    description: "Smartwatch with heart rate monitor and GPS.",
    price: "149.99",
    image: "https://via.placeholder.com/150?text=Smartwatch",
  },
];
// GET all product
router.get("/products", (req, res) => {
  res.json(products);
});

// POST a new product
router.post("/products", (req, res) => {
  const product = req.body;
  product.id = (products.length + 1).toString();
  products.push(product);
  res.status(201).json(product);
});

// DELETE a product by ID
router.delete("/products/:productId", (req, res) => {
  const productId = req.params.productId;
  products = products.filter((product) => product.id !== productId);
  res.sendStatus(204);
});

// PUT (update) a product by ID
router.patch("/products/:productId", (req, res) => {
  const productId = req.params.productId;
  const updatedTask = req.body;

  products = products.map((product) => {
    if (product.id === productId) {
      return { ...product, ...updatedTask, id: productId };
    }
    return product;
  });

  res.json(products.find((product) => product.id === productId));
});

export default router;
