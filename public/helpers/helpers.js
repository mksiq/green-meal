$(function () {
    $('[data-toggle="popover"]').popover()
})

function addToCart(meal) {
    fetch(`/cart/${meal}`, {
        method: "PUT"
    }).then(response => response.json())
        .then(json => { });
}