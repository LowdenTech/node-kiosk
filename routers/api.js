const express = require('express')
const router = express.Router()
const data = require('../data.js')

router.get('/categories', (req, res) => {
    res.json(data.categories)
})

router.get('/categories/:name', (req, res) => {
    const { name } = req.params
    res.json(data.categories.filter(category => category.name == name))
})

router.get('/brands', (req, res) => {
    res.json(data.brands)
})

router.get('/brands/:category', (req, res) => {
    const { category } = req.params
    res.json(data.brands.filter(brand => brand.categories.includes(category)).sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 0))
})

router.get('/products/:sku', async (req, res) => {
    const { sku } = req.params
    let result = await fetch('https://www.bestbuy.ca/api/v2/json/product/' + sku)
    let jsonData = await result.json()
    res.json(jsonData)
})

router.get('/products/:category/:subcategory/:brand', async (req, res) => {
    const { category, subcategory, brand } = req.params
    const maxItemsPerPage = 9
    var { page } = req.query

    if (!page) {
        page = 1
    }

    let dCat = data.categories.filter(c => c.name == category)[0]
    if (!dCat) {
        res.status(400)
        res.send("Category not found")
        return
    }
    let dSubCat = dCat.categories.filter(c => c.name == subcategory)[0]
    if (!dSubCat) {
        res.status(400)
        res.send("Subcategory not found")
        return
    }
    let categoryId = dSubCat.id

    let results = await fetch('https://www.bestbuy.ca/api/v2/json/search?categoryid=' + encodeURIComponent(categoryId) + '&currentRegion=ON&lang=en-CA&page=' + page + '&pageSize=' + maxItemsPerPage + '&path=soldandshippedby0enrchstring%3ABest%20Buy&query=' + encodeURIComponent(brand))
    let jsonData = await results.json()
    res.json(jsonData)
})

module.exports = router