const express = require("express");
const ExpressError = require("../expressError")
const db = require("../db"); 

let router = new express.Router();


// GET route: Return info on invoices
router.get('/', async (req, res, next) => { 
    try {
      const results = await db.query(
          `SELECT id, comp_code 
          FROM invoices
          ORDER BY id`
        );
      return res.json({ "invoices": results.rows })
    } catch (e) {
      return next(e);
    }
})

// GET route: Return object of on given invoice, and error handling for unfound invoice
router.get('/:id', async (req, res, next) => { 
    try {
        let id = req.params.id;
        const result = await db.query(
          `SELECT i.id, i.comp_code, i.amt, i.paid, i.add_date, i.paid_date, c.name, c.description
          FROM invoices AS i
            INNER JOIN companies AS c ON (i.comp_code = c.code)
          WHERE id = $1`, 
          [id]
        );
        if (result.rows.length === 0) {
            throw new ExpressError(`Invoice was not found: ${id}`, 404)
        } else {
            const data = result.rows[0];
            const invoice = {
                id: data.id,
                company: {
                    code: data.comp_code,
                    name: data.name,
                    description: data.description,
                },
                amt: data.amt,
                paid: data.paid,
                add_date: data.add_date,
                paid_date: data.paid_date,
            };
            return res.json({ "invoice": invoice })
        }
    } catch (e) {
      return next(e);
    }
});

// POST route: Add a new invoice
router.post('/', async (req, res, next) => {
    try {
      const { comp_code, amt } = req.body;
      const result = await db.query(
          `INSERT INTO companies (comp_code, amt) 
          VALUES ($1, $2) 
          RETURNING id, comp_code, amt, paid, add_date, paid_date`, 
          [comp_code, amt]);
      return res.status(201).json({ "invoice": result.rows[0] })
    } catch (e) {
      return next(e)
    }
  });



// PUT route: Edit existing invoice and error handling for unfound invoice
router.put('/:id', async (req, res, next) => {
    try {
      const { comp_code, amt } = req.body;
      const { id } = req.params.id;
      const result = await db.query(
          `UPDATE invoices
          SET comp_code=$1, amt=$2 
          WHERE id = $3 
          RETURNING id, comp_code, amt`, 
          [id, comp_code, amt]);
      if (result.rows.length === 0) {
        throw new ExpressError(`Invoice could not found: ${id}`, 404)
      } else {
        return res.json({ "invoice": result.rows[0] })
      }
    } catch (e) {
      return next(e)
    }
  })

// DELETE route: Delete existing invoice and error handling for unfound invoice
  router.delete('/:id', async (req, res, next) => {
    try {
      let id = req.params.id;
      const result = db.query(
          `DELETE FROM invoices
           WHERE id = $1
           RETURNING id`, 
           [id]);
      if(result.rows.length === 0) {
          throw new ExpressError(`Invoice does not found: ${id}`, 404);
      } else {
        return res.json({ msg: "INVOICE DELETED!" })
      }
    } catch (e) {
      return next(e)
    }
  })

  module.exports = router;