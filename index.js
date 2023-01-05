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
        },
        isEqual(a1, a2) {
            return a1 == a2
        }
    }
})

const path = require('path')

const apiRouter = require(path.join(__dirname, 'routers', 'api.js'))

app.engine('hbs', hbs)
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.static(path.join(__dirname, 'public')))

app.use('/api', apiRouter)

app.get('/setup', (req, res) => {
    res.render('setup')
})

app.get('/', async (req, res) => {
    const { category, subcategory, brand, sku } = req.query

    var page = req.query.page
    if (!page) {
        page = 1
    }

    if (category && subcategory && brand) {
        var firstPage = await fetch('http://localhost:3000/api/products/' + category + '/' + subcategory + '/' + brand + '?page=' + page)
        var jsonData = await firstPage.json()

        var requests = []
        for (var p = 1; p <= jsonData.totalPages; p++) {
            requests.push(fetch('http://localhost:3000/api/products/' + category + '/' + subcategory + '/' + brand + '?page=' + p))
        }
        let fetchedResults = await Promise.all(requests)
        var allProducts = []
        for (result of fetchedResults) {
            var jsonData = await result.json()
            allProducts.push(...jsonData.products)
        }

        allProducts.sort((a, b) => {
            return a.salePrice - b.salePrice
        })

        if (sku) {
            allProducts = allProducts.filter(p => p.sku != sku)
        }

        var details = await fetch('https://www.bestbuy.ca/api/v2/json/product/' + (sku ? sku : allProducts.shift().sku))
        var spotlight = await details.json()

        var pages = []
        var page = []
        for (var i = 0; i < allProducts.length; i++) {
            if (i % 8 == 0 && i != 0) {
                pages.push(page)
                page = []
                continue
            }
            page.push(allProducts[i])
        }
        if (page.length > 0) {
            pages.push(page)
        }

        res.render('home', { spotlight, pages })
    } else {
        res.status(400)
        res.type('text/plain')
        res.send('An error occured')
    }
    
})

app.listen(port, () => {
    console.log('App running on port ' + port)
})