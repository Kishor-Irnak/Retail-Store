// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCDseTCM-C2JDRsOuKb129UMWN-V2n2VvU",
    authDomain: "nexus-10d33.firebaseapp.com",
    databaseURL: "https://nexus-10d33-default-rtdb.firebaseio.com",
    projectId: "nexus-10d33",
    storageBucket: "nexus-10d33.firebasestorage.app",
    messagingSenderId: "893339315389",
    appId: "1:893339315389:web:0b74a2e774968ca9675bd4",
    measurementId: "G-JXSC97HPBS"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// DOM Elements
const ownerTab = document.getElementById('ownerTab');
const customerTab = document.getElementById('customerTab');
const ownerView = document.getElementById('ownerView');
const customerView = document.getElementById('customerView');

// Customer Management
const addCustomerForm = document.getElementById('addCustomerForm');
const customerName = document.getElementById('customerName');
const customerMobile = document.getElementById('customerMobile');
const customerAddress = document.getElementById('customerAddress');
const customerList = document.getElementById('customerList');
const searchCustomer = document.getElementById('searchCustomer');
const saleCustomer = document.getElementById('saleCustomer');

// Sales Management
const salesForm = document.getElementById('salesForm');
const itemsContainer = document.getElementById('itemsContainer');
const addItemBtn = document.getElementById('addItemBtn');
const saleTotal = document.getElementById('saleTotal');
const salesList = document.getElementById('salesList');
const salesFilter = document.getElementById('salesFilter');
const searchSales = document.getElementById('searchSales');

// Customer View
const customerLoginForm = document.getElementById('customerLoginForm');
const customerLoginMobile = document.getElementById('customerLoginMobile');
const customerDetails = document.getElementById('customerDetails');
const custDetailName = document.getElementById('custDetailName');
const custDetailMobile = document.getElementById('custDetailMobile');
const custDetailAddress = document.getElementById('custDetailAddress');
const custTotalPending = document.getElementById('custTotalPending');
const custSalesList = document.getElementById('custSalesList');

// Modals
const editCustomerModal = document.getElementById('editCustomerModal');
const editCustomerForm = document.getElementById('editCustomerForm');
const editCustomerId = document.getElementById('editCustomerId');
const editCustomerName = document.getElementById('editCustomerName');
const editCustomerMobile = document.getElementById('editCustomerMobile');
const editCustomerAddress = document.getElementById('editCustomerAddress');
const cancelEditCustomer = document.getElementById('cancelEditCustomer');

const paymentModal = document.getElementById('paymentModal');
const paymentForm = document.getElementById('paymentForm');
const paymentSaleId = document.getElementById('paymentSaleId');
const paymentCustomerName = document.getElementById('paymentCustomerName');
const paymentSaleAmount = document.getElementById('paymentSaleAmount');
const paymentAmount = document.getElementById('paymentAmount');
const paymentDate = document.getElementById('paymentDate');
const cancelPayment = document.getElementById('cancelPayment');

// Product Management
const addProductForm = document.getElementById('addProductForm');
const productName = document.getElementById('productName');
const productPrice = document.getElementById('productPrice');
const productList = document.getElementById('productList');
const searchProduct = document.getElementById('searchProduct');
const editProductModal = document.getElementById('editProductModal');
const editProductForm = document.getElementById('editProductForm');
const editProductId = document.getElementById('editProductId');
const editProductName = document.getElementById('editProductName');
const editProductPrice = document.getElementById('editProductPrice');
const cancelEditProduct = document.getElementById('cancelEditProduct');

// Global Variables
let customers = [];
let sales = [];
let products = [];

document.addEventListener('DOMContentLoaded', () => {
    // Set today's date as default for payment date
    paymentDate.valueAsDate = new Date();
    
    // Load initial data - products first since sales form needs them
    loadProducts();
    loadCustomers();
    loadSales();
    
    // Add first item row
    addItemRow();
});

// Tab Switching
ownerTab.addEventListener('click', () => {
    ownerTab.classList.add('text-blue-600', 'border-blue-600');
    ownerTab.classList.remove('text-gray-500');
    customerTab.classList.add('text-gray-500');
    customerTab.classList.remove('text-blue-600', 'border-blue-600');
    ownerView.classList.remove('hidden');
    customerView.classList.add('hidden');
});

customerTab.addEventListener('click', () => {
    customerTab.classList.add('text-blue-600', 'border-blue-600');
    customerTab.classList.remove('text-gray-500');
    ownerTab.classList.add('text-gray-500');
    ownerTab.classList.remove('text-blue-600', 'border-blue-600');
    customerView.classList.remove('hidden');
    ownerView.classList.add('hidden');
});

// Customer Management
addCustomerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = customerName.value.trim();
    const mobile = customerMobile.value.trim();
    const address = customerAddress.value.trim();
    
    if (name && mobile) {
        // Check if customer already exists
        const existingCustomer = customers.find(c => c.mobile === mobile);
        if (existingCustomer) {
            alert('Customer with this mobile number already exists!');
            return;
        }
        
        // Generate a unique ID
        const customerId = database.ref().child('customers').push().key;
        
        const customerData = {
            id: customerId,
            name,
            mobile,
            address,
            createdAt: firebase.database.ServerValue.TIMESTAMP
        };
        
        // Save to Firebase
        database.ref('customers/' + customerId).set(customerData)
            .then(() => {
                alert('Customer added successfully!');
                addCustomerForm.reset();
                loadCustomers();
            })
            .catch(error => {
                console.error('Error adding customer:', error);
                alert('Error adding customer. Please try again.');
            });
    }
});

// Edit Customer
function openEditCustomerModal(customer) {
    editCustomerId.value = customer.id;
    editCustomerName.value = customer.name;
    editCustomerMobile.value = customer.mobile;
    editCustomerAddress.value = customer.address || '';
    editCustomerModal.classList.remove('hidden');
}

editCustomerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const customerId = editCustomerId.value;
    const name = editCustomerName.value.trim();
    const mobile = editCustomerMobile.value.trim();
    const address = editCustomerAddress.value.trim();
    
    if (customerId && name && mobile) {
        const updates = {
            name,
            mobile,
            address
        };
        
        database.ref('customers/' + customerId).update(updates)
            .then(() => {
                alert('Customer updated successfully!');
                editCustomerModal.classList.add('hidden');
                loadCustomers();
            })
            .catch(error => {
                console.error('Error updating customer:', error);
                alert('Error updating customer. Please try again.');
            });
    }
});

cancelEditCustomer.addEventListener('click', () => {
    editCustomerModal.classList.add('hidden');
});

// Delete Customer
function deleteCustomer(customerId) {
    if (confirm('Are you sure you want to delete this customer? This will also delete all their sales records.')) {
        // First check if customer has any sales
        const customerSales = sales.filter(s => s.customerId === customerId);
        if (customerSales.length > 0) {
            alert('This customer has sales records. Please delete the sales first.');
            return;
        }
        
        database.ref('customers/' + customerId).remove()
            .then(() => {
                alert('Customer deleted successfully!');
                loadCustomers();
            })
            .catch(error => {
                console.error('Error deleting customer:', error);
                alert('Error deleting customer. Please try again.');
            });
    }
}

// Load Customers
function loadCustomers() {
    database.ref('customers').on('value', (snapshot) => {
        customers = [];
        snapshot.forEach(childSnapshot => {
            customers.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });
        
        // Sort by name
        customers.sort((a, b) => a.name.localeCompare(b.name));
        
        // Update customer list
        renderCustomerList();
        renderCustomerDropdown();
    });
}

function renderCustomerList() {
    customerList.innerHTML = '';
    
    let filteredCustomers = [...customers];
    const searchTerm = searchCustomer.value.toLowerCase();
    
    if (searchTerm) {
        filteredCustomers = filteredCustomers.filter(c => 
            c.name.toLowerCase().includes(searchTerm) || 
            c.mobile.includes(searchTerm)
        );
    }
    
    if (filteredCustomers.length === 0) {
        customerList.innerHTML = '<tr><td colspan="3" class="px-2 py-4 text-center text-gray-500">No customers found</td></tr>';
        return;
    }
    
    filteredCustomers.forEach(customer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-2 py-2 text-sm">${customer.name}</td>
            <td class="px-2 py-2 text-sm">${customer.mobile}</td>
            <td class="px-2 py-2 text-sm">
                <button class="edit-customer text-blue-500 hover:text-blue-700 mr-2" data-id="${customer.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-customer text-red-500 hover:text-red-700" data-id="${customer.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        customerList.appendChild(row);
    });
    
    // Add event listeners to edit/delete buttons
    document.querySelectorAll('.edit-customer').forEach(btn => {
        btn.addEventListener('click', () => {
            const customerId = btn.getAttribute('data-id');
            const customer = customers.find(c => c.id === customerId);
            if (customer) openEditCustomerModal(customer);
        });
    });
    
    document.querySelectorAll('.delete-customer').forEach(btn => {
        btn.addEventListener('click', () => {
            const customerId = btn.getAttribute('data-id');
            deleteCustomer(customerId);
        });
    });
}

function renderCustomerDropdown() {
    saleCustomer.innerHTML = '<option value="">-- Select Customer --</option>';
    
    customers.forEach(customer => {
        const option = document.createElement('option');
        option.value = customer.id;
        option.textContent = `${customer.name} (${customer.mobile})`;
        saleCustomer.appendChild(option);
    });
}

searchCustomer.addEventListener('input', renderCustomerList);

// Product Management Functions
function loadProducts() {
    database.ref('products').on('value', (snapshot) => {
        products = [];
        snapshot.forEach(childSnapshot => {
            products.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });
        
        // Sort by name
        products.sort((a, b) => a.name.localeCompare(b.name));
        
        // Update product list
        renderProductList();
        
        // Update product dropdowns in all item rows
        updateProductDropdowns();
    });
}

function updateProductDropdowns() {
    const productOptions = products.map(p => 
        `<option value="${p.id}">${p.name} (₹${p.price.toFixed(2)})</option>`
    ).join('');
    
    document.querySelectorAll('.item-product').forEach(select => {
        const currentValue = select.value;
        select.innerHTML = '<option value="">-- Select Product --</option>' + productOptions;
        select.value = currentValue; // Restore the selected value
        
        // If the selected product was deleted, show the custom input
        if (currentValue && !products.some(p => p.id === currentValue)) {
            select.value = '';
            const row = select.closest('.item-row');
            const nameInput = row.querySelector('.item-name');
            nameInput.classList.remove('hidden');
        }
    });
}

function renderProductList() {
    productList.innerHTML = '';
    
    let filteredProducts = [...products];
    const searchTerm = searchProduct.value.toLowerCase();
    
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(searchTerm)
        );
    }
    
    if (filteredProducts.length === 0) {
        productList.innerHTML = '<tr><td colspan="3" class="px-2 py-4 text-center text-gray-500">No products found</td></tr>';
        return;
    }
    
    filteredProducts.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-2 py-2 text-sm">${product.name}</td>
            <td class="px-2 py-2 text-sm">₹${product.price.toFixed(2)}</td>
            <td class="px-2 py-2 text-sm">
                <button class="edit-product text-blue-500 hover:text-blue-700 mr-2" data-id="${product.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-product text-red-500 hover:text-red-700" data-id="${product.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        productList.appendChild(row);
    });
    
    // Add event listeners to edit/delete buttons
    document.querySelectorAll('.edit-product').forEach(btn => {
        btn.addEventListener('click', () => {
            const productId = btn.getAttribute('data-id');
            const product = products.find(p => p.id === productId);
            if (product) openEditProductModal(product);
        });
    });
    
    document.querySelectorAll('.delete-product').forEach(btn => {
        btn.addEventListener('click', () => {
            const productId = btn.getAttribute('data-id');
            deleteProduct(productId);
        });
    });
}

function openEditProductModal(product) {
    editProductId.value = product.id;
    editProductName.value = product.name;
    editProductPrice.value = product.price;
    editProductModal.classList.remove('hidden');
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        // First check if product is used in any sales
        const productUsed = sales.some(sale => 
            sale.items.some(item => item.productId === productId)
        );
        
        if (productUsed) {
            alert('This product is used in sales records and cannot be deleted.');
            return;
        }
        
        database.ref('products/' + productId).remove()
            .then(() => {
                alert('Product deleted successfully!');
                loadProducts();
            })
            .catch(error => {
                console.error('Error deleting product:', error);
                alert('Error deleting product. Please try again.');
            });
    }
}

// Initialize product management
addProductForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = productName.value.trim();
    const price = parseFloat(productPrice.value);
    
    if (name && !isNaN(price)) {
        // Check if product already exists
        const existingProduct = products.find(p => p.name.toLowerCase() === name.toLowerCase());
        if (existingProduct) {
            alert('Product with this name already exists!');
            return;
        }
        
        // Generate a unique ID
        const productId = database.ref().child('products').push().key;
        
        const productData = {
            id: productId,
            name,
            price,
            createdAt: firebase.database.ServerValue.TIMESTAMP
        };
        
        // Save to Firebase
        database.ref('products/' + productId).set(productData)
            .then(() => {
                alert('Product added successfully!');
                addProductForm.reset();
                loadProducts();
            })
            .catch(error => {
                console.error('Error adding product:', error);
                alert('Error adding product. Please try again.');
            });
    }
});

editProductForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const productId = editProductId.value;
    const name = editProductName.value.trim();
    const price = parseFloat(editProductPrice.value);
    
    if (productId && name && !isNaN(price)) {
        const updates = {
            name,
            price
        };
        
        database.ref('products/' + productId).update(updates)
            .then(() => {
                alert('Product updated successfully!');
                editProductModal.classList.add('hidden');
                loadProducts();
            })
            .catch(error => {
                console.error('Error updating product:', error);
                alert('Error updating product. Please try again.');
            });
    }
});

cancelEditProduct.addEventListener('click', () => {
    editProductModal.classList.add('hidden');
});

searchProduct.addEventListener('input', renderProductList);

// Sales Management
function addItemRow(product = null) {
    const row = document.createElement('div');
    row.className = 'item-row grid grid-cols-12 gap-2 mb-2';
    row.innerHTML = `
        <div class="col-span-5">
            <select class="item-product w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500">
                <option value="">-- Select Product --</option>
                ${products.map(p => `<option value="${p.id}" ${product?.id === p.id ? 'selected' : ''}>${p.name} (₹${p.price.toFixed(2)})</option>`).join('')}
            </select>
            <input type="text" placeholder="Enter custom item" class="p-2 item-name mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${product ? 'hidden' : ''}">
        </div>
        <div class="col-span-2">
            <input type="number" placeholder="Qty" min="1" value="${product ? '1' : ''}" class="item-qty p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
        </div>
        <div class="col-span-3">
            <input type="number" placeholder="Price" min="0" step="0.01" value="${product ? product.price.toFixed(2) : ''}" class="p-2 item-price w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
        </div>
        <div class="col-span-2 flex items-center">
            <button type="button" class="remove-item text-red-500 hover:text-red-700">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    itemsContainer.appendChild(row);
    
    // Add event listener to product selection change
    const productSelect = row.querySelector('.item-product');
    const itemNameInput = row.querySelector('.item-name');
    const itemPriceInput = row.querySelector('.item-price');
    
    productSelect.addEventListener('change', (e) => {
        const productId = e.target.value;
        const selectedProduct = products.find(p => p.id === productId);
        
        if (selectedProduct) {
            itemNameInput.value = selectedProduct.name;
            itemNameInput.classList.add('hidden');
            itemPriceInput.value = selectedProduct.price.toFixed(2);
        } else {
            itemNameInput.value = '';
            itemNameInput.classList.remove('hidden');
            itemPriceInput.value = '';
        }
    });
    
    // Add event listener to remove button
    const removeBtn = row.querySelector('.remove-item');
    removeBtn.addEventListener('click', () => {
        if (itemsContainer.querySelectorAll('.item-row').length > 1) {
            row.remove();
            calculateTotal();
        } else {
            alert('At least one item is required');
        }
    });
    
    // Add event listeners to calculate total when values change
    const qtyInput = row.querySelector('.item-qty');
    qtyInput.addEventListener('input', calculateTotal);
    itemPriceInput.addEventListener('input', calculateTotal);
}

addItemBtn.addEventListener('click', addItemRow);

// Add after addItemBtn event listener
const addMultipleBtn = document.createElement('button');
addMultipleBtn.type = 'button';
addMultipleBtn.textContent = 'Add Items';
addMultipleBtn.className = 'bg-blue-500 text-white px-4 py-2 rounded ml-2 hover:bg-blue-700';
addItemBtn.parentNode.insertBefore(addMultipleBtn, addItemBtn.nextSibling);

addMultipleBtn.addEventListener('click', () => {
    for (let i = 0; i < 1; i++) addItemRow();
});

function calculateTotal() {
    let total = 0;
    
    document.querySelectorAll('.item-row').forEach(row => {
        const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        total += qty * price;
    });
    
    saleTotal.textContent = total.toFixed(2);
}

// FIX: Only ONE salesForm submit handler!
salesForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const customerId = saleCustomer.value;
    if (!customerId) {
        alert('Please select a customer');
        return;
    }
    
    const items = [];
    let isValid = true;
    
    document.querySelectorAll('.item-row').forEach(row => {
        const productSelect = row.querySelector('.item-product');
        const productId = productSelect.value;
        const name = productId ?
            products.find(p => p.id === productId)?.name :
            row.querySelector('.item-name').value.trim();
        const qty = parseFloat(row.querySelector('.item-qty').value);
        const price = parseFloat(row.querySelector('.item-price').value);

        if (!name || isNaN(qty) || isNaN(price)) {
            isValid = false;
            return;
        }

        items.push({
            productId: productId || null,
            name,
            qty,
            price,
            total: qty * price
        });
    });

    if (!isValid || items.length === 0) {
        alert('Please fill all item details correctly');
        return;
    }

    const totalAmount = items.reduce((sum, item) => sum + item.total, 0);
    const saleId = database.ref().child('sales').push().key;

    const saleData = {
        id: saleId,
        customerId,
        items,
        payments: {},
        totalAmount,
        status: 'pending',
        createdAt: firebase.database.ServerValue.TIMESTAMP
    };

    database.ref('sales/' + saleId).set(saleData)
        .then(() => {
            alert('Sale recorded successfully!');
            salesForm.reset();
            itemsContainer.innerHTML = '';
            addItemRow();
            saleTotal.textContent = '0.00';
            loadSales();
        })
        .catch(error => {
            console.error('Error recording sale:', error);
            alert('Error recording sale. Please try again.');
        });
});

function loadSales() {
    database.ref('sales').on('value', (snapshot) => {
        sales = [];
        snapshot.forEach(childSnapshot => {
            const saleData = childSnapshot.val();
            
            // Ensure payments exists as an array
            const payments = saleData.payments ? Object.values(saleData.payments) : [];
            
            // Ensure items exists as an array
            const items = saleData.items || [];
            
            const sale = {
                id: childSnapshot.key,
                ...saleData,
                items: items,
                payments: payments,
                paidAmount: payments.reduce((sum, payment) => sum + (payment.amount || 0), 0),
                totalAmount: saleData.totalAmount || 0
            };
            
            sale.pendingAmount = sale.totalAmount - sale.paidAmount;
            sale.status = sale.pendingAmount <= 0 ? 'paid' : 'pending';
            
            sales.push(sale);
        });
        
        // Sort by date (newest first)
        sales.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        
        // Update sales list
        renderSalesList();
    });
}

paymentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const saleId = paymentSaleId.value;
    const amount = parseFloat(paymentAmount.value);
    const date = paymentDate.value;
    
    if (!saleId || isNaN(amount) || amount <= 0 || !date) {
        alert('Please enter valid payment details');
        return;
    }
    
    const sale = sales.find(s => s.id === saleId);
    if (!sale) {
        alert('Sale not found');
        return;
    }
    
    if (amount > sale.pendingAmount) {
        alert('Payment amount cannot be more than pending amount');
        return;
    }
    
    const payment = {
        amount,
        date,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };
    
    // Add payment to sale
    database.ref('sales/' + saleId + '/payments').push(payment)
        .then(() => {
            alert('Payment recorded successfully!');
            paymentModal.classList.add('hidden');
            loadSales();
        })
        .catch(error => {
            console.error('Error recording payment:', error);
            alert('Error recording payment. Please try again.');
        });
});

cancelPayment.addEventListener('click', () => {
    paymentModal.classList.add('hidden');
});

function renderSalesList() {
    salesList.innerHTML = '';
    
    let filteredSales = [...sales];
    const filter = salesFilter.value;
    const searchTerm = searchSales.value.toLowerCase();
    
    // Apply filter
    if (filter === 'pending') {
        filteredSales = filteredSales.filter(s => s.status === 'pending');
    } else if (filter === 'paid') {
        filteredSales = filteredSales.filter(s => s.status === 'paid');
    }
    
    // Apply search
    if (searchTerm) {
        filteredSales = filteredSales.filter(s => {
            const customer = customers.find(c => c.id === s.customerId);
            return customer && customer.name.toLowerCase().includes(searchTerm);
        });
    }
    
    if (filteredSales.length === 0) {
        salesList.innerHTML = '<tr><td colspan="6" class="px-4 py-4 text-center text-gray-500">No sales found</td></tr>';
        return;
    }
    
    filteredSales.forEach(sale => {
        const customer = customers.find(c => c.id === sale.customerId);
        const customerName = customer ? customer.name : 'Unknown';
        
        // Format date
        const date = new Date(sale.createdAt);
        const dateStr = date.toLocaleDateString();
        
        // Format items
        const itemsStr = sale.items.map(item => `${item.name} (${item.qty} x ₹${item.price.toFixed(2)})`).join(', ');
        
        // Status badge
        const statusClass = sale.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
        const statusText = sale.status === 'paid' ? 'Paid' : `Pending (₹${sale.pendingAmount.toFixed(2)})`;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-4 py-2 text-sm">${dateStr}</td>
            <td class="px-4 py-2 text-sm">${customerName}</td>
            <td class="px-4 py-2 text-sm">${itemsStr}</td>
            <td class="px-4 py-2 text-sm">₹${sale.totalAmount.toFixed(2)}</td>
            <td class="px-4 py-2 text-sm">
                <span class="px-2 py-1 rounded-full text-xs ${statusClass}">${statusText}</span>
            </td>
            <td class="px-4 py-2 text-sm">
                ${sale.status === 'pending' ? `
                <button class="record-payment text-blue-500 hover:text-blue-700 mr-2" data-id="${sale.id}">
                    <i class="fas fa-rupee-sign"></i>
                </button>
                ` : ''}
                <button class="view-sale text-gray-500 hover:text-gray-700" data-id="${sale.id}">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        salesList.appendChild(row);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.record-payment').forEach(btn => {
        btn.addEventListener('click', () => {
            const saleId = btn.getAttribute('data-id');
            const sale = sales.find(s => s.id === saleId);
            if (sale) openPaymentModal(sale);
        });
    });
    
    document.querySelectorAll('.view-sale').forEach(btn => {
        btn.addEventListener('click', () => {
            const saleId = btn.getAttribute('data-id');
            const sale = sales.find(s => s.id === saleId);
            if (sale) viewSaleDetails(sale);
        });
    });
}

salesFilter.addEventListener('change', renderSalesList);
searchSales.addEventListener('input', renderSalesList);

function openPaymentModal(sale) {
    const customer = customers.find(c => c.id === sale.customerId);
    
    paymentSaleId.value = sale.id;
    paymentCustomerName.textContent = customer ? customer.name : 'Unknown';
    paymentSaleAmount.textContent = `₹${sale.totalAmount.toFixed(2)} (Pending: ₹${sale.pendingAmount.toFixed(2)})`;
    paymentAmount.value = sale.pendingAmount.toFixed(2);
    paymentAmount.max = sale.pendingAmount;
    paymentModal.classList.remove('hidden');
}

function viewSaleDetails(sale) {
    const customer = customers.find(c => c.id === sale.customerId);
    let details = `
        <h4 class="font-medium mb-2">Sale Details</h4>
        <p><strong>Date:</strong> ${new Date(sale.createdAt).toLocaleString()}</p>
        <p><strong>Customer:</strong> ${customer ? customer.name : 'Unknown'}</p>
        <p><strong>Total Amount:</strong> ₹${sale.totalAmount.toFixed(2)}</p>
        <p><strong>Status:</strong> ${sale.status === 'paid' ? 'Paid' : 'Pending (₹' + sale.pendingAmount.toFixed(2) + ')'}</p>
        <h4 class="font-medium mt-4 mb-2">Items</h4>
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-2 py-1 text-left text-xs font-medium text-gray-500">Item</th>
                    <th class="px-2 py-1 text-left text-xs font-medium text-gray-500">Qty</th>
                    <th class="px-2 py-1 text-left text-xs font-medium text-gray-500">Price</th>
                    <th class="px-2 py-1 text-left text-xs font-medium text-gray-500">Total</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    sale.items.forEach(item => {
        details += `
            <tr>
                <td class="px-2 py-1 text-sm">${item.name}</td>
                <td class="px-2 py-1 text-sm">${item.qty}</td>
                <td class="px-2 py-1 text-sm">₹${item.price.toFixed(2)}</td>
                <td class="px-2 py-1 text-sm">₹${item.total.toFixed(2)}</td>
            </tr>
        `;
    });
    
    details += `
            </tbody>
        </table>
    `;
    
    if (sale.payments && sale.payments.length > 0) {
        details += `
            <h4 class="font-medium mt-4 mb-2">Payments</h4>
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-2 py-1 text-left text-xs font-medium text-gray-500">Date</th>
                        <th class="px-2 py-1 text-left text-xs font-medium text-gray-500">Amount</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        sale.payments.forEach(payment => {
            details += `
                <tr>
                    <td class="px-2 py-1 text-sm">${payment.date}</td>
                    <td class="px-2 py-1 text-sm">₹${payment.amount.toFixed(2)}</td>
                </tr>
            `;
        });
        
        details += `
                </tbody>
            </table>
        `;
    }
    
    alert(details, 'Sale Details');
}

function alert(message, title = 'Alert') {
    const alertBox = document.createElement('div');
    alertBox.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    alertBox.innerHTML = `
        <div class="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 class="text-lg font-medium mb-4">${title}</h3>
            <div class="mb-4">${message}</div>
            <div class="flex justify-end">
                <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">OK</button>
            </div>
        </div>
    `;
    document.body.appendChild(alertBox);
    const okBtn = alertBox.querySelector('button');
    okBtn.addEventListener('click', () => {
        document.body.removeChild(alertBox);
    });
}

// Customer View
customerLoginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const mobile = customerLoginMobile.value.trim();
    if (!mobile) {
        alert('Please enter your mobile number');
        return;
    }
    
    const customer = customers.find(c => c.mobile === mobile);
    if (!customer) {
        alert('No customer found with this mobile number');
        return;
    }
    
    // Show customer details
    custDetailName.textContent = customer.name;
    custDetailMobile.textContent = customer.mobile;
    custDetailAddress.textContent = customer.address || 'N/A';
    
    // Filter sales for this customer
    const customerSales = sales.filter(s => s.customerId === customer.id);
    
    // Calculate total pending
    const totalPending = customerSales.reduce((sum, sale) => sum + (sale.status === 'pending' ? sale.pendingAmount : 0), 0);
    custTotalPending.textContent = totalPending.toFixed(2);
    
    // Render sales list
    custSalesList.innerHTML = '';
    
    if (customerSales.length === 0) {
        custSalesList.innerHTML = '<tr><td colspan="4" class="px-2 py-4 text-center text-gray-500">No purchases found</td></tr>';
    } else {
        customerSales.forEach(sale => {
            // Format date
            const date = new Date(sale.createdAt);
            const dateStr = date.toLocaleDateString();
            
            // Format items (show first item + count)
            const firstItem = sale.items[0].name;
            const itemCount = sale.items.length > 1 ? ` +${sale.items.length - 1} more` : '';
            
            // Status
            const statusText = sale.status === 'paid' ? 'Paid' : `Pending (₹${sale.pendingAmount.toFixed(2)})`;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-2 py-2 text-sm">${dateStr}</td>
                <td class="px-2 py-2 text-sm">${firstItem}${itemCount}</td>
                <td class="px-2 py-2 text-sm">₹${sale.totalAmount.toFixed(2)}</td>
                <td class="px-2 py-2 text-sm">${statusText}</td>
            `;
            custSalesList.appendChild(row);
        });
    }
    
    customerDetails.classList.remove('hidden');
});
