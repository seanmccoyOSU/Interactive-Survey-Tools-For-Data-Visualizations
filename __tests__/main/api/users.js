const request = require('supertest')
const api = require('../../../main/api/server')

jest.mock('../../../main/api/lib/sequelize', () => {
    const { Sequelize } = require('sequelize')

    const mockSequelize = new Sequelize('database', 'username', 'password', {
        dialect: 'sqlite',
        storage: ':memory:',
        logging: false
    })

    return mockSequelize
})

const sequelize = require('../../../main/api/lib/sequelize')
const { User } = require('../../../main/api/model/User')

beforeAll(async () => {
    await sequelize.sync({ force: true })
})
  
afterAll(async () => {
    await sequelize.close()
})

describe("POST /users - registers user", () => {
    test("creates a new user in database, sends 201 status code and id", async () => {
        const res = await request(api).post('/users').send({ name:"testUser", password:"testPassword" })    
        const newUser = await User.findOne({ where: {name:"testUser"} })
        expect(newUser).toBeTruthy()
        expect(res.statusCode).toBe(201)
        expect(res.body).toHaveProperty('id')
    })
    
    test("sends 400 status code and error on invalid input", async () => {
        const res = await request(api).post('/users').send({ })
        expect(res.statusCode).toBe(400)
        expect(res.body).toHaveProperty('error')
    })
})

describe("POST /users/login - logs user in", () => {
    test("sends 200 status code", async () => {
        const res = await request(api).post('/users/login').send({ name:"testUser", password:"testPassword" })    
        expect(res.statusCode).toBe(200)
    })
    
    test("sends 401 status code and error on bad credentials", async () => {
        const res = await request(api).post('/users/login').send({ name:"testUser", password:"testPasswordWRONG" })    
        expect(res.statusCode).toBe(401)
        expect(res.body).toHaveProperty('error')
    })
})

