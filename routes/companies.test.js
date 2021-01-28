const request = require("supertest");

const app = require("../app");
const { testData } = require("../test_data");
const db = require("../db");

beforeEach(testData);

afterAll(async function () {
    await db.end();
});

// GET route for list of companies
describe("GET /", function () {
    test("Get list of companies", async function () {
        const resp = await request(app).get("/companies");
        expect(resp.body).toEqual({
            "companies": [
                {code: "google", name: "Google"},
                {code: "apple", name: "Apple"}
            ]
        })
    })
})

// GET route for one company, with error handling for unfound company
describe("GET /google", function () {
    test("Return company info", async function () {
        const resp = await request(app).get("/companies/google");
        expect(resp.body).toEqual(
            {
                "company": {
                    code: "google",
                    name: "Google",
                    description: "The Search Engine",
                    invoices: [1,2],
                }
            }
        )
    })
    test("Return 404 for unfound company", async function () {
        const resp = await request(app).get("/companies/aintreal");
        expect(resp.status).toEqual(404)
    })
});

describe("POST /", function () {
    test("Add a new company", async function () {
        const resp = await request(app)
            .post("/companies")
            .send({name: "Samsung", description: "Cellphones"});
        expect(resp.body).toEqual({
            "company": {
                code: "samsung",
                name: "Samsung",
                description: "Cellphones",
            }
        })
    })
    test("Return 500 for conflict", async function () {
        const resp = await request(app)
            .post("/companies")
            .send({name: "Apple", description: "nah"});
        expect(resp.status).toEqual(500);
    })
})

describe("PUT /apple", function () {
    test("Update one company", async function () {
        const resp = await request(app)
            .put("/companies/apple")
            .send({name: "Macintosh", description: "New"})
        expect(resp.body).toEqual(
            {
                "company": {
                    code: "apple",
                    name: "Macintosh",
                    description: "New"
                }
            }
        )
    })
    test("Return 404 for unfound company", async function () {
        const resp = await request(app)
            .put("/companies/nah")
            .send({name: "Nah"});
        expect(resp.status).toEqual(404);
    });
    test("Return 500 for missing data", async function () {
        const resp = await request(app)
            .put("/companies/apple")
            .send({});
        expect(resp.status).toEqual(500)
    })
});

// describe("DELETE /", function () {
//     test("Delete existing company", async function () {
//         const resp = await request(app)
//             .delete("/companies/apple");
//         expect(resp.body).toEqual({ "msg": "COMPANY DELETED!" })
//     });
//     test("Return 404 for unfound company", async function () {
//         const resp = await request(app)
//             .delete("/companies/nah");
//         expect(resp.status).toEqual(404);
//     })
// });
