const cartButton = document.querySelector('#cart-link');
const closeCartButton = document.querySelector('.close-button');
const cartDOM = document.querySelector('.cart');
const cartMenu = document.querySelector('#cart-menu');
const cartAmount = document.querySelector('.current-amount');
const cartTotal = document.querySelector('.total-price-cart');
const cartItems = document.querySelector('#cart-items');
const productsDOM = document.querySelector('#grid-products');
const orderButton = document.querySelector('#button-order');

let cart = [];
let buttonsDOM = [];

class Products {
    async getProducts() {
        try {
            let result = await fetch('products.json');
            let data = await result.json();
            let products = data.items;
            products = products.map(item => {
                const {title, price} = item.fields;
                const {id} = item.sys;
                const image = item.fields.image.fields.file.url;
                return {title, price, id, image}
            })
            return products;
        } catch (error) {
            console.log(error);
        }
    }
}

class UI {
    displayProducts(products) {
        let result = '';
        products.forEach(product => {
            result += `
            <div class="product-item" data-p-id="${product.id}">
            <div class="product-image">
                <img src="${product.image}" alt="${product.title}">
            </div>
            <div class="content-block">
                <div class="product-info">
                    <p class="product-name" title="${product.title.charAt(0).toUpperCase() + product.title.slice(1)}">${product.title}</p>
                    <span class="current-price">¥${product.price}</span>
                </div>
                <button class="button button-cart-add" id="button-cart-add" data-id="${product.id}"> <img src="/svg/cart-add.svg" alt=""> </button>
            </div>
        </div>
            `
        });
        productsDOM.innerHTML = result;
    }
    getBagButtons() {
        const buttons = [...document.querySelectorAll('#button-cart-add')];
        buttonsDOM = buttons;
        buttons.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);
            if (inCart) {
                button.disabled = true;
                button.children[0].src = '/svg/checked.svg';
            } 
            button.addEventListener('click', event => {
                event.target.src = '/svg/checked.svg';                
                event.target.parentElement.disabled = true;
                let cartItem = {...Storage.getproduct(id), amount:1};
                cart = [...cart, cartItem];
                Storage.saveCart(cart);
                this.setCartValues(cart);
                this.addCartItem(cartItem);
            })
        })
    }
    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        let productNewPrice = 0;
        cart.map(item => {
            productNewPrice = item.price * item.amount;
            tempTotal += productNewPrice;
            itemsTotal += item.amount;
        })
        cartTotal.innerText = `¥${parseFloat(tempTotal.toFixed(2))}`;
        cartAmount.innerText = `(${itemsTotal})`;
    }
    addCartItem(item) {
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
        <div class="cart-item-top">
            <img src="${item.image}" alt="${item.title}" class="cart-item-image">
            
            <div class="content-block-cart">
                <div class="product-info-cart">
                    <div class="info-cart-top">
                        <span class="current-price current-price-cart" data-id=${item.id}>¥${item.price}</span>
                        <button class="button button-trash" data-id=${item.id}><img src="/svg/trash.svg" alt=""></button>
                    </div>
                    <p class="cart-product-name">${item.title}</p>
                </div>
                <div class="cart-item-bottom">
                    <img src="/svg/minus.svg" data-id=${item.id} class='minus'>
                    <p class="item-amount">${item.amount}</p>
                    <img src="/svg/plus.svg" data-id=${item.id} class='plus'>
                </div>
            </div>
        </div>`;
        cartItems.appendChild(div);
    }
    toggleCartVisibility() {
        cartMenu.classList.toggle('show');
        cartDOM.classList.toggle('visible');
    }
    setupApp() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.fillCart(cart);
        cartButton.addEventListener('click', this.toggleCartVisibility);
        closeCartButton.addEventListener('click', this.toggleCartVisibility);
    }
    fillCart(cart) {
        cart.forEach(item => this.addCartItem(item));
    }
    cartLogic() {
        cartItems.addEventListener('click', event => { 
            let clickedElement = event.target;
            if (clickedElement.parentElement.classList.contains('button-trash')) {
                let id = clickedElement.parentElement.dataset.id;
                cartItems.removeChild(clickedElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement);
                this.removeItem(id);
            } else if (clickedElement.classList.contains('plus')) {
                let id = clickedElement.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount++;
                if (tempItem.amount <= 10) {
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    clickedElement.previousElementSibling.innerText = tempItem.amount;
                }
            } else if (clickedElement.classList.contains('minus')) {
                let id = clickedElement.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                if (tempItem.amount > 1) {
                    tempItem.amount--;
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    clickedElement.nextElementSibling.innerText = tempItem.amount;
                }
            } 
        });
        orderButton.addEventListener('click', () => {
            if (cart.length > 0) {
                let names = cart.map(x => `\nItem: ${x.title[0].toUpperCase() + x.title.slice(1)} \nQuantity: ${x.amount}`);
                
                alert(names);
            }
            let cartContent = cart.map(item => item.id);
            cartContent.forEach(id => this.removeItem(id));
            [...cartItems.childNodes].forEach(x => x.remove());
        })
            
    }
    updatePrice(item) {
        console.log(item);
    }
    removeItem(id) {
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.children[0].src = '/svg/cart-add.svg'; 
    }
    getSingleButton(id) {
        return buttonsDOM.find(button => button.dataset.id === id);
    }

}

class Storage {
    static saveProducts(products) {
        localStorage.setItem('products', JSON.stringify(products));
    }
    static getproduct(id) {
        let product = JSON.parse(localStorage.getItem('products'));
        return product.find(product => product.id === id);
    }
    static saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    static getCart() {
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const ui = new UI();
    const products = new Products();
    ui.setupApp();

    products.getProducts().then(products => {
        ui.displayProducts(products);
        Storage.saveProducts(products);
        setupSearch(products);
    }).then(()=> {
        ui.getBagButtons();
        ui.cartLogic();

    }).then(() => {

    });

    const list = document.querySelectorAll('ul');
    let tempList = [...list].slice(1)
    tempList.forEach(x => { 
        x.classList.add('collapse');
        x.previousElementSibling.addEventListener('click', e => {
            if (x.classList.contains('show')) {
                x.classList.remove('show');
                x.classList.add('collapse');
            } else {
                tempList.forEach(z => { z.classList.remove('show'); z.classList.add('collapse') })
                x.classList.add('show');
                x.classList.remove('collapse');
            }
        }) 
    });

    function setupSearch(products) {
        const searchBar = document.querySelector('#input-search');
        searchBar.addEventListener('input', e => {
            let value = e.target.value.toLowerCase();
            products.forEach(product => {
                const isVisible = product.title.includes(value);
                let cur = document.querySelector(`[data-p-id="${product.id}"]`);
                cur.classList.toggle('hidden', !isVisible);
            })
            let z = [...productsDOM.children].filter(x => !x.classList.contains('hidden'));
            z.length == 0 ? document.querySelector('.empty').classList.remove('hidden') : document.querySelector('.empty').classList.add('hidden');

        })
    }

})



