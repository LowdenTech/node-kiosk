$(document).on("scroll", (e) => {
    let isAtTop = this.scrollY <= 0
    if (isAtTop) {
        $('#arrow').css("opacity", 1)
    } else {
        $('#arrow').css("opacity", 0)
    }
})

function changeSpotlight(sku) {
    let searchParams = new URLSearchParams(document.location.search)
    searchParams.set('sku', sku)
    document.location.replace("?" + searchParams)
}

function changePage(page) {
    let searchParams = new URLSearchParams(document.location.search)
    searchParams.set('page', page)
}