import { DataSource } from "typeorm"

const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 5432,
    username: "root",
    password: "",
    database: "test",
    entities: ['../entities/*'],
    synchronize: true,
    logging: false,
})

 
AppDataSource.initialize()
    .then(() => {
        // here you can start to work with your database
    })
    .catch((error) => console.log(error))