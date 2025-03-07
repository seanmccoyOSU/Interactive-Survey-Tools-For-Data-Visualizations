// local JSON data that imitates database data
const LOCAL_JSON = {
    user: {
        id: 0,
        name: "DEBUG USER",
        password: "debug"
    },

    visualizations: [
        {
            id: 0,
            name: "debug visualization 1"
        },
        {
            id: 1,
            name: "debug visualization 2"
        },
    ],

    surveyDesigns: [
        {
            id: 0,
            name: "debug design 1"
        },
        {
            id: 1,
            name: "debug design 2"
        },
    ]
}

// Debug API Interface
// imitates axios API call methods, but instead this just manipulates local JSON data
class DebugApi {
    constructor() {
        this.debugData = LOCAL_JSON
    }

    get(path) {                                         // GET
        const pathLevels = path.split('/')

        if (pathLevels[1] == "users") {
            if (pathLevels[2] && parseInt(pathLevels[2]) != NaN) {  // GET /users/{id}/{resource}
                if (this.debugData[pathLevels[3]]) {
                    const returnObj = {}
                    returnObj[pathLevels[3]] = this.debugData[pathLevels[3]]
                    return { data: returnObj }
                } else {
                    // collection does not exist
                    throw new Error()
                }
            } else {                                                // GET /users
                // here there is only one user
                return { data: this.debugData["user"] }
            }
        } else {
            const collection = this.debugData[pathLevels[1]]
            if (collection) {                                       // GET /{resource}/{id}
                // here the id just matches the index
                if (collection[pathLevels[2]]) {
                    return { data: collection[pathLevels[2]] }
                } else {
                    // id does not exist
                    throw new Error()
                }
            } else {
                // collection does not exist
                throw new Error()
            }
        }
    }

    post(path, body) {                                  // POST
        const pathLevels = path.split('/')              
        if (pathLevels[1] == "users") {
            // do nothing for users
            return
        }
        const collection = this.debugData[pathLevels[1]]
        if (collection) {                                           // POST /{resource}
            // add new element to end of array
            collection.push(body)
            collection[collection.length-1].id = collection.length-1
        } else {
            // collection does not exist
            throw new Error()
        }

    }

    delete(path) {                                      // DELETE
        const pathLevels = path.split('/')
        if (pathLevels[1] == "users") {
            // do nothing for users
            return
        }
        const collection = this.debugData[pathLevels[1]]
        if (collection) {                                             // DELETE /{resource}/{id}
            // this just removes the last element, regardless of id
            collection.pop()
        } else {
            // collection does not exist
            throw new Error()
        }
    }

    patch(path, body) {                                 // PATCH
        const pathLevels = path.split('/')              
        if (pathLevels[1] == "users") {
            // do nothing for users
            return
        }
        const collection = this.debugData[pathLevels[1]]
        if (collection) {                                           
            // here the id just matches the index
            if (collection[pathLevels[2]]) {                            // PATCH /{resource}/{id}
                // replace the object, but keep the id
                const id = collection[pathLevels[2]].id
                collection[pathLevels[2]] = body
                collection[pathLevels[2]].id = id
            } else {
                // id does not exist
                throw new Error()
            }
        } else {
            // collection does not exist
            throw new Error()
        }
    }

    put(path, body) {
        // not implemented
        throw new Error()
    }
}

module.exports = new DebugApi()