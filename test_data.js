const db = require("./db");

async function testData() {
    await db.query("DELETE FROM invoices");
    await db.query("DELETE FROM companies");
    await db.query("SELECT setval('invoices_id_seq', 1, false)");

    await db.query(
        `INSERT INTO companies (code, name, description)
        VALUES ('google', 'Google', 'The Search Engine'),
                ('apple', 'Apple', 'Maker of OSX')`);
    
    const inv = await db.query(
        `INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date)
        VALUES ('google', 150, false, '2014-01-01', null),
                ('google', 250, true, '2014-02-01', '2014-02-02'),
                ('apple', 500, false, '2015-01-01', null)
        RETURNING id`);
}

module.exports = { testData }