const request = require("supertest");

const app = require("../app");
const { testData } = require("../test_data");
const db = require("../db");

beforeEach(testData);

afterAll(async function () {
    await db.end();
});


describe("GET /", function () {
    test("Respond with an array of invoices", async function () {
        const resp = await request(app).get("/invoices");
        expect(resp.body).toEqual({
            "invoices": [
                {id: 1, comp_code: "google"},
                {id: 2, comp_code: "google"},
                {id: 3, comp_code: "apple"}
            ]
        })
    })
})

describe("GET /1", function () {
    test("Return one invoice", async function () {
        const resp = await request(app).get("/invoices/1");
        expect(resp.body).toEqual(
            {
                "invoice": {
                    id: 1,
                    amt: 150,
                    add_date: '2014-01-01T08:00:00.000Z',
                    paid: false,
                    paid_date: null,
                    company: {
                        code: "google",
                        name: "Google",
                        description: "The Search Engine"
                    }

                }
            }
        )
    })
    test("Return 404 for unfound invoice", async function () {
        const resp = await request(app).get("/invoices/13");
        expect(resp.status).toEqual(404)
    })
})

describe("POST /", function () {
    test("Add a new invoice", async function () {
        const resp = await request(app)
            .post("/invoices")
            .send({amt: 350, comp_code: "google"});
        expect(resp.body).toEqual(
            {
                "invoice": {
                    id: 4,
                    comp_code: "apple",
                    amt: 350,
                    add_date: expect.any(String),
                    paid: false,
                    paid_date: null
                }
            }
        )
    })
})

describe("PUT /", function () {
    test("Update an invoice", async function () {
        const resp = await request(app)
            .put("/invoices/1")
            .send({amt: 5000, paid: false});
        expect(resp.body).toEqual(
            {
                "invoice": {
                    id: 1,
                    comp_code: 'google',
                    paid: false,
                    amt: 5000,
                    add_date: expect.any(String),
                    paid_date: null,
                }

            }
        )
    })
    test("Return 404 for unfound invoice", async function () {
        const resp = await request(app)
            .put("/invoices/13")
            .send({amt: 5000})
        expect(resp.status).toEqual(404)
    })
    test("Return 500 for missing data", async function () {
        const resp = await request(app)
            .put("/invoices/1")
            .send({})
        expect(resp.status).toEqual(500)
    })
});

describe("DELETE /", function () {
    test("Delete an existing invoice", async function () {
        const resp = await request(app)
            .delete("/invoices/1");
        expect(resp.body).toEqual({"msg": "INVOICE DELETED!"})
    })
    test("Return 404 for unfound invoice", async function () {
        const resp = await request(app)
            .delete("/invoices/13")
        expect(resp.status).toEqual(404)
    })
});
