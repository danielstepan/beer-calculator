// Pub Expense Tracker JavaScript

class PubExpenseTracker {
    constructor() {
        this.items = new Map(); // Using Map to store grouped items by key
        this.total = 0;
        this.itemCount = 0;
        
        // Get DOM elements
        this.itemTypeSelect = document.getElementById('itemType');
        this.itemNameInput = document.getElementById('itemName');
        this.itemPriceInput = document.getElementById('itemPrice');
        this.addItemBtn = document.getElementById('addItem');
        this.resetBtn = document.getElementById('resetBtn');
        this.removeLastBtn = document.getElementById('removeLastBtn');
        this.itemCountDisplay = document.getElementById('itemCount');
        this.totalAmountDisplay = document.getElementById('totalAmount');
        this.itemListContainer = document.getElementById('itemList');
        
        // Initialize event listeners
        this.initEventListeners();
    }
    
    initEventListeners() {
        // Add item button click
        this.addItemBtn.addEventListener('click', () => this.addItem());
        
        // Enter key in inputs
        this.itemNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.itemPriceInput.focus();
            }
        });
        
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
    
    createItemKey(type, name) {
        const itemName = name.trim() || type.split(' ')[1]; // Use type name if no custom name
        return `${type}|${itemName}`;
    }
    
    parseItemKey(key) {
        const [type, name] = key.split('|');
        return { type, name };
    }
    
    addItem() {
        const priceInput = this.itemPriceInput.value;
        const itemType = this.itemTypeSelect.value;
        const itemName = this.itemNameInput.value.trim();
        let price = parseFloat(priceInput);
        
        // Validate price
        if (isNaN(price) || priceInput === '') {
            this.showError('Please enter a valid price!');
            return;
        }
        
        if (price <= 0) {
            this.showError('Please enter a valid price!');
            return;
        }
        
        // Create item key
        const itemKey = this.createItemKey(itemType, itemName);
        
        // Check if item already exists
        if (this.items.has(itemKey)) {
            // Increase quantity
            const existingItem = this.items.get(itemKey);
            existingItem.quantity++;
            this.updateItemInList(itemKey, existingItem);
        } else {
            // Create new item
            const item = {
                type: itemType,
                name: itemName || itemType.split(' ')[1], // Use type name if no custom name
                price: price,
                quantity: 1
            };
            
            this.items.set(itemKey, item);
            this.addItemToList(itemKey, item);
        }
        
        // Update totals
        this.itemCount++;
        this.total += price;
        this.updateDisplay();
        
        // Clear inputs
        this.itemNameInput.value = '';
        this.itemPriceInput.value = '';
        this.itemNameInput.blur();
        this.itemPriceInput.blur();
        
        // Add success animation
        this.addSuccessAnimation();
    }
    
    increaseQuantity(itemKey) {
        const item = this.items.get(itemKey);
        if (item) {
            item.quantity++;
            this.itemCount++;
            this.total += item.price;
            this.updateItemInList(itemKey, item);
            this.updateDisplay();
        }
    }
    
    decreaseQuantity(itemKey) {
        const item = this.items.get(itemKey);
        if (item && item.quantity > 0) {
            item.quantity--;
            this.itemCount--;
            this.total -= item.price;
            
            if (item.quantity === 0) {
                this.items.delete(itemKey);
                this.removeItemFromList(itemKey);
            } else {
                this.updateItemInList(itemKey, item);
            }
            
            this.updateDisplay();
        }
    }
    
    removeLastItem() {
        if (this.items.size === 0) {
            this.showError('No items to remove!');
            return;
        }
        
        // Get the last item
        const keys = Array.from(this.items.keys());
        const lastKey = keys[keys.length - 1];
        const lastItem = this.items.get(lastKey);
        
        // Decrease quantity or remove
        if (lastItem.quantity > 1) {
            lastItem.quantity--;
            this.itemCount--;
            this.total -= lastItem.price;
            this.updateItemInList(lastKey, lastItem);
        } else {
            this.items.delete(lastKey);
            this.itemCount--;
            this.total -= lastItem.price;
            this.removeItemFromList(lastKey);
        }
        
        this.updateDisplay();
        this.itemPriceInput.blur();
    }
    
    resetCalculator() {
        this.items.clear();
        this.total = 0;
        this.itemCount = 0;
        
        this.updateDisplay();
        this.clearItemList();
        this.itemNameInput.value = '';
        this.itemPriceInput.value = '';
        this.itemNameInput.blur();
        this.itemPriceInput.blur();
        
        this.showSuccess('Calculator reset!');
    }
    
    updateDisplay() {
        this.itemCountDisplay.textContent = this.itemCount;
        this.totalAmountDisplay.textContent = Math.round(this.total);
        
        // Update remove button state
        this.removeLastBtn.disabled = this.items.size === 0;
        this.removeLastBtn.style.opacity = this.items.size === 0 ? '0.5' : '1';
    }
    
    addItemToList(itemKey, item) {
        const itemEntry = document.createElement('div');
        itemEntry.className = 'item-entry';
        itemEntry.dataset.itemKey = itemKey;
        
        const { type } = this.parseItemKey(itemKey);
        const emoji = type.split(' ')[0];
        const category = type.split(' ')[1];
        
        // Display logic: show emoji and name only
        let displayName = item.name || category;
        
        itemEntry.innerHTML = `
            <div class="item-main">
                <div class="item-info">
                    <span class="item-emoji">${emoji}</span>
                    <span class="item-name">${displayName}</span>
                </div>
                <div class="quantity-controls">
                    <button class="quantity-btn minus-btn" data-key="${itemKey}">−</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn plus-btn" data-key="${itemKey}">+</button>
                    <span class="item-price">${Math.round(item.price)} Kč</span>
                </div>
            </div>
        `;
        
        // Add event listeners to buttons
        const minusBtn = itemEntry.querySelector('.minus-btn');
        const plusBtn = itemEntry.querySelector('.plus-btn');
        
        minusBtn.addEventListener('click', () => this.decreaseQuantity(itemKey));
        plusBtn.addEventListener('click', () => this.increaseQuantity(itemKey));
        
        this.itemListContainer.appendChild(itemEntry);
        
        // Scroll to bottom if list is long
        this.itemListContainer.scrollTop = this.itemListContainer.scrollHeight;
    }
    
    updateItemInList(itemKey, item) {
        const itemEntry = document.querySelector(`[data-item-key="${itemKey}"]`);
        if (itemEntry) {
            const quantitySpan = itemEntry.querySelector('.quantity');
            quantitySpan.textContent = item.quantity;
            
            // Add pulse animation
            quantitySpan.style.animation = 'pulse 0.3s ease';
            setTimeout(() => {
                quantitySpan.style.animation = '';
            }, 300);
        }
    }
    
    removeItemFromList(itemKey) {
        const itemEntry = document.querySelector(`[data-item-key="${itemKey}"]`);
        if (itemEntry) {
            itemEntry.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                itemEntry.remove();
            }, 300);
        }
    }
    
    clearItemList() {
        this.itemListContainer.innerHTML = '';
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