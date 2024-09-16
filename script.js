// Obtener elementos del DOM
const title = document.getElementById("titulo");
const searchInput = document.getElementById("searchInput");
const cardsContainer = document.getElementById("productos");
const carrito = document.getElementById("listaCarrito");
const modalDetail = document.getElementById("modal-detail");
const productCategorySelect = document.getElementById("productCategory");
const saveProductButton = document.getElementById("saveProductButton");
const productForm = document.getElementById("productForm");
const sortButton = document.getElementById("sortButton");

let webColor = "#c6c7ff";

// Variables globales
let products = [];
let carritoItems = [];
let sortAscending = true;
let editingProductId = null;

// URL de la API del backend
const apiUrl = 'http://localhost:3000/api/products'; // Asegúrate de que esta URL corresponda a tu backend

// Cargar los productos al cargar la página
window.onload = () => {
  fetchProducts();
  attachEventListeners();
};

// Función para obtener productos del backend
function fetchProducts(params = {}) {
  let url = apiUrl;
  const queryParams = new URLSearchParams(params);
  if (queryParams.toString()) {
    url += `?${queryParams.toString()}`;
  }
  fetch(url)
    .then(response => response.json())
    .then(data => {
      products = data;
      renderProducts(products);
    })
    .catch(error => console.error('Error al obtener productos:', error));
}

// Funciones de búsqueda y filtrado
document.getElementById("searchButton").addEventListener("click", filterAndRenderProducts);

searchInput.addEventListener("input", filterAndRenderProducts);

function filterAndRenderProducts() {
  const text = searchInput.value.trim();
  if (text) {
    fetchProducts({ search: text });
  } else {
    fetchProducts();
  }
}

// Función para alternar el ordenamiento
sortButton.addEventListener("click", () => {
  if (sortAscending) {
    fetchProducts({ sort: 'price_asc' });
    sortButton.textContent = "Ordenar por precio ↓";
  } else {
    fetchProducts({ sort: 'price_desc' });
    sortButton.textContent = "Ordenar por precio ↑";
  }
  sortAscending = !sortAscending;
});

// Filtrar por categoría
document.querySelectorAll(".item-categoria").forEach((item) => {
  item.addEventListener("click", (event) => {
    event.preventDefault();
    const category = item.getAttribute("data-sort");
    if (category === "Todas") {
      fetchProducts();
    } else {
      fetchProducts({ category: category });
    }
  });
});

// Función para renderizar los productos
function renderProducts(productsList) {
  cardsContainer.innerHTML =
    productsList.length === 0
      ? `<div class="notification has-text-centered"><p class="title is-4">No se encontraron productos</p></div>`
      : productsList.map((product) => renderCard(product)).join("");
  attachDragEvents();

  document.querySelectorAll(".product").forEach(($product) => {
    $product.addEventListener("click", openDetailModal);
  });
}

// Función para renderizar una tarjeta de producto
function renderCard(product) {
  return `
    <div class="cell product accent-shadow" draggable="true" ondragstart="drag(event)" id="${product._id}" data-product-id="${product._id}">
      <div class="card">
        <div class="card-image" style="height:200px; overflow:hidden;">
          <figure class="image is-4by3">
            <img src="${product.image}" alt="${product.name}" style="width:100%; height:100%; object-fit:cover;" />
          </figure>
        </div>
        <div class="card-content">
          <div class="media">
            <div class="media-content">
              <p class="title is-4">${product.name}</p>
              <p class="subtitle is-4">$${product.price}</p>
            </div>
          </div>
          <div class="content">${product.description}</div>
        </div>
        <footer class="card-footer">
          <a href="#" class="card-footer-item" onclick="editProduct('${product._id}', event)">Editar</a>
          <a href="#" class="card-footer-item" onclick="deleteProduct('${product._id}', event)">Eliminar</a>
        </footer>
      </div>
    </div>`;
}

// Función para abrir el modal de detalle del producto
function openDetailModal(event) {
  event.stopPropagation();

  modalDetail.classList.add("is-active");
  const productDetail = products.find((p) => p._id === event.currentTarget.id);

  modalDetail.querySelector(".modal-card-title").textContent = productDetail.name;
  document.getElementById("modal-image").src = productDetail.image;
  document.getElementById("modal-description").textContent = productDetail.description;
  document.getElementById("modal-price").textContent = `$${productDetail.price} USD`;
}

// Función para manejar el arrastre (drag)
function attachDragEvents() {
  document.querySelectorAll(".product").forEach((product) => {
    product.addEventListener("dragstart", drag);
  });
}

function drag(event) {
  event.dataTransfer.setData("text/plain", event.currentTarget.id);
}

// Permitir soltar (drop) en el carrito
function allowDrop(event) {
  event.preventDefault();
}

document.getElementById("carrito").addEventListener("dragover", allowDrop);
document.getElementById("carrito").addEventListener("drop", drop);

// Función para manejar el drop en el carrito
function drop(event) {
  event.preventDefault();
  const productId = event.dataTransfer.getData("text/plain");
  const product = products.find((p) => p._id === productId);

  if (product) {
    const existingItem = carritoItems.find(item => item._id === productId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      carritoItems.push({ ...product, quantity: 1 });
    }
    renderCart();
  }
}

// Función para renderizar el carrito
function renderCart() {
  carrito.innerHTML = '';

  carritoItems.forEach((item) => {
    const cartItem = `
      <div class="box my-3 accent-color" data-product-id="${item._id}">
        <div class="is-flex is-justify-content-space-between">
          <div>
            <b>${item.name}</b> - $${item.price}
            <span class="quantity">${item.quantity}</span> unidad(es)
          </div>
          <div>
            <button onclick="increaseQuantity('${item._id}', 1)">+</button>
            <button onclick="increaseQuantity('${item._id}', -1)">-</button>
          </div>
        </div>
      </div>
    `;
    carrito.innerHTML += cartItem;
  });
}

// Función para incrementar o disminuir la cantidad de un producto en el carrito
function increaseQuantity(productId, change) {
  const item = carritoItems.find(item => item._id === productId);
  if (item) {
    item.quantity = Math.max(1, item.quantity + change);
    renderCart();
  }
}

// Lista de categorías
const categorias = [
  "Accesorios",
  "Periféricos",
  "Audio",
  "Pantallas",
  "Almacenamiento",
  "Wearables",
];

// Poblar el select de categorías en el formulario de agregar producto
if (productCategorySelect) {
  categorias.forEach((categoria) => {
    const option = document.createElement("option");
    option.value = categoria;
    option.textContent = categoria;
    productCategorySelect.appendChild(option);
  });
}

// Manejo de modales
document.addEventListener("DOMContentLoaded", () => {
  function openModal($el) {
    $el.classList.add("is-active");
  }

  function closeModal($el) {
    $el.classList.remove("is-active");
  }

  function closeAllModals() {
    (document.querySelectorAll(".modal") || []).forEach(($modal) => {
      closeModal($modal);
    });
  }

  document.querySelectorAll(".js-modal-trigger").forEach(($trigger) => {
    const modal = $trigger.dataset.target;
    const $target = document.getElementById(modal);

    $trigger.addEventListener("click", () => {
      openModal($target);
    });
  });

  document
    .querySelectorAll(".modal-background, .delete, .modal-card-foot .button")
    .forEach(($close) => {
      const $target = $close.closest(".modal");

      $close.addEventListener("click", () => {
        closeModal($target);
      });
    });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAllModals();
    }
  });
});

// Función para guardar un nuevo producto o actualizar uno existente
saveProductButton.addEventListener("click", (event) => {
  event.preventDefault(); // Prevenir el envío del formulario

  if (productForm.checkValidity()) {
    const name = document.getElementById("productName").value;
    const description = document.getElementById("productDescription").value;
    const image = document.getElementById("productImage").value;
    const price = parseFloat(document.getElementById("productPrice").value);
    const category = document.getElementById("productCategory").value;

    const productData = {
      name,
      description,
      image,
      price,
      category,
    };

    if (editingProductId) {
      // Actualizar producto existente en el backend
      fetch(`${apiUrl}/${editingProductId}`, {
        method: 'PUT', // o 'PATCH' dependiendo de tu backend
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      })
      .then(response => response.json())
      .then(updatedProduct => {
        // Refrescar la lista de productos
        fetchProducts();
        // Resetear el formulario y estado de edición
        editingProductId = null;
        saveProductButton.textContent = "Agregar Producto";
        closeAllModals();
        productForm.reset();
      })
      .catch(error => console.error('Error al actualizar el producto:', error));
    } else {
      // Crear nuevo producto en el backend
      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      })
      .then(response => response.json())
      .then(newProduct => {
        // Refrescar la lista de productos
        fetchProducts();
        // Resetear el formulario
        closeAllModals();
        productForm.reset();
      })
      .catch(error => console.error('Error al agregar el producto:', error));
    }
  } else {
    alert("Por favor, completa todos los campos.");
  }
});

// Función para editar un producto
function editProduct(productId, event) {
  event.preventDefault();
  const product = products.find((p) => p._id === productId);
  if (!product) return;

  // Llenar el formulario con los datos del producto
  document.getElementById("productName").value = product.name;
  document.getElementById("productDescription").value = product.description;
  document.getElementById("productImage").value = product.image;
  document.getElementById("productPrice").value = product.price;
  document.getElementById("productCategory").value = product.category;

  // Cambiar el texto del botón para indicar edición
  saveProductButton.textContent = "Actualizar Producto";

  // Guardar el ID del producto que se está editando
  editingProductId = productId;

  // Abrir el modal
  openModal(document.getElementById("productFormModal"));
}

// Función para eliminar un producto
function deleteProduct(productId, event) {
  event.preventDefault();
  if (confirm(`¿Estás seguro de que deseas eliminar este producto?`)) {
    fetch(`${apiUrl}/${productId}`, {
      method: 'DELETE'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al eliminar el producto');
      }
      return response.json();
    })
    .then(() => {
      // Refrescar la lista de productos
      fetchProducts();
      // Eliminar el producto del carrito si está presente
      carritoItems = carritoItems.filter(item => item._id !== productId);
      renderCart();
    })
    .catch(error => console.error('Error al eliminar el producto:', error));
  }
}

// Función para adjuntar los event listeners iniciales
function attachEventListeners() {
  // Los event listeners ya están adjuntados en el código
}

// Funciones auxiliares
function toggleAccentColor() {
  webColor = `hsl(${Math.random() * 360}, 100%, 80%)`;
  setAccentColors(webColor);
  title.textContent = "Humildify " + getEmoji();
}

function getEmoji() {
  const emojis = ["🚀", "🌈", "🦄", "🌟", "🎉", "🎈", "🎊", "🔥", "💥", "🌲"];
  return emojis[Math.floor(Math.random() * emojis.length)];
}

function setAccentColors(color) {
  const elementsColor = Array.from(
    document.getElementsByClassName("accent-color")
  );
  const elementsBackground = Array.from(
    document.getElementsByClassName("accent-background")
  );
  const elementsShadow = Array.from(
    document.getElementsByClassName("accent-shadow")
  );

  elementsColor.forEach((element) => {
    element.style.color = color;
  });

  elementsBackground.forEach((element) => {
    element.style.backgroundColor = color;
  });

  elementsShadow.forEach((element) => {
    element.style.boxShadow = `0px 0px 20px -8px ${color}`;
  });

  elementsShadow.forEach((element) => {
    element.addEventListener("focus", () => {
      element.style.borderColor = color;
    });

    element.addEventListener("blur", () => {
      element.style.borderColor = "";
    });
  });
}

// Evento para cambiar el título y el color al hacer clic
title.addEventListener("click", function () {
  toggleAccentColor();
});
