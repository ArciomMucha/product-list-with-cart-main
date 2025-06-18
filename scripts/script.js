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
            <picture>
                <source media="(max-width: 768px)" srcset="${dessert.image.mobile}">
                <source media="(min-width: 769px)" srcset="${dessert.image.desktop}">
                <img src="${dessert.image.desktop}" class="dessert-image" alt="${dessert.name}">
            </picture>
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
            thumb: dessert.image.thumbnail,
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

    const dessertImage = button.closest('.image-and-button').querySelector('.dessert-image');

    if (quantity > 0) {
        dessertImage.classList.add('active-border');
        const wasInactive = button.className === "add-to-cart";
        button.className = "add-to-cart-active";
        button.setAttribute('data-id', dessertId);

        let quantityText = button.querySelector('p');
        if (!quantityText) {
            if (wasInactive) {
                // Создаем новую кнопку и заменяем старую
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);

                const activeButton = document.querySelector(`[data-id="${dessertId}"]`);
                activeButton.innerHTML = `
                    <div class="quantity-btn decrement-btn">
                        <img src="assets/images/icon-decrement-quantity.svg" alt="decrement">
                    </div>
                    <p>${quantity}</p>
                    <div class="quantity-btn increment-btn">
                        <img src="assets/images/icon-increment-quantity.svg" alt="increment">
                    </div>
                `;

                // Удаляем все старые обработчики перед добавлением новых
                const decrementBtn = activeButton.querySelector('.decrement-btn');
                const incrementBtn = activeButton.querySelector('.increment-btn');

                // Клонируем элементы, чтобы сбросить обработчики
                const newDecrement = decrementBtn.cloneNode(true);
                const newIncrement = incrementBtn.cloneNode(true);

                decrementBtn.replaceWith(newDecrement);
                incrementBtn.replaceWith(newIncrement);

                newDecrement.addEventListener('click', (e) => {
                    e.stopPropagation();
                    decrementQuantity(dessertId);
                });

                newIncrement.addEventListener('click', (e) => {
                    e.stopPropagation();
                    incrementQuantity(dessertId);
                });
            }
        } else {
            quantityText.textContent = quantity;
        }
    } else {
        dessertImage.classList.remove('active-border');
        button.className = "add-to-cart";
        button.setAttribute('data-id', dessertId);
        button.innerHTML = `
            <img src="assets/images/icon-add-to-cart.svg" alt="Add to cart">
            Add to Cart
        `;

        // Удаляем все старые обработчики перед добавлением нового
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);

        newButton.addEventListener('click', () => {
            const dessertData = JSON.parse(newButton.getAttribute('data-dessert'));
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

function displayModal() {
    const modal = document.getElementById('modalWindow');
    const overlay = document.getElementById('modalOverlay');

    // Не показываем модальное окно, если корзина пуста
    if (cartItems.length === 0) {
        modal.style.display = 'none';
        overlay.style.display = 'none';
        return;
    }

    let cartItemsHTML = '';

    cartItems.forEach(item => {
        cartItemsHTML += `
            <div class="cart-item" data-id="${item.id}">
                <div class="item-image">
                    <img src="${item.thumb}" alt="">
                </div>
                <div class="item-quantity-price">
                    <p class="item-name">${item.name}</p>
                    <span class="quantity">${item.quantity}x</span>
                    <span class="price">@$${item.price.toFixed(2)}</span>
                </div>
                <div class="total">$${(item.price * item.quantity).toFixed(2)}</div>
            </div>
        `;
    });

    modal.innerHTML = `
        <img class="confirmed-icon" src="assets/images/icon-order-confirmed.svg" alt="">
        <h1 class="main-header">Order Confirmed</h1>
        <p class="enjoy-text">We hope you enjoy your food!</p>
        <div class="cart-items-container">
            <div class="items-and-total">
                ${cartItemsHTML}
                <div class="order-total">
                    <div class="order-total-name">
                        <p>Order Total</p>
                    </div>
                    <div class="order-total-number">
                        <p>$${totalPrice.toFixed(2)}</p>
                    </div>
                </div>
            </div>
            <div class="confirm-order-btn"><button id="startNewOrderBtn">Start New Order</button></div>
        </div>
    `;

    // Показываем модальное окно и оверлей
    modal.style.display = 'block';
    overlay.style.display = 'block';

    // Добавляем обработчик для кнопки "Start New Order"
    const startNewOrderBtn = document.getElementById('startNewOrderBtn');
    if (startNewOrderBtn) {
        startNewOrderBtn.addEventListener('click', resetCart);
    }

    // Добавляем обработчик для закрытия по клику на оверлей
    overlay.addEventListener('click', () => {
        modal.style.display = 'none';
        overlay.style.display = 'none';
    });
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
                <div class="confirm-order-btn" id="confirmOrderBtn"><button>Confirm Order</button></div>
            </div>
        `;

        // Добавляем обработчик для кнопки подтверждения заказа
        const confirmOrderBtn = document.getElementById('confirmOrderBtn');
        if (confirmOrderBtn) {
            confirmOrderBtn.addEventListener('click', () => {
                displayModal();
            });
        }

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
    console.log("Removing item with ID:", dessertId);

    // Удаляем элемент из корзины
    cartItems = cartItems.filter(item => item.id !== dessertId);

    // Обновляем общие значения
    totalQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);
    totalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    // Полностью сбрасываем кнопку
    const button = document.querySelector(`[data-id="${dessertId}"]`);
    if (button) {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        newButton.className = "add-to-cart";
        newButton.innerHTML = `
            <img src="assets/images/icon-add-to-cart.svg" alt="Add to cart">
            Add to Cart
        `;
        newButton.addEventListener('click', () => {
            const dessertData = JSON.parse(newButton.getAttribute('data-dessert'));
            addToCart(dessertId, dessertData);
        });
    }

    // Перерисовываем корзину
    displayCart();
}

function resetCart() {
    // Очищаем корзину
    cartItems = [];
    totalQuantity = 0;
    totalPrice = 0;

    // Скрываем модальное окно
    const modal = document.getElementById('modalWindow');
    const overlay = document.getElementById('modalOverlay');
    modal.style.display = 'none';
    overlay.style.display = 'none';

    // Сбрасываем все кнопки "Add to Cart"
    const addToCartButtons = document.querySelectorAll('.add-to-cart-active');
    addToCartButtons.forEach(button => {
        const dessertId = button.getAttribute('data-id');
        const dessertData = JSON.parse(button.getAttribute('data-dessert'));

        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        newButton.className = "add-to-cart";
        newButton.innerHTML = `
            <img src="assets/images/icon-add-to-cart.svg" alt="Add to cart">
            Add to Cart
        `;
        newButton.addEventListener('click', () => {
            addToCart(dessertId, dessertData);
        });
    });

    document.querySelectorAll('.dessert-image').forEach(img => {
        img.classList.remove('active-border');
    });

    // Обновляем отображение корзины
    displayCart();
}


document.addEventListener('DOMContentLoaded', displayDesserts);
document.addEventListener('DOMContentLoaded', displayCart);
