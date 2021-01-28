const express = require("express");
const slugify = require("slugify")
const ExpressError = require("../expressError")
const db = require("../db"); 

let router = new express.Router();

// GET route: Return list of companies
router.get("/", async function (req, res, next) {
    try {
      const result = await db.query(
        `SELECT code, name
        FROM companies
        ORDER BY name`
      );
      return res.json({"companies": result.rows});
    } catch (e) {
      return next(e);
    }
  });

// GET route: Return object of one company, and error handling for unfound company
router.get('/:code', async (req, res, next) => { 
    try {
        let code = req.params.code;

        const compRes = await db.query(
          `SELECT code, name, description 
          FROM companies
          WHERE code = $1`, 
          [code]
        );
        const invRes = await db.query(
            `SELECT id
            FROM invoices
            WHERE comp_code = $1`, 
            [code]
          );
        if (compRes.rows.length === 0) {
            throw new ExpressError(`Company does not exist: ${code}`, 404)
        } else {
            const company = compRes.rows[0];
            const invoices = invRes.rows;
            company.invoices = invoices.map(inv => inv.id)
            return res.json({ "company": company })
        }
    } catch (e) {
      return next(e);
    }
})

// POST route: Add a new company
router.post('/', async (req, res, next) => {
    try {
      const { name, description } = req.body;
      const code = slugify(name, {lower: true})
      const result = await db.query(
          `INSERT INTO companies (code, name, description) 
          VALUES ($1, $2, $3) 
          RETURNING code, name, description`, 
          [code, name, description]);
      return res.status(201).json({ "company": result.rows[0] })
    } catch (e) {
      return next(e)
    }
  })

// PUT route: Edit existing company and error handling for unfound company
router.put('/:code', async (req, res, next) => {
    try {
      const { name, description } = req.body;
      const code = req.params.code;
      const result = await db.query(
          `UPDATE companies
          SET name=$1, description=$2 
          WHERE code = $3 
          RETURNING code, name, description`, 
          [name, description, code]);
      if (result.rows.length === 0) {
        throw new ExpressError(`Company does not exist: ${code}`, 404)
      } else {
        return res.json({ "company": result.rows[0] })
      }
    } catch (e) {
      return next(e)
    }
  })

// DELETE route: Delete existing company and error handling for unfound company
  router.delete('/:code', async (req, res, next) => {
    try {
      let code = req.params.code;
      const result = db.query(
          `DELETE FROM companies
           WHERE id = $1
           RETURNING code`, 
           [code]);
      if(result.rows.length === 0) {
          throw new ExpressError(`Company does not exist: ${code}`, 404);
      } else {
        return res.json({ "msg": "COMPANY DELETED!" })
      }
    } catch (e) {
      return next(e)
    }
  })

  module.exports = router;