require('dotenv').config()

const sequelize = require('../../../main/api/lib/sequelize')

const axios = require('axios')

test("successful connection to main API server", async () => {
    let unsuccessfulConnection = false

    try {
        await axios.get(process.env.MAIN_API_URL)
    } catch (error) {
        if (!error.response)
            unsuccessfulConnection = true
    }

    expect(unsuccessfulConnection).toBeFalsy()
})

test("successful connection to main database", async () => {
    let unsuccessfulConnection = false

    try {
        await sequelize.authenticate()
    } catch (error) {
        unsuccessfulConnection = true
    }

    expect(unsuccessfulConnection).toBeFalsy()
})