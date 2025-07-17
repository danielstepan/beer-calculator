// Pub Expense Tracker JavaScript

class PubExpenseTracker {
    constructor() {
        this.items = [];
        this.total = 0;
        this.itemCount = 0;
        
        // Get DOM elements
        this.itemTypeSelect = document.getElementById('itemType');
        this.itemPriceInput = document.getElementById('itemPrice');
        this.addItemBtn = document.getElementById('addItem');
        this.resetBtn = document.getElementById('resetBtn');
        this.removeLastBtn = document.getElementById('removeLastBtn');
        this.itemCountDisplay = document.getElementById('itemCount');
        this.totalAmountDisplay = document.getElementById('totalAmount');
        this.itemListContainer = document.getElementById('itemList');
        
        // Initialize event listeners
        this.initEventListeners();
        
        // Initialize placeholder
        this.updatePricePlaceholder();
    }
    
    initEventListeners() {
        // Add item button click
        this.addItemBtn.addEventListener('click', () => this.addItem());
        
        // Enter key in price input
        this.itemPriceInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addItem();
            }
        });
        
        // Reset button
        this.resetBtn.addEventListener('click', () => this.resetCalculator());
        
        // Remove last item button
        this.removeLastBtn.addEventListener('click', () => this.removeLastItem());
        
        // Auto-format price input for Czech crowns
        this.itemPriceInput.addEventListener('input', (e) => {
            // Allow only whole numbers for Czech crowns
            let value = e.target.value;
            if (value && !isNaN(value)) {
                // Round to whole numbers (Czech crowns typically don't use decimals)
                e.target.value = Math.round(parseFloat(value));
            }
        });
    }
    
    addItem() {
        const priceInput = this.itemPriceInput.value;
        const itemType = this.itemTypeSelect.value;
        let price = parseFloat(priceInput);
        
        // If no price entered, use the last item's price
        if (isNaN(price) || priceInput === '') {
            if (this.items.length > 0) {
                price = this.items[this.items.length - 1].price;
                this.showSuccess(`Using last item price: ${Math.round(price)} Kč`);
            } else {
                this.showError('Please enter a price for your first item!');
                return;
            }
        }
        
        // Validate price
        if (price <= 0) {
            this.showError('Please enter a valid price!');
            return;
        }
        
        // Create item object
        const item = {
            type: itemType,
            price: price,
            number: this.itemCount + 1
        };
        
        // Add item to array
        this.items.push(item);
        this.itemCount++;
        this.total += price;
        
        // Update displays
        this.updateDisplay();
        this.addItemToList(item);
        
        // Clear input and remove focus (prevent keyboard on mobile)
        this.itemPriceInput.value = '';
        this.itemPriceInput.blur();
        
        // Add success animation
        this.addSuccessAnimation();
    }
    
    removeLastItem() {
        if (this.items.length === 0) {
            this.showError('No items to remove!');
            return;
        }
        
        // Remove last item
        const removedItem = this.items.pop();
        this.itemCount--;
        this.total -= removedItem.price;
        
        // Update displays
        this.updateDisplay();
        this.removeItemFromList();
        
        // Ensure keyboard doesn't open on mobile
        this.itemPriceInput.blur();
    }
    
    resetCalculator() {
        this.items = [];
        this.total = 0;
        this.itemCount = 0;
        
        this.updateDisplay();
        this.clearItemList();
        this.itemPriceInput.value = '';
        this.itemPriceInput.blur();
        
        this.showSuccess('Calculator reset!');
    }
    
    updateDisplay() {
        this.itemCountDisplay.textContent = this.itemCount;
        this.totalAmountDisplay.textContent = Math.round(this.total);
        
        // Update remove button state
        this.removeLastBtn.disabled = this.items.length === 0;
        this.removeLastBtn.style.opacity = this.items.length === 0 ? '0.5' : '1';
        
        // Update price input placeholder with last item's price
        this.updatePricePlaceholder();
    }
    
    addItemToList(item) {
        const itemEntry = document.createElement('div');
        itemEntry.className = 'item-entry';
        itemEntry.innerHTML = `
            <span class="item-number">${item.type} #${item.number}</span>
            <span class="item-price">${Math.round(item.price)} Kč</span>
        `;
        
        this.itemListContainer.appendChild(itemEntry);
        
        // Scroll to bottom if list is long
        this.itemListContainer.scrollTop = this.itemListContainer.scrollHeight;
    }
    
    removeItemFromList() {
        const lastEntry = this.itemListContainer.lastElementChild;
        if (lastEntry) {
            lastEntry.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                this.itemListContainer.removeChild(lastEntry);
            }, 300);
        }
    }
    
    clearItemList() {
        this.itemListContainer.innerHTML = '';
    }
    
    updatePricePlaceholder() {
        if (this.items.length > 0) {
            const lastPrice = Math.round(this.items[this.items.length - 1].price);
            this.itemPriceInput.placeholder = `${lastPrice} (empty = repeat)`;
        } else {
            this.itemPriceInput.placeholder = '50 (empty = repeat)';
        }
    }
    
    addSuccessAnimation() {
        const addBtn = this.addItemBtn;
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

// Initialize the expense tracker when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PubExpenseTracker();
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
    const originalAddItem = PubExpenseTracker.prototype.addItem;
    PubExpenseTracker.prototype.addItem = function() {
        originalAddItem.call(this);
        
        // Celebration for milestones
        if (this.itemCount > 0 && this.itemCount % 5 === 0) {
            this.showSuccess(`🎉 ${this.itemCount} items! You're having a great time!`);
        }
    };
}); 