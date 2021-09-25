"use strict";

class User {
	constructor(name, active, cart, purchase) {
		this.name = name;
		this.active = active;
		this.cart = cart;
		this.purchase = purchase;
	}
}
const yusuf = new User("yusuf", true, [], []);
console.log(yusuf);

class Item {
	constructor(name, price) {
		this.name = name;
		this.price = price;
	}
}

const count = document.querySelector(".count");
const categories = document.querySelector(".categories");
const products = document.querySelector(".products");
const shoppingCart = document.querySelector(".cart");
const dropDownshoppingCart = document.querySelector(".cart--product--list");
const deleteProduct = document.getElementById("del");
const totalProduct = document.getElementById("total--product");
const subTotal = document.getElementById("sub--total");
const totalProduct2 = document.getElementById("total--product2");
const subTotal2 = document.getElementById("sub--total2");
const purchaseBtn = [...document.querySelectorAll(".purchase--btn")];

let state = {};
let selectedShowProducts;
let shoppingCarts;
let cartProductItems = [];

console.log(purchaseBtn);
purchaseBtn.forEach(btn => {
	if (cartProductItems.length < 1) btn.classList.add("hidden");
});

const getCategory = function () {
	let categoryArr;
	let categoryURL = [];
	let showProduct;

	fetch("https://fakestoreapi.com/products/categories")
		.then(res => {
			if (!res.ok) throw new Error(`product not found! (${response.status})`);
			return res.json();
		})
		.then(data => {
			categoryArr = data;
			categoryArr.forEach((categories, i) => {
				categoryURL.push(
					`https://fakestoreapi.com/products/category/${categories}`
				);
			});
			Promise.all(
				categoryURL.map(url => {
					return fetch(url)
						.then(res => res.json())
						.then(data => {
							categories.classList.remove("hidden");
							renderCategory(data, data[2].image);
							return data;
						});
				})
			)
				.then(data => {
					data.reduce((acc, value) => {
						let key = value[0].category;
						if (!acc[key]) {
							acc[key] = value;
							// add tax to products
							key === "electronics"
								? acc[key].forEach(product => (product.tax = 0.18))
								: acc[key].forEach(product => (product.tax = 0.1));
							//add quantity to products
							acc[key].forEach(product => (product.quantity = 1));
							acc[key].forEach(
								product =>
									(product.totalPrice = +(
										product.price +
										product.price * product.tax
									).toFixed(2))
							);
						}
						return acc;
					}, state);
					console.log(state);
					showProduct = [...document.querySelectorAll(".show--product")];
					return showProduct;
				})
				.then(data => {
					console.log(data);
					getProduct(data);
				});
		});
};

const getProduct = function (data) {
	let selectedCategory;
	let addCartBtn;

	data.forEach(el => {
		el.addEventListener("click", function (e) {
			let selectedEl = e.target.closest(".categories--cart");
			selectedCategory = selectedEl.children[0].textContent;
			selectedShowProducts = state[selectedCategory];
			renderProductName();
			selectedShowProducts.forEach(el => {
				renderProduct(el);
			});
			addCartBtn = [...document.querySelectorAll(".add--cart")];
			addToCart(addCartBtn);
		});
	});
};

const addToCart = function (btn) {
	let selectedProductID;
	let deleteCartBtn;
	let quantityElID;

	btn.forEach(el => {
		el.addEventListener("click", function (e) {
			let selectedEl = e.target.closest(".products--cart");
			selectedProductID = selectedEl.children[3].textContent.replace(
				"ID: ",
				""
			);

			// Get current product
			let result = state[selectedShowProducts[0].category].reduce(
				(acc, value) => {
					acc === value["id"] ? (acc = value) : "";
					return acc;
				},
				+selectedProductID
			);

			let pushData = true;
			if (cartProductItems.length > 0) {
				cartProductItems.some(val => {
					if (val.id === result.id) {
						val.quantity === 5 ? alert("You cant add the product over 5!") : "";
						val.quantity < 5
							? (val.quantity += 1)
							: (val.quantity = val.quantity);
						pushData = false;
					}
				});
			}

			pushData ? cartProductItems.push(result) : "";
			renderCartCount();
			let promise1 = new Promise(resolve => {
				if (pushData) {
					resolve(renderCartProduct(result));
				} else {
					resolve((quantityElID = result.id));
				}
			});

			promise1.then(() => {
				deleteCartBtn = [...document.querySelectorAll("#del")];
				console.log(deleteCartBtn);
				shoppingCarts = [...document.querySelectorAll(".shopping--cart")];
				console.log(shoppingCarts);

				renderTotalCartPrice();

				// increase quantity of current product
				!pushData
					? shoppingCarts.forEach(el => {
							if (
								quantityElID ===
								+el.children[3].children[0].textContent.replace("ID: ", "")
							) {
								// re-render price depends to quantity
								updatePrice(el, result);

								// increase quantity value
								el.children[1].children[2].children[1].value = result.quantity;
							}
					  })
					: "";

				shoppingCarts.forEach(el => {
					el.children[1].children[2].children[1].addEventListener(
						"change",
						function (e) {
							selectedProductID =
								+el.children[3].children[0].textContent.replace("ID: ", "");
							cartProductItems.forEach(product => {
								if (product.id === selectedProductID) {
									product.quantity =
										+el.children[1].children[2].children[1].value;

									// re-render price depends to quantity
									updatePrice(el, product);
									renderCartCount();
								}
							});
						}
					);
				});

				purchaseBtn.forEach(btn => {
					if (cartProductItems.length > 0) btn.classList.remove("hidden");
				});
				removeCartProduct(deleteCartBtn);
			});
		});
	});
};

const removeCartProduct = function (product) {
	let selectedProductID;
	product.forEach(el => {
		el.addEventListener("click", function (e) {
			let selectedEl = e.target.closest(".shopping--cart");
			selectedProductID =
				selectedEl.children[3].children[0].textContent.replace("ID: ", "");
			let result = cartProductItems.reduce((acc, value) => {
				acc === value["id"] ? (acc = value) : "";
				return acc;
			}, +selectedProductID);
			let index = cartProductItems.indexOf(result);
			if (index != -1) {
				// when the product deleted current product quantity value return 1
				cartProductItems[index].quantity = 1;

				//when the product deleted current product total price calculate for 1 quantity
				cartProductItems[index].totalPrice = +(
					cartProductItems[index].price +
					cartProductItems[index].price * cartProductItems[index].tax
				).toFixed(2);

				// delete product from cartProductITems Array
				cartProductItems.splice(index, 1);

				shoppingCarts.find(cart => {
					if (
						+cart.children[3].children[0].textContent.replace("ID: ", "") ===
						+selectedProductID
					)
						cart.remove();
				});
			}

			renderTotalCartPrice();

			console.log(selectedEl);
			console.log(shoppingCarts);
			renderCartCount();
			purchaseBtn.forEach(btn => {
				if (cartProductItems.length < 1) btn.classList.add("hidden");
			});
		});
	});
};

const renderCategory = function (data, img) {
	const html = `
    <div class="categories--cart">
      <h3 class = "category--name">${data[0].category}</h3>
      <img
        src="${img}"
        alt=""
      />
      <h3>Quantity of products: ${data.length}</h3>
      <button class="show--product">Show Products</button>
    </div>
    `;

	categories.insertAdjacentHTML("beforeend", html);
};

const renderProduct = function (product) {
	const html = `
  <div class="products--cart">
    <h3>"${product.title}"</h3>
    <img
    src="${product.image}"
    alt=""
    />
    <h3>Price: ${product.price} $</h3>
    <h5>ID: ${product.id} </h5>
    <button class = "add--cart">Add to Cart</button>
  </div>
  `;

	products.insertAdjacentHTML("beforeend", html);
};

const renderCartProduct = function (product) {
	shoppingCart.classList.remove("hidden");
	const html = `
      <div class="shopping--cart">
        <div class="img">
          <img
            src="${product.image}"
            alt=""
          />
        </div>
        <div class="description">
          <h3>${product.title}</h3>
          <h3 class ="product-desc">
           ${product.description}
          </h3>
          <div>
            <label for="quantity">Quantity:</label>
            <select name="" id="quantity" data-quantityid="${product.id}">
              <option value="1">${product.quantity}</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>
          <div class="price">
            <h3>Price: ${product.price + " +"}</h3>
            <h3> ${product.tax * 100 + "% "}</h3>
            <h3>${" = " + product.totalPrice + " $"}</h3>
          </div>
        </div>
        <div class="delete">
          <img src="./img/delete.png" alt="delete" id ="del" />
        </div>
        <div class="id">
          <h3>ID: ${product.id}</h3>
        </div>
      </div>
     
  `;

	shoppingCart.insertAdjacentHTML("afterbegin", html);
	dropDownshoppingCart.insertAdjacentHTML("afterbegin", html);
};

const renderProductName = function () {
	products.classList.remove("hidden");
	const upperCase =
		selectedShowProducts[0].category.slice(0, 1).toUpperCase() +
		selectedShowProducts[0].category.slice(1);
	products.innerHTML = `
      <div class="header">
        <h1>Products of "${upperCase}"</h1>
      </div>
      `;
};

const renderCartCount = function () {
	if (cartProductItems.length === 0) shoppingCart.classList.add("hidden");

	let productCount = cartProductItems.reduce((acc, value) => {
		acc += value.quantity;
		return acc;
	}, 0);
	count.textContent = productCount;
	totalProduct.textContent = productCount;
	totalProduct2.textContent = productCount;
};

const updatePrice = function (el, product) {
	let totalPrice;

	product.totalPrice = +(
		(product.price + product.price * product.tax) *
		product.quantity
	).toFixed(2);
	totalPrice = product.totalPrice;
	el.children[1].children[3].children[2].textContent = `${
		" = " + totalPrice.toFixed(2) + " $"
	}`;

	renderTotalCartPrice();
};

const renderTotalCartPrice = function () {
	subTotal.textContent = cartProductItems.reduce((acc, product) => {
		acc += product.totalPrice;
		return +acc.toFixed(2);
	}, 0);
	subTotal2.textContent = cartProductItems.reduce((acc, product) => {
		acc += product.totalPrice;
		return +acc.toFixed(2);
	}, 0);
};

getCategory();

// Yapılacaklar

/*
1- sepete ürün eklendiğinde add to cart butonun yanında kısa bir spinner oluştur ve ekleme tamamlandığında onay ver
2- fetch ile category leri çekerken bekleme süresi boyunca "fetchşng data... " şeklinde bir spinner oluştur
3- fetch ederken hata ile karşılaşırsa hata mesajı print et
4- sepete tıklandığında shopping cart sekmesini ekrana getir ve hoverlandığında küçük bir dropdown içine renderla
*/

// reverse string exercise
("Hi My name is Andrei");
function reverse(str) {
	let deneme = str.split("").reverse().join("");

	console.log(deneme);
}

reverse("Hi My name is Andrei");

// merge arrays exercise
function mergeSortedArrays(a, b) {
	// let lastItem = a.pop();
	// console.log(lastItem);
	// let newArr = a.concat(b).concat(lastItem);
	// console.log(newArr);
	let lastItem = a.indexOf(a[a.length - 1]);
	a.push(...a.splice(lastItem, 1, ...b));
	console.log(a);
}

mergeSortedArrays([0, 3, 4, 31], [4, 6, 30]);

//GOOGLE QUESTİON

// find first repeated items in array exercise

const array1 = [2, 5, 1, 2, 3, 5, 1, 2, 4]; // return second 2
const array2 = [2, 1, 1, 2, 3, 5, 1, 2, 4]; //return second 1
const array3 = [2, 3, 4, 5]; // return undefined

// solution 1#
function repeatedItem(array, item) {
	let index = [];
	for (let i = 0; i < array.length; i++) {
		if (array[i] === item) index.push(i);
	}
	if (index.length < 2) return undefined;
	console.log(index);
	return array[index[1]];
}

// solution 2#
function repeatedItem2(array, item) {
	let index = [];
	array.forEach((val, i) => {
		array[i] === item ? index.push(i) : "";
	});
	console.log(index);
	// return array[index[1]];
	let result;
	return (result = array.splice(index[1], 1).join(""));
}

// solution 3#
function repeatedItem3(array, item) {
	let index = [];
	let result = array.reduce((acc, val, i) => {
		if (array[i] === item) index.push(i);
		if (index.length > 1) {
			array[index[1]] === item ? (acc = array[index[1]]) : "";
		} else acc = undefined;
		return acc;
	}, 0);
	return result;
}

// console.log(repeatedItem(array1));
// console.log(array1);

// console.log(repeatedItem2(array2, 2));
// console.log(array2);

// console.log(repeatedItem3(array1, 3));
// console.log(array1);

// find without specifying item
function getSecondRepeatItem(input) {
	let result = {};
	let index = [];
	let deleteKeys = [];
	let firstIndex = input.reduce((acc, val, i) => {
		if (acc[val] === undefined) {
			acc[val] = i;
		} else {
			result[input[i]] === undefined ? (result[input[i]] = i) : "";
			index.push(i);
		}
		return acc;
	}, {});
	for (let i = 0; i < Object.keys(firstIndex).length; i++) {
		result[Object.keys(firstIndex)[i]] === undefined
			? deleteKeys.push(Object.keys(firstIndex)[i])
			: "";
	}

	deleteKeys.forEach(val => delete firstIndex[val]);
	console.log("Repeated indexs => ", index);
	console.log("Items First index => ", firstIndex);
	console.log("Items First Repeat index => ", result);
	console.log(
		"First Repeat Item and index => ",
		input[result[input[index[0]]]],
		"and index => ",
		index[0]
	);
	return input[result[input[index[0]]]];
}
getSecondRepeatItem([2, 1, 1, 2, 3, 5, 1, 2, 4]);
