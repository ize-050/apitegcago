import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import bodyParser = require("body-parser");
import cors from 'cors'
const router = require("./routes")

dotenv.config();



const app: Express = express();
const port = process.env.PORT || 3000;

declare module "express-serve-static-core" {
  export interface Request {
    userId?: any;
  }
}


// app.use(cors());
app.use(cors({
  origin: ['http://localhost:3003','https://cs.teglogistics.co.th','*'] 
}));

app.use(express.static(__dirname + "/public"));
app.use(express.static('public'))
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(router);
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});


