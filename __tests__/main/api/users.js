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

beforeEach(async () => {
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
        await request(api).post('/users').send({ name:"testUser", password:"testPassword" })
        const res = await request(api).post('/users/login').send({ name:"testUser", password:"testPassword" })    
        expect(res.statusCode).toBe(200)
    })
    
    test("sends 401 status code and error on bad credentials", async () => {
        const res = await request(api).post('/users/login').send({ name:"", password:"" })    
        expect(res.statusCode).toBe(401)
        expect(res.body).toHaveProperty('error')
    })
})

describe("GET /users - get user info", () => {
    test("sends name, id, and 200 status code", async () => {
        await request(api).post('/users').send({ name:"testUser", password:"testPassword" })
        const loginRes = await request(api).post('/users/login').send({ name:"testUser", password:"testPassword" })
        const { header } = loginRes    
        const res = await request(api).get('/users').set("Cookie", [...header["set-cookie"]])
        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty('name', "testUser")
        expect(res.body).toHaveProperty('id')
    })
    
    test("sends 401 status code and error when not logged in", async () => {
        const res = await request(api).get('/users')     
        expect(res.statusCode).toBe(401)
        expect(res.body).toHaveProperty('error')
    })
})

describe("GET /users/{id}/visualizations - get visualizations of user", () => {
    test("sends array of visualizations and 200 status code", async () => {
        const registerRes = await request(api).post('/users').send({ name:"testUser", password:"testPassword" })
        const myId = registerRes.body.id
        const loginRes = await request(api).post('/users/login').send({ name:"testUser", password:"testPassword" })
        const { header } = loginRes    
        const res = await request(api).get(`/users/${myId}/visualizations`).set("Cookie", [...header["set-cookie"]])  
        expect(res.statusCode).toBe(200)
    })
    
    test("sends 401 status code and error when logged in as incorrect user", async () => {
        const registerRes = await request(api).post('/users').send({ name:"testUser", password:"testPassword" })
        const myId = registerRes.body.id
        const loginRes = await request(api).post('/users/login').send({ name:"testUser", password:"testPassword" })
        const { header } = loginRes    
        const res = await request(api).get(`/users/${myId+1}/visualizations`).set("Cookie", [...header["set-cookie"]])    
        expect(res.statusCode).toBe(401)
        expect(res.body).toHaveProperty('error')
    })
})

