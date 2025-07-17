// Beer Calculator JavaScript

class BeerCalculator {
    constructor() {
        this.beers = [];
        this.total = 0;
        this.beerCount = 0;
        
        // Get DOM elements
        this.beerPriceInput = document.getElementById('beerPrice');
        this.addBeerBtn = document.getElementById('addBeer');
        this.resetBtn = document.getElementById('resetBtn');
        this.removeLastBtn = document.getElementById('removeLastBtn');
        this.beerCountDisplay = document.getElementById('beerCount');
        this.totalAmountDisplay = document.getElementById('totalAmount');
        this.beerListContainer = document.getElementById('beerList');
        
        // Initialize event listeners
        this.initEventListeners();
        
        // Focus on price input when page loads
        this.beerPriceInput.focus();
    }
    
    initEventListeners() {
        // Add beer button click
        this.addBeerBtn.addEventListener('click', () => this.addBeer());
        
        // Enter key in price input
        this.beerPriceInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addBeer();
            }
        });
        
        // Reset button
        this.resetBtn.addEventListener('click', () => this.resetCalculator());
        
        // Remove last beer button
        this.removeLastBtn.addEventListener('click', () => this.removeLastBeer());
        
        // Auto-format price input for Czech crowns
        this.beerPriceInput.addEventListener('input', (e) => {
            // Allow only whole numbers for Czech crowns
            let value = e.target.value;
            if (value && !isNaN(value)) {
                // Round to whole numbers (Czech crowns typically don't use decimals)
                e.target.value = Math.round(parseFloat(value));
            }
        });
    }
    
    addBeer() {
        const priceInput = this.beerPriceInput.value;
        let price = parseFloat(priceInput);
        
        // If no price entered, use the last beer's price
        if (isNaN(price) || priceInput === '') {
            if (this.beers.length > 0) {
                price = this.beers[this.beers.length - 1];
                this.showSuccess(`Using last beer price: ${Math.round(price)} Kč`);
            } else {
                this.showError('Please enter a beer price for your first beer!');
                this.beerPriceInput.focus();
                return;
            }
        }
        
        // Validate price
        if (price <= 0) {
            this.showError('Please enter a valid beer price!');
            this.beerPriceInput.focus();
            return;
        }
        
        // Add beer to array
        this.beers.push(price);
        this.beerCount++;
        this.total += price;
        
        // Update displays
        this.updateDisplay();
        this.addBeerToList(price, this.beerCount);
        
        // Clear input and refocus
        this.beerPriceInput.value = '';
        this.beerPriceInput.focus();
        
        // Add success animation
        this.addSuccessAnimation();
    }
    
    removeLastBeer() {
        if (this.beers.length === 0) {
            this.showError('No beers to remove!');
            return;
        }
        
        // Remove last beer
        const removedPrice = this.beers.pop();
        this.beerCount--;
        this.total -= removedPrice;
        
        // Update displays
        this.updateDisplay();
        this.removeBeerFromList();
    }
    
    resetCalculator() {
        this.beers = [];
        this.total = 0;
        this.beerCount = 0;
        
        this.updateDisplay();
        this.clearBeerList();
        this.beerPriceInput.value = '';
        this.beerPriceInput.focus();
        
        this.showSuccess('Calculator reset!');
    }
    
    updateDisplay() {
        this.beerCountDisplay.textContent = this.beerCount;
        this.totalAmountDisplay.textContent = Math.round(this.total);
        
        // Update remove button state
        this.removeLastBtn.disabled = this.beers.length === 0;
        this.removeLastBtn.style.opacity = this.beers.length === 0 ? '0.5' : '1';
    }
    
    addBeerToList(price, beerNumber) {
        const beerEntry = document.createElement('div');
        beerEntry.className = 'beer-entry';
        beerEntry.innerHTML = `
            <span class="beer-number">🍺 Beer #${beerNumber}</span>
            <span class="beer-price">${Math.round(price)} Kč</span>
        `;
        
        this.beerListContainer.appendChild(beerEntry);
        
        // Scroll to bottom if list is long
        this.beerListContainer.scrollTop = this.beerListContainer.scrollHeight;
    }
    
    removeBeerFromList() {
        const lastEntry = this.beerListContainer.lastElementChild;
        if (lastEntry) {
            lastEntry.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                this.beerListContainer.removeChild(lastEntry);
            }, 300);
        }
    }
    
    clearBeerList() {
        this.beerListContainer.innerHTML = '';
    }
    
    addSuccessAnimation() {
        const addBtn = this.addBeerBtn;
        addBtn.style.transform = 'scale(0.95)';
        addBtn.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
        
        setTimeout(() => {
            addBtn.style.transform = 'scale(1)';
            addBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        }, 150);
    }
    
    showError(message) {
        this.showNotification(message, 'error');
    }
    
    showSuccess(message) {
        this.showNotification(message, 'success');
    }
    
    showNotification(message, type) {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 24px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            animation: slideDown 0.3s ease;
            ${type === 'error' ? 'background: #ff6b6b;' : 'background: #4CAF50;'}
        `;
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideUp 0.3s ease';
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, 3000);
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    
    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
    }
    
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(-20px);
        }
    }
`;
document.head.appendChild(style);

// Initialize the calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BeerCalculator();
});

// Add some fun features
document.addEventListener('DOMContentLoaded', () => {
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + R for reset
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            document.getElementById('resetBtn').click();
        }
        
        // Ctrl/Cmd + Z for remove last
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault();
            document.getElementById('removeLastBtn').click();
        }
    });
    
    // Add some celebratory effects for milestones
    const originalAddBeer = BeerCalculator.prototype.addBeer;
    BeerCalculator.prototype.addBeer = function() {
        originalAddBeer.call(this);
        
        // Celebration for milestones
        if (this.beerCount > 0 && this.beerCount % 5 === 0) {
            this.showSuccess(`🎉 ${this.beerCount} beers! You're having a great time!`);
        }
    };
}); 