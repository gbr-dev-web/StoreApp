import { updateCartTotal } from '../cart/cartTotal.js';
import { setupCartItemQuantityHandlers } from '../cart/quantityInput.js';
document.addEventListener('DOMContentLoaded', () => {
	const modal = document.getElementById('cartModal');
	const modalContent = document.getElementById('modalContent');
	const cartItemsContainer = document.getElementById('cartItems');

	// Função para abrir o modal
	async function openModal() {
        const success = await loadCartItems();
        if (!success) return;
   
		document.documentElement.classList.add('overflow-hidden');
		modal.classList.remove('opacity-0', 'invisible');
		modal.classList.add('opacity-100', 'visible');
		modalContent.classList.remove('translate-x-full', 'opacity-0');
		modalContent.classList.add('slide-in-right', 'opacity-100');
	}

	// Função para fechar o modal
	function closeModal() {
		document.documentElement.classList.remove('overflow-hidden');

		modalContent.classList.remove('slide-in-right', 'opacity-100');
		modalContent.classList.add('slide-out-right');

		setTimeout(() => {
			modal.classList.remove('opacity-100', 'visible');
			modal.classList.add('opacity-0', 'invisible');
			modalContent.classList.remove('slide-out-right');
			modalContent.classList.add('translate-x-full', 'opacity-0');
		}, 1000);
	}

	function setupRemoveItemHandlers() {
		document.querySelectorAll('.remove-item').forEach((button) => {
			button.addEventListener('click', async (event) => {
				const csrfToken = document
					.querySelector('meta[name="csrf-token"]')
					.getAttribute('content');
				const slug = event.target.getAttribute('data-slug');
				if (!slug) return;

				try {
					const response = await fetch(
						`http://localhost:8081/cart/removeFromCart/${slug}`,
						{
							method: 'DELETE',
							headers: {
								'Content-Type': 'application/json',
								'CSRF-token': csrfToken,
								'X-Requested-With': 'XMLHttpRequest'
							}
						}
					);

					if (response.ok) {
						await loadCartItems();
					}
				} catch (err) {
					console.error('Error making request ', err);
				}
			});
		});
	}

	// Função para carregar os itens do carrinho
	async function loadCartItems() {
        try {
            const res = await fetch('/cart/getUserCart');
            
            if (res.status !== 200) {
                const errorData = await res.json();
                const errorMsg = errorData.error || 'Server Error';
                
                console.log('Error loading cart items:', errorMsg);
                window.location.href = `/?errorMsg=${encodeURIComponent(errorMsg)}`;
                return false;
            }
            
            const html = await res.text();
            cartItemsContainer.innerHTML = html;
            setupCartItemQuantityHandlers(cartItemsContainer);
            updateCartTotal();
            setupRemoveItemHandlers();
            return true;
        } catch (err) {
           console.error('Error loading cart items:', err);
        }
    }

	async function checkout() {
		console.log('checkout');
		await fetch('/cart/checkout')
			.then((res) => res.text())
			.catch((err) => {
				console.error('Erro ao carregar carrinho:', err);
			});
	}

	document.getElementById('openModalIcon').addEventListener('click', openModal);

	modal.addEventListener('click', closeModal);
	// Impede que o clique dentro do conteúdo feche o modal
	modalContent.addEventListener('click', (event) => {
		event.stopPropagation();
	});
	// Adicionando o evento para fechar o modal
	document.getElementById('closeModal').addEventListener('click', closeModal);

	const checkoutButton = document.getElementById('checkoutButton');
	if (checkoutButton) {
		checkoutButton.addEventListener('click', checkout);
	}
});
