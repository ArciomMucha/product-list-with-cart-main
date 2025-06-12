let cartItems = [];
let totalQuantity = 0;
let totalPrice = 0;

//dessers initilization
async function loadDesserts() {
    try {
        const response = await fetch('data.json');

        if (!response.ok) throw new Error('Failed to load data');
        return await response.json();
    }
    catch (error) {
        console.error('Error occured: ', error);
        document.getElementById('menuItems').innerHTML =
            '<p class="error">Failed to load menu<p>';
        return [];
    }
}

//manipulating with HTML to add desserts
function createDessertItem(dessert) {
    const item = document.createElement('div');
    item.className = 'menu-item';

    //creating ID for dessers
    function createDessertId(name) {
        return name.toLowerCase()
            .replace(/[^\w\s]/g, '') // Удаляем спецсимволы
            .replace(/\s+/g, '-')    // Заменяем пробелы на дефисы
            .replace(/-+/g, '-');    // Убираем двойные дефисы
    }


    const dessertId = createDessertId(dessert.name);

    item.innerHTML = `
        <div class="image-and-button">
            <img src="${dessert.image.desktop}" alt="${dessert.name}">
            <button class="add-to-cart" data-id="${dessertId}" data-dessert='${JSON.stringify(dessert)}'>
                <img src="assets/images/icon-add-to-cart.svg" alt="Add to cart">
                Add to Cart
            </button>
        </div>
        <h3>${dessert.category}</h3>
        <p class="item-name">${dessert.name}</p>
        <p class="item-price">$${dessert.price.toFixed(2)}</p>
    `;

    const addToCartBtn = item.querySelector('.add-to-cart');
    addToCartBtn.addEventListener('click', () => addToCart(dessertId, dessert));

    return item;
}

//adding to cart
function addToCart(dessertId, dessert) {
    const existingItem = cartItems.find(item => item.id === dessertId);
    let currentQuantity = 1;
    let currentTotal = dessert.price;

    if (existingItem) {
        existingItem.quantity += 1;
        currentQuantity = existingItem.quantity;
        existingItem.total = existingItem.price * existingItem.quantity;
        currentTotal = existingItem.total;
    } else {
        cartItems.push({
            id: dessertId,
            name: dessert.name,
            price: dessert.price,
            quantity: 1,
            total: dessert.price
        });
    }

    updateCartButton(dessertId, currentQuantity);
    console.log(cartItems);
    console.log("Current quantity of " + dessertId + ": " + currentQuantity);
    console.log("Current total price of " + dessertId + ": " + currentTotal);
}

function updateCartButton(dessertId, quantity) {
    const button = document.querySelector(`[data-id="${dessertId}"]`);
    if (!button) return;

    if (quantity > 0) {
        // Keep the data-id attribute when changing class
        const wasInactive = button.className === "add-to-cart";
        button.className = "add-to-cart-active";
        button.setAttribute('data-id', dessertId);

        // Проверяем, есть ли уже элементы управления количеством
        let quantityText = button.querySelector('p');
        if (!quantityText) {
            // Only clone and replace if transitioning from inactive to active
            if (wasInactive) {
                // Remove all existing event listeners by cloning the button
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);

                // Update reference to the new button
                const activeButton = document.querySelector(`[data-id="${dessertId}"]`);

                // Если элементов нет, создаем их
                activeButton.innerHTML = `
                    <div class="quantity-btn decrement-btn">
                        <img src="assets/images/icon-decrement-quantity.svg" alt="decrement">
                    </div>
                    <p>${quantity}</p>
                    <div class="quantity-btn increment-btn">
                        <img src="assets/images/icon-increment-quantity.svg" alt="increment">
                    </div>
                `;

                // Добавляем обработчики только для кнопок + и -
                activeButton.querySelector('.decrement-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    decrementQuantity(dessertId);
                });

                activeButton.querySelector('.increment-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    incrementQuantity(dessertId);
                });
            }
        } else {
            // Если элементы уже есть, просто обновляем количество
            quantityText.textContent = quantity;
        }
    } else {
        // Возвращаем кнопку в исходное состояние
        button.className = "add-to-cart";
        button.setAttribute('data-id', dessertId);
        button.innerHTML = `
            <img src="assets/images/icon-add-to-cart.svg" alt="Add to cart">
            Add to Cart
        `;

        // Восстанавливаем исходный обработчик событий
        button.addEventListener('click', () => {
            // Get the original dessert data from the data attribute
            const dessertData = JSON.parse(button.getAttribute('data-dessert'));
            addToCart(dessertId, dessertData);
        });
    }

    totalQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);
    totalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    displayCart();
}


function decrementQuantity(dessertId) {
    const existingItem = cartItems.find(item => item.id === dessertId);
    if (!existingItem) {
        return;
    }

    existingItem.quantity -= 1;
    const currentQuantity = existingItem.quantity;
    const currentTotal = existingItem.total;

    if (currentQuantity <= 0) {
        // Удаляем элемент из корзины
        cartItems = cartItems.filter(item => item.id !== dessertId);
    }
    else {
        existingItem.total = existingItem.price * existingItem.quantity;
    }

    updateCartButton(dessertId, currentQuantity);
    totalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    console.log(cartItems);
    console.log("Current quantity of " + dessertId + ": " + currentQuantity);
    console.log("Current total price of " + dessertId + ": " + currentTotal);
}

function incrementQuantity(dessertId) {
    const existingItem = cartItems.find(item => item.id === dessertId);
    if (!existingItem) {
        return;
    }

    existingItem.quantity += 1;
    const currentQuantity = existingItem.quantity;

    existingItem.total = existingItem.price * existingItem.quantity;
    const currentTotal = existingItem.total;

    updateCartButton(dessertId, currentQuantity);
    totalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    console.log(cartItems);
    console.log("Current quantity of " + dessertId + ": " + currentQuantity);
    console.log("Current total price of " + dessertId + ": " + currentTotal);
}

async function displayDesserts() {
    const desserts = await loadDesserts();
    const menuContainer = document.getElementById('menuItems');

    if (desserts.length === 0) {
        menuContainer.innerHTML = '<p>No data available</p>';
        return;
    }

    desserts.forEach(dessert => {
        menuContainer.appendChild(createDessertItem(dessert));
    });

    console.log(desserts);
}

function displayCart() {
    const cart = document.getElementById('cartSection');
    console.log("Total quantity: ", totalQuantity);
    console.log("Total price: " + totalPrice + " $");

    if (totalQuantity == 0) {
        cart.innerHTML = `
        <h2 class="cart-header">Your Cart (0)</h2>
        <img src="assets/images/illustration-empty-cart.svg" alt="">
        <p class="will-appear-here">Your added items will appear here</p>
        `;
    } else {
        let cartItemsHTML = '';

        cartItems.forEach(item => {
            cartItemsHTML += `
                <div class="cart-item" data-id="${item.id}"> 
                    <div class="item-quantity-price">
                        <p class="item-name">${item.name}</p>
                        <span class="quantity">${item.quantity}x</span>
                        <span class="price">@$${item.price.toFixed(2)}</span>
                        <span class="total">$${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                    <div class="remove-icon">
                        <button class="remove-btn">
                            <img src="assets/images/icon-remove-item.svg" alt="Remove">
                        </button>
                    </div>
                </div>
            `;
        });

        cart.innerHTML = `
            <h2 class="cart-header">Your Cart (${totalQuantity})</h2>
            <div class="cart-items-container">
                ${cartItemsHTML}
                <div class="order-total">
                    <div class="order-total-name">
                        <p>Order Total</p>
                    </div>
                    <div class="order-total-number">
                        <p>$${totalPrice.toFixed(2)}</p>
                    </div>
                </div>
                <div class="carbon-neutral">
                    <img src="assets/images/icon-carbon-neutral.svg" alt="">
                    <p>This is a <span>carbon-neutral</span> delivery</p>
                </div>
                <div class="confirm-order-btn"><button>Confirm Order</button></div>
            </div>
        `;

        // Делегирование событий для кнопок удаления
        cart.addEventListener('click', (e) => {
            if (e.target.closest('.remove-btn')) {
                const cartItem = e.target.closest('.cart-item');
                const dessertId = cartItem.getAttribute('data-id');
                removeFromCart(dessertId);
            }
        });
    }
}

function removeFromCart(dessertId) {
    console.log("вызвалась функция " + removeFromCart.name);
    // Удаляем элемент из корзины
    cartItems = cartItems.filter(item => item.id !== dessertId);

    // Обновляем общие значения
    totalQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);
    totalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    // Обновляем кнопку добавления в корзину (возвращаем в исходное состояние)
    updateCartButton(dessertId, 0);

    // Перерисовываем корзину
    displayCart();
}


document.addEventListener('DOMContentLoaded', displayDesserts);
document.addEventListener('DOMContentLoaded', displayCart);
