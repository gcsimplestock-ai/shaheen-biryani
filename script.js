const MENU = [
  { id: 'chicken-biryani', name: 'Chicken Biryani', category: 'Biryani', price: 420, emoji: '🍛', description: 'Aromatic basmati rice, tender chicken and fragrant spices.', featured: true },
  { id: 'special-biryani', name: 'Shaheen Special Biryani', category: 'Biryani', price: 520, emoji: '🍲', description: 'Our signature biryani with generous portions and bold flavour.', featured: true },
  { id: 'beef-biryani', name: 'Beef Biryani', category: 'Biryani', price: 480, emoji: '🍛', description: 'Tender beef layered with fragrant rice and traditional spices.', featured: false },
  { id: 'chicken-karahi', name: 'Chicken Karahi', category: 'Chicken', price: 850, emoji: '🍗', description: 'Classic tomato-based karahi with ginger, chilli and herbs.', featured: true },
  { id: 'chicken-tikka', name: 'Chicken Tikka', category: 'BBQ', price: 520, emoji: '🍢', description: 'Juicy, smoky chicken pieces seasoned for the grill.', featured: false },
  { id: 'seekh-kebab', name: 'Seekh Kebab', category: 'BBQ', price: 450, emoji: '🥙', description: 'Spiced minced-meat kebabs grilled until perfectly tender.', featured: false },
  { id: 'raita', name: 'Fresh Raita', category: 'Sides', price: 100, emoji: '🥣', description: 'Cool, creamy yoghurt with fresh herbs and seasoning.', featured: false },
  { id: 'fresh-salad', name: 'Fresh Salad', category: 'Sides', price: 120, emoji: '🥗', description: 'Crisp seasonal vegetables with a refreshing finish.', featured: false },
  { id: 'cold-drink', name: 'Cold Drink', category: 'Drinks', price: 100, emoji: '🥤', description: 'A chilled soft drink to complete your meal.', featured: false },
  { id: 'family-deal', name: 'Family Biryani Deal', category: 'Deals', price: 1450, emoji: '🍱', description: 'A generous family meal for sharing and enjoying together.', featured: true }
];

const DELIVERY = 150;
let cart = JSON.parse(localStorage.getItem('shaheen-cart') || '[]');
let activeCategory = 'All';

const money = value => `Rs ${Number(value).toLocaleString('en-PK')}`;
const saveCart = () => localStorage.setItem('shaheen-cart', JSON.stringify(cart));
const itemById = id => MENU.find(item => item.id === id);
const cartCount = () => cart.reduce((sum, line) => sum + line.qty, 0);
const subtotal = () => cart.reduce((sum, line) => { const item = itemById(line.id); return sum + (item ? item.price * line.qty : 0); }, 0);

function renderCategories() {
  const categories = ['All', ...new Set(MENU.map(item => item.category))];
  document.querySelector('#categories').innerHTML = categories.map(category => `<button class="category ${category === activeCategory ? 'active' : ''}" data-category="${category}">${category}</button>`).join('');
  document.querySelectorAll('.category').forEach(button => button.addEventListener('click', () => { activeCategory = button.dataset.category; renderCategories(); renderMenu(); }));
}

function renderMenu() {
  const query = document.querySelector('#search').value.trim().toLowerCase();
  const items = MENU.filter(item => (activeCategory === 'All' || item.category === activeCategory) && (!query || `${item.name} ${item.description} ${item.category}`.toLowerCase().includes(query)));
  const grid = document.querySelector('#menuGrid');
  if (!items.length) { grid.innerHTML = '<div class="empty-state"><h3>No dishes found</h3><p>Try another search or category.</p></div>'; return; }
  grid.innerHTML = items.map(item => `<article class="food-card"><div class="food-img"><span class="tag">${item.featured ? 'POPULAR' : item.category.toUpperCase()}</span><span aria-hidden="true">${item.emoji}</span></div><div class="food-body"><h3>${item.name}</h3><p>${item.description}</p><div class="food-bottom"><span class="price">${money(item.price)}</span><button class="add" data-add="${item.id}" aria-label="Add ${item.name} to cart">+</button></div></div></article>`).join('');
  document.querySelectorAll('[data-add]').forEach(button => button.addEventListener('click', () => addToCart(button.dataset.add)));
}

function addToCart(id) {
  const line = cart.find(item => item.id === id);
  if (line) line.qty += 1; else cart.push({ id, qty: 1 });
  saveCart(); renderCart(); openCart(); toast(`${itemById(id).name} added to cart`);
}

function changeQty(id, delta) {
  const line = cart.find(item => item.id === id);
  if (!line) return;
  line.qty += delta;
  if (line.qty <= 0) cart = cart.filter(item => item.id !== id);
  saveCart(); renderCart();
}

function renderCart() {
  document.querySelector('#cartCount').textContent = cartCount();
  const itemsEl = document.querySelector('#cartItems');
  if (!cart.length) itemsEl.innerHTML = '<div class="empty-cart"><div>🍛</div><h3>Your cart is empty</h3><p>Add something delicious from the menu.</p><a class="btn primary" href="#menu" id="emptyMenu">Browse Menu</a></div>';
  else itemsEl.innerHTML = cart.map(line => { const item = itemById(line.id); return `<div class="cart-item"><div class="cart-thumb" aria-hidden="true">${item.emoji}</div><div><h4>${item.name}</h4><p>${money(item.price)} · ${money(item.price * line.qty)}</p><div class="qty"><button data-dec="${item.id}" aria-label="Decrease ${item.name}">−</button><strong>${line.qty}</strong><button data-inc="${item.id}" aria-label="Increase ${item.name}">+</button></div></div><button class="remove" data-remove="${item.id}" aria-label="Remove ${item.name}">×</button></div>`; }).join('');
  const sub = subtotal();
  document.querySelector('#cartSubtotal').textContent = money(sub);
  document.querySelector('#cartDelivery').textContent = cart.length ? money(DELIVERY) : money(0);
  document.querySelector('#cartTotal').textContent = money(cart.length ? sub + DELIVERY : 0);
  document.querySelectorAll('[data-inc]').forEach(b => b.addEventListener('click', () => changeQty(b.dataset.inc, 1)));
  document.querySelectorAll('[data-dec]').forEach(b => b.addEventListener('click', () => changeQty(b.dataset.dec, -1)));
  document.querySelectorAll('[data-remove]').forEach(b => b.addEventListener('click', () => { cart = cart.filter(item => item.id !== b.dataset.remove); saveCart(); renderCart(); }));
  const emptyMenu = document.querySelector('#emptyMenu'); if (emptyMenu) emptyMenu.addEventListener('click', closeCart);
}

function openCart() { document.querySelector('#cartDrawer').classList.add('open'); document.querySelector('#overlay').classList.add('open'); document.querySelector('#cartDrawer').setAttribute('aria-hidden', 'false'); }
function closeCart() { document.querySelector('#cartDrawer').classList.remove('open'); document.querySelector('#overlay').classList.remove('open'); document.querySelector('#cartDrawer').setAttribute('aria-hidden', 'true'); }
function openCheckout() {
  if (!cart.length) { toast('Your cart is empty'); return; }
  closeCart(); renderCheckoutSummary(); document.querySelector('#checkout').classList.add('open'); document.querySelector('#checkout').setAttribute('aria-hidden', 'false');
}
function closeCheckout() { document.querySelector('#checkout').classList.remove('open'); document.querySelector('#checkout').setAttribute('aria-hidden', 'true'); }
function renderCheckoutSummary() {
  const sub = subtotal();
  document.querySelector('#checkoutSummary').innerHTML = `${cart.map(line => { const item = itemById(line.id); return `<div class="summary-line"><span>${item.name} × ${line.qty}</span><strong>${money(item.price * line.qty)}</strong></div>`; }).join('')}<div class="summary-line"><span>Subtotal</span><strong>${money(sub)}</strong></div><div class="summary-line"><span>Delivery</span><strong>${money(DELIVERY)}</strong></div><div class="summary-line"><strong>Total</strong><strong>${money(sub + DELIVERY)}</strong></div>`;
  document.querySelector('#checkoutTotal').textContent = money(sub + DELIVERY);
}

function toast(message) { const el = document.querySelector('#toast'); el.textContent = message; el.classList.add('show'); clearTimeout(window.__toast); window.__toast = setTimeout(() => el.classList.remove('show'), 2200); }

function generateOrderId() { return `SB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`; }

function submitCheckout(event) {
  event.preventDefault();
  if (!cart.length) return;
  const form = new FormData(event.target);
  const order = { id: generateOrderId(), name: form.get('name'), phone: form.get('phone'), address: form.get('address'), notes: form.get('notes'), items: cart.map(line => ({ ...line, item: itemById(line.id).name, price: itemById(line.id).price })), subtotal: subtotal(), delivery: DELIVERY, total: subtotal() + DELIVERY, payment: 'Cash on Delivery', status: 'Pending', createdAt: new Date().toISOString() };
  localStorage.setItem(`shaheen-order-${order.id}`, JSON.stringify(order));
  localStorage.setItem('shaheen-last-order', order.id);
  cart = []; saveCart(); renderCart();
  event.target.hidden = true;
  const confirmation = document.querySelector('#confirmation');
  confirmation.hidden = false;
  confirmation.innerHTML = `<div class="confirmation-icon">✓</div><span class="eyebrow">ORDER RECEIVED</span><h3>Thank you, ${order.name.split(' ')[0]}.</h3><p>Your order reference is <strong>${order.id}</strong>.</p><div class="confirmation-box"><span>Total</span><strong>${money(order.total)}</strong><span>Payment</span><strong>Cash on Delivery</strong><span>Status</span><strong>Pending</strong></div><p class="muted">This static GitHub Pages version stores the demo order in this browser only. Connect a real backend before accepting live restaurant orders.</p><button class="btn primary full" id="doneCheckout">Done</button>`;
  document.querySelector('#doneCheckout').addEventListener('click', () => { closeCheckout(); event.target.hidden = false; confirmation.hidden = true; event.target.reset(); });
}

document.querySelector('#search').addEventListener('input', renderMenu);
document.querySelector('#cartOpen').addEventListener('click', openCart);
document.querySelector('#cartClose').addEventListener('click', closeCart);
document.querySelector('#overlay').addEventListener('click', closeCart);
document.querySelector('#checkoutBtn').addEventListener('click', event => { event.preventDefault(); openCheckout(); });
document.querySelector('#checkoutClose').addEventListener('click', closeCheckout);
document.querySelector('#checkoutForm').addEventListener('submit', submitCheckout);
document.querySelector('#checkout').addEventListener('click', event => { if (event.target.id === 'checkout') closeCheckout(); });

document.querySelectorAll('a[href="#menu"]').forEach(link => link.addEventListener('click', closeCart));

renderCategories();
renderMenu();
renderCart();
