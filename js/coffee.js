// coffee.js
// Used by the buy me a coffee stuff
// Written: 2025-02-01

let selectedAmount = 5;
let selectedMethod = null;

function toggleExpand() {
    const container = document.querySelector('.donation-container');
    container.classList.toggle('expanded');
}

// Handle amount selection
document.querySelectorAll('.amount-btn').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.amount-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        button.classList.add('selected');
        selectedAmount = parseInt(button.dataset.amount);
        document.querySelector('.donate-btn').textContent = `Donate $${selectedAmount}`;
    });
});

// Handle payment method selection
document.querySelectorAll('.payment-btn').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.payment-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        button.classList.add('selected');
        selectedMethod = button.dataset.method;
    });
});

function handleDonate() {
    if (!selectedMethod) {
        alert('Please select a payment method');
        return;
    }
    
    const selectedButton = document.querySelector(`.payment-btn[data-method="${selectedMethod}"]`);
    const link = selectedButton.dataset.link;
    window.open(link, '_blank');  // Just open the base URL
}
