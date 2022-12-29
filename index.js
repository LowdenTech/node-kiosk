const express = require('express')
const app = express()
const port = 3000

const handlebars = require('express-handlebars')
const hbs = handlebars.engine({
    extname : 'hbs',
    helpers: {
        checkPrice(item) {
            if (item.salePrice < item.regularPrice) {
                return "<del>$" + item.regularPrice + "</del> <span style='color : red;'>$" + item.salePrice + "</span>"
            }
            return "$" + item.regularPrice
        }
    }
})

const path = require('path')

app.engine('hbs', hbs)
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', async (req, res) => {
    const { query, sku } = req.query
    const category = '30441'
    const maxItemsPerPage = 9

    var page = req.query.page
    if (!page) {
        page = 1
    }

    let result = await fetch('https://www.bestbuy.ca/api/v2/json/search?categoryid=' + category + '&currentRegion=ON&lang=en-CA&page=' + page + '&pageSize=' + maxItemsPerPage + '&path=soldandshippedby0enrchstring%3ABest%20Buy&query=' + query)
    let alternates = await result.json()

    alternates.products.sort((a, b) => {
        return a.salePrice - b.salePrice
    })

    if (!sku) {
        let first = alternates.products.shift()
        let result2 = await fetch('https://www.bestbuy.ca/api/v2/json/product/' + first.sku)
        var spotlight = await result2.json()
    } else {
        let result2 = await fetch('https://www.bestbuy.ca/api/v2/json/product/' + sku)
        var spotlight = await result2.json()
        alternates.products = alternates.products.filter(item => { return item.sku != sku})
    }

    res.render('home', { spotlight, alternates })
})

app.listen(port, () => {
    console.log('App running on port ' + port)
})